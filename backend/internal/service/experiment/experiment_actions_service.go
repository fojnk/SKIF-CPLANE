package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/rabbitmq"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/supervisor"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/supervisorstatus"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/supervisorenrich"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

// StartExperiment отправляет полный конфиг в RabbitMQ; запуск выполняет супервизор.
func (p *ExperimentService) StartExperiment(ctx context.Context, experimentID int32, username ...string) error {
	if p.repo.Clients.RabbitMQ == nil {
		return serviceerrors.NewServiceUnavailableError("RabbitMQ не настроен: запуск пайплайна выполняет супервизор", fmt.Errorf("rabbitmq disabled"))
	}

	experiment, err := p.repo.DB.SelectCompleteExperiment(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to select complete experiment", err)
		return serviceerrors.NewNotFoundError("Пайплайн не найден", err)
	}

	_ = experiment.OrchID.String

	experimentData, err := p.repo.DB.CompleteExperimentInfo(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to complete experiment info", err)
		return serviceerrors.NewNotFoundError("Не удалось получить информацию о пайплайне", err)
	}

	req, err := supervisor.RequestFromCompleteInfo(p.repo.Logger, &experimentData)
	if err != nil {
		p.repo.Logger.Error("failed to build skif supervisor experiment request", err)
		return serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось собрать конфиг для супервизора: %s", err.Error()), err)
	}
	if err := supervisorenrich.ApplyExperimentVariables(req, experimentData.Variables); err != nil {
		p.repo.Logger.Error("failed to enrich supervisor request with variables", err)
		return serviceerrors.NewBadRequestError(fmt.Sprintf("Ошибка подстановки переменных: %s", err.Error()), err)
	}

	cfgJSON, err := json.Marshal(req)
	if err != nil {
		p.repo.Logger.Error("failed to marshal supervisor experiment request", err)
		return serviceerrors.NewInternalError("Не удалось сериализовать конфиг", err)
	}

	if pubErr := p.repo.Clients.RabbitMQ.PublishExperimentStart(ctx, cfgJSON); pubErr != nil {
		return serviceerrors.NewServiceUnavailableError("Не удалось отправить задание супервизору (RabbitMQ)", pubErr)
	}

	return nil
}

// StopExperiment отправляет команду остановки супервизору через RabbitMQ.
func (p *ExperimentService) StopExperiment(ctx context.Context, experimentID int32, username ...string) error {
	if p.repo.Clients.RabbitMQ == nil {
		return serviceerrors.NewServiceUnavailableError("RabbitMQ не настроен: остановка пайплайна выполняет супервизор", fmt.Errorf("rabbitmq disabled"))
	}

	experiment, err := p.repo.DB.SelectCompleteExperiment(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to select complete experiment", err)
		return serviceerrors.NewNotFoundError("Пайплайн не найден", err)
	}

	supervisorExperimentID := experiment.OrchID.String
	msg := rabbitmq.MessageExperimentStop{
		ExperimentID:           experimentID,
		SupervisorExperimentID: supervisorExperimentID,
	}
	if pubErr := p.repo.Clients.RabbitMQ.PublishExperimentStop(ctx, msg); pubErr != nil {
		return serviceerrors.NewServiceUnavailableError("Не удалось отправить остановку супервизору (RabbitMQ)", pubErr)
	}

	return nil
}

// GetExperimentStatus при наличии clients.supervisor.base_url опрашивает Java-супервизор, иначе — заглушка.
func (p *ExperimentService) GetExperimentStatus(ctx context.Context, supervisorExperimentID string) responses.ExperimentStatusResponse {
	base := strings.TrimSpace(p.repo.Config.Clients.Supervisor.BaseURL)
	if base == "" {
		return responses.ExperimentStatusResponse{
			Status:  dto.ExperimentStatus("UNKNOWN"),
			Summary: "supervisor",
			Message: "Состояние пайплайна доступно у супервизора. Укажите clients.supervisor.base_url для отображения статуса в UI.",
			Debug:   "",
		}
	}
	id, err := strconv.ParseInt(strings.TrimSpace(supervisorExperimentID), 10, 64)
	if err != nil || id <= 0 {
		return responses.ExperimentStatusResponse{
			Status:  dto.ExperimentStatus("UNKNOWN"),
			Summary: "supervisor",
			Message: "Идентификатор пайплайна в супервизоре (orch_id) должен быть положительным числом",
			Debug:   "",
		}
	}
	timeout := time.Duration(p.repo.Config.Clients.Supervisor.TimeoutMs) * time.Millisecond
	if timeout <= 0 {
		timeout = 5 * time.Second
	}
	cctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()
	st, code, err := supervisorstatus.Fetch(cctx, base, id)
	if err != nil {
		if code == http.StatusNotFound {
			return responses.ExperimentStatusResponse{
				Status:  dto.ExperimentStatus("UNKNOWN"),
				Summary: "supervisor",
				Message: "В супервизоре нет активного запуска с этим experimentId (пайплайн не запускался или orch_id не совпадает).",
				Debug:   err.Error(),
			}
		}
		p.repo.Logger.Error("supervisor status HTTP error", err)
		return responses.ExperimentStatusResponse{
			Status:  dto.ExperimentStatus("UNKNOWN"),
			Summary: "supervisor",
			Message: "Не удалось получить статус у супервизора",
			Debug:   err.Error(),
		}
	}
	run := mapWireStatusToRun(st)
	msg := run.Detail
	if msg == "" {
		msg = fmt.Sprintf("Модель: %s; этап %d из %d", run.CurrentModel, run.CurrentOrder, run.TotalModels)
	}
	return responses.ExperimentStatusResponse{
		Status:     mapJavaSupervisorStatusToDTO(st.Status),
		Summary:    fmt.Sprintf("supervisor: %s", strings.ToUpper(strings.TrimSpace(st.Status))),
		Message:    msg,
		Debug:      "",
		Supervisor: &run,
	}
}

func mapJavaSupervisorStatusToDTO(java string) dto.ExperimentStatus {
	switch strings.ToUpper(strings.TrimSpace(java)) {
	case "QUEUED", "RUNNING":
		return dto.ExperimentStatus("PENDING")
	case "COMPLETED":
		return dto.ExperimentStatus("OK")
	case "FAILED":
		return dto.ExperimentStatus("ERROR")
	case "CANCELLED":
		return dto.ExperimentStatus("WARNING")
	default:
		return dto.ExperimentStatus("UNKNOWN")
	}
}

func mapWireStatusToRun(st *supervisorstatus.WireExperimentStatus) responses.SupervisorExperimentRun {
	jobs := make([]responses.SupervisorModelJob, 0, len(st.ModelStatuses))
	orders := make([]int, 0, len(st.ModelStatuses))
	for k := range st.ModelStatuses {
		i, err := strconv.Atoi(k)
		if err != nil {
			continue
		}
		orders = append(orders, i)
	}
	sort.Ints(orders)
	for _, ord := range orders {
		ms := st.ModelStatuses[strconv.Itoa(ord)]
		jobs = append(jobs, responses.SupervisorModelJob{
			Index:        ord,
			ModelName:    ms.ModelName,
			Status:       ms.Status,
			ErrorMessage: ms.ErrorMessage,
		})
	}
	progress := ""
	if st.TotalModels > 0 {
		progress = fmt.Sprintf("%d / %d", st.CurrentOrder, st.TotalModels)
	}
	return responses.SupervisorExperimentRun{
		ExperimentID:          st.ExperimentID,
		Status:                st.Status,
		CurrentModel:          st.CurrentModel,
		CurrentOrder:          st.CurrentOrder,
		TotalModels:           st.TotalModels,
		Progress:              progress,
		Detail:                st.Detail,
		CancellationRequested: st.CancellationRequested,
		Jobs:                  jobs,
	}
}

// MaxExperimentApplyLogConfigBytes максимальный размер JSON в логе применения конфига.
const MaxExperimentApplyLogConfigBytes = 20000

// TruncateForExperimentLog обрезает строку для поля лога (размер в байтах UTF-8).
func TruncateForExperimentLog(s string, maxBytes int) string {
	if maxBytes <= 0 || len(s) <= maxBytes {
		return s
	}
	return s[:maxBytes] + "\n…(truncated)"
}

// CheckExperimentConfigUpdates проверяет есть ли неприменённые изменения конфига
func (p *ExperimentService) CheckExperimentConfigUpdates(ctx context.Context, experimentID int32) (bool, string, string, error) {
	experimentData, err := p.repo.DB.CompleteExperimentInfo(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get complete experiment info", err)
		return true, "", "Не удалось получить информацию по пайплайну: " + err.Error(), serviceerrors.NewNotFoundError("Не удалось получить информацию по пайплайну", err)
	}

	currOrchConfig, err := p.currentSupervisorConfigJSONFromRow(&experimentData)
	if err != nil {
		p.repo.Logger.Error("failed to build current supervisor config", err)
		return true, "", "Не удалось собрать текущий конфиг: " + err.Error(), serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось собрать текущий конфиг: %s", err.Error()), err)
	}

	appliedVersion, err := p.repo.DB.SelectExperimentAppliedVersion(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to select applied version", err)
		return true, "", currOrchConfig, nil
	}

	changed := appliedVersion.OrchConfig != currOrchConfig

	return changed, appliedVersion.OrchConfig, currOrchConfig, nil
}

func (p *ExperimentService) currentSupervisorConfigJSONFromRow(experimentData *core.CompleteExperimentInfoRow) (string, error) {
	if experimentData == nil {
		return "", fmt.Errorf("complete experiment info is nil")
	}
	if !experimentData.ExperimentConfig.Valid {
		return "", serviceerrors.NewBadRequestError("конфиг пайплайна пуст", nil)
	}
	if supervisor.IsSupervisorExperimentLayout([]byte(experimentData.ExperimentConfig.String)) {
		req, err := supervisor.RequestFromCompleteInfo(p.repo.Logger, experimentData)
		if err != nil {
			return "", serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось собрать конфиг супервизора: %s", err.Error()), err)
		}
		if err := supervisorenrich.ApplyExperimentVariables(req, experimentData.Variables); err != nil {
			return "", serviceerrors.NewBadRequestError(fmt.Sprintf("Ошибка подстановки переменных: %s", err.Error()), err)
		}
		b, err := json.Marshal(req)
		if err != nil {
			return "", serviceerrors.NewInternalError("Не удалось сериализовать конфиг супервизора", err)
		}
		return string(b), nil
	}
	cfg, err := orch.ExperimentInfoToSupervisorPipelineConfig(p.repo.Logger, experimentData)
	if err != nil {
		return "", serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось преобразовать в конфиг супервизора: %s", err.Error()), err)
	}
	b, err := json.Marshal(cfg)
	if err != nil {
		return "", serviceerrors.NewInternalError("Не удалось сериализовать конфиг супервизора", err)
	}
	return string(b), nil
}

var variablePlaceholderPattern = regexp.MustCompile(`\$\{([^}]+)\}`)

func extractVariableNames(config string) []string {
	matches := variablePlaceholderPattern.FindAllStringSubmatch(config, -1)
	varsMap := make(map[string]struct{}, len(matches))

	for _, match := range matches {
		if len(match) > 1 {
			variable := match[1]
			parts := strings.Split(variable, ":")
			if len(parts) == 2 {
				varsMap[parts[1]] = struct{}{}
				continue
			}
			varsMap[variable] = struct{}{}
		}
	}

	result := make([]string, 0, len(varsMap))
	for v := range varsMap {
		result = append(result, v)
	}

	return result
}

func variableExists(known []orch.ExperimentVariable, variable string) bool {
	for _, v := range known {
		if v.Name == variable {
			return true
		}
	}

	return false
}

// FindUnknownExperimentVariables detects variable placeholders in the provided config
// that are missing in the supervisor pipeline configuration for the experiment.
func (p *ExperimentService) FindUnknownExperimentVariables(ctx context.Context, experimentID int32, config string) ([]string, error) {
	experimentData, err := p.repo.DB.CompleteExperimentInfo(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to complete experiment info", err)
		return nil, serviceerrors.NewNotFoundError("Не удалось получить информацию о пайплайне", err)
	}

	var known []orch.ExperimentVariable
	if len(experimentData.Variables) > 0 {
		if err := json.Unmarshal(experimentData.Variables, &known); err != nil {
			p.repo.Logger.Error("failed to unmarshal experiment variables", err)
			return nil, serviceerrors.NewInternalError("Не удалось разобрать переменные пайплайна", err)
		}
	}

	requestedVariables := extractVariableNames(config)

	unknown := make([]string, 0)
	for _, variable := range requestedVariables {
		if !variableExists(known, variable) {
			unknown = append(unknown, variable)
		}
	}

	return unknown, nil
}

// ApplyExperimentConfig отправляет конфигурацию супервизору (RabbitMQ) и сохраняет применённую версию в БД.
func (p *ExperimentService) ApplyExperimentConfig(ctx context.Context, experimentID int32) (string, error) {
	experimentData, err := p.repo.DB.CompleteExperimentInfo(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to complete experiment info", err)
		return "", serviceerrors.NewNotFoundError("Не удалось получить информацию о пайплайне", err)
	}

	req, err := supervisor.RequestFromCompleteInfo(p.repo.Logger, &experimentData)
	if err != nil {
		p.repo.Logger.Error("failed to build skif supervisor experiment request", err)
		return "", serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось собрать конфиг супервизора: %s", err.Error()), err)
	}
	if err := supervisorenrich.ApplyExperimentVariables(req, experimentData.Variables); err != nil {
		p.repo.Logger.Error("failed to enrich supervisor request with variables", err)
		return "", serviceerrors.NewBadRequestError(fmt.Sprintf("Ошибка подстановки переменных: %s", err.Error()), err)
	}

	cfgJSON, err := json.Marshal(req)
	if err != nil {
		p.repo.Logger.Error("failed to marshal supervisor experiment request", err)
		return "", serviceerrors.NewInternalError("Не удалось сериализовать конфиг супервизора", err)
	}

	if p.repo.Clients.RabbitMQ == nil {
		return "", serviceerrors.NewServiceUnavailableError("RabbitMQ не настроен: применение конфигурации делает супервизор", fmt.Errorf("rabbitmq disabled"))
	}

	if pubErr := p.repo.Clients.RabbitMQ.PublishExperimentApply(ctx, cfgJSON); pubErr != nil {
		return "", serviceerrors.NewServiceUnavailableError("Не удалось отправить применение конфигурации супервизору (RabbitMQ)", pubErr)
	}

	templateID, err := p.repo.DB.BaseTemplateIDByExperimentID(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to retrieve template ID", err)
		return "", serviceerrors.NewNotFoundError("Не удалось получить ID шаблона", err)
	}

	err = p.repo.DB.InsertExperimentAppliedVersion(ctx, core.InsertExperimentAppliedVersionParams{
		ExperimentID:   experimentData.ExperimentID,
		CurrentVersion: templateID,
		OrchConfig:     string(cfgJSON),
	})
	if err != nil {
		p.repo.Logger.Error("failed to insert applied version", err)
		return "", serviceerrors.NewInternalError("Не удалось сохранить примененную версию", err)
	}

	return string(cfgJSON), nil
}

// GetSupervisorConfig возвращает JSON-конфиг пайплайна для супервизора.
func (p *ExperimentService) GetSupervisorConfig(ctx context.Context, experimentID int32) (string, error) {
	experimentData, err := p.repo.DB.CompleteExperimentInfo(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get experiment info", err)
		return "", serviceerrors.NewNotFoundError("Не удалось получить информацию о пайплайне", err)
	}
	s, err := p.currentSupervisorConfigJSONFromRow(&experimentData)
	if err != nil {
		p.repo.Logger.Error("failed to marshal supervisor config", err)
		return "", err
	}
	return s, nil
}

// Experiment Datasets

// AddDatasetToExperiment добавляет dataset к experiment
func (p *ExperimentService) AddDatasetToExperiment(ctx context.Context, experimentID, datasetID int32, alias string) (int32, *dto.Dataset, int32, string, string, error) {
	dataset, err := p.repo.DB.SelectDataset(ctx, datasetID)
	if err != nil {
		p.repo.Logger.Error("failed to select dataset", err)
		return 0, nil, 0, "", "", serviceerrors.NewNotFoundError("Dataset не найден", err)
	}

	projectID, err := p.repo.DB.GetExperimentProject(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get experiment project", err)
		return 0, nil, 0, "", "", serviceerrors.NewNotFoundError("Проект пайплайна не найден", err)
	}

	// Проверки доступности dataset
	if !dataset.ProjectID.Valid {
		return 0, nil, 0, "", "", serviceerrors.NewBadRequestError("Dataset не привязан к проекту", nil)
	}

	if projectID != dataset.ProjectID.Int32 && !dataset.Public {
		return 0, nil, 0, "", "", serviceerrors.NewForbiddenError("Dataset не является публичным", nil)
	}

	linkID, err := p.repo.DB.InsertExperimentDataset(ctx, core.InsertExperimentDatasetParams{
		ExperimentID: experimentID,
		DatasetID:    datasetID,
		Alias:        alias,
	})
	if err != nil {
		p.repo.Logger.Error("failed to add dataset to experiment", err)
		return 0, nil, 0, "", "", serviceerrors.NewInternalError("Не удалось добавить dataset к пайплайну", err)
	}

	result := &dto.Dataset{
		ID:      dataset.ID,
		Name:    dataset.Name,
		Type:    dataset.Type,
		Public:  dataset.Public,
		Managed: dataset.Managed,
	}

	var dsProjectID int32
	var dsProjectName string
	if dataset.ProjectID.Valid {
		dsProjectID = dataset.ProjectID.Int32
		project, err := p.repo.DB.SelectProjectWithoutPin(ctx, dataset.ProjectID.Int32)
		if err == nil {
			dsProjectName = project.Name
		}
	}

	return linkID, result, dsProjectID, alias, dsProjectName, nil
}

// RemoveDatasetFromExperiment удаляет dataset из experiment
func (p *ExperimentService) RemoveDatasetFromExperiment(ctx context.Context, experimentID, linkID int32) (*dto.Dataset, error) {
	datasetLink, err := p.repo.DB.DatasetFromLink(ctx, linkID)
	if err != nil {
		p.repo.Logger.Error("failed to select dataset for log", err)
		return nil, serviceerrors.NewNotFoundError("Связь dataset не найдена", err)
	}

	dataset, err := p.repo.DB.SelectDataset(ctx, datasetLink.ID)
	if err != nil {
		p.repo.Logger.Error("failed to select full dataset info", err)
		return nil, serviceerrors.NewNotFoundError("Dataset не найден", err)
	}

	err = p.repo.DB.DeleteExperimentDataset(ctx, core.DeleteExperimentDatasetParams{
		ID:           linkID,
		ExperimentID: experimentID,
	})
	if err != nil {
		p.repo.Logger.Error("failed to delete experiment dataset", err)
		return nil, serviceerrors.NewInternalError("Не удалось удалить связь dataset с пайплайном", err)
	}

	result := &dto.Dataset{
		ID:     dataset.ID,
		Name:   dataset.Name,
		Type:   dataset.Type,
		Params: dataset.Params,
		Schema: dataset.Schema,
	}

	return result, nil
}

// UpdateExperimentDataset обновляет alias dataset в experiment
func (p *ExperimentService) UpdateExperimentDataset(ctx context.Context, experimentID, linkID int32, newAlias string) (string, *dto.Dataset, *dto.Dataset, error) {
	oldDatasetLink, err := p.repo.DB.DatasetFromLink(ctx, linkID)
	if err != nil {
		p.repo.Logger.Error("failed to select dataset for update", err)
		return "", nil, nil, serviceerrors.NewNotFoundError("Связь dataset не найдена", err)
	}

	oldDataset, err := p.repo.DB.SelectDataset(ctx, oldDatasetLink.ID)
	if err != nil {
		p.repo.Logger.Error("failed to select full old dataset info", err)
		return "", nil, nil, serviceerrors.NewNotFoundError("Dataset не найден", err)
	}

	err = p.repo.DB.UpdateExperimentDataset(ctx, core.UpdateExperimentDatasetParams{
		ID:           linkID,
		ExperimentID: experimentID,
		Alias:        newAlias,
	})
	if err != nil {
		p.repo.Logger.Error("failed to update experiment dataset link", err)
		return "", nil, nil, serviceerrors.NewInternalError("Не удалось обновить связь dataset с пайплайном", err)
	}

	newDatasetLink, err := p.repo.DB.DatasetFromLink(ctx, linkID)
	if err != nil {
		p.repo.Logger.Error("failed to select updated dataset", err)
		return "", nil, nil, serviceerrors.NewNotFoundError("Обновленная связь dataset не найдена", err)
	}

	newDataset, err := p.repo.DB.SelectDataset(ctx, newDatasetLink.ID)
	if err != nil {
		p.repo.Logger.Error("failed to select full new dataset info", err)
		return "", nil, nil, serviceerrors.NewNotFoundError("Обновленный dataset не найден", err)
	}

	oldDS := &dto.Dataset{
		ID:   oldDataset.ID,
		Name: oldDataset.Name,
	}

	newDS := &dto.Dataset{
		ID:   newDataset.ID,
		Name: newDataset.Name,
	}

	return newAlias, oldDS, newDS, nil
}

// GetExperimentDatasets возвращает список datasets в experiment
func (p *ExperimentService) GetExperimentDatasets(ctx context.Context, experimentID int32) ([]dto.ExperimentDataset, error) {
	datasets, err := p.repo.DB.GetExperimentDatasets(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get datasets", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить список datasets пайплайна", err)
	}

	result := make([]dto.ExperimentDataset, len(datasets))
	for i, dataset := range datasets {
		result[i] = dto.ExperimentDataset{
			LinkID:      dataset.LinkID,
			DatasetID:   dataset.DatasetID,
			Name:        dataset.Name,
			Alias:       dataset.Alias,
			ProjectID:   dataset.ProjectID,
			ProjectName: dataset.ProjectName,
		}
	}

	return result, nil
}

// GetExperimentAvailableDatasets возвращает список datasets доступных для подключения к experiment
func (p *ExperimentService) GetExperimentAvailableDatasets(ctx context.Context, experimentID int32, params core.SelectDatasetsParams) ([]dto.DatasetShort, int64, error) {
	availableToLink := true
	params.Experiment = experimentID
	params.AvailableToLink = &availableToLink

	projectDatasets, err := p.repo.DB.SelectDatasets(ctx, params)
	if err != nil {
		p.repo.Logger.Error("failed to get datasets", err)
		return nil, 0, serviceerrors.NewInternalError("Не удалось получить доступные datasets", err)
	}

	var total int64
	list := make([]dto.DatasetShort, len(projectDatasets))
	for i, ds := range projectDatasets {
		total = ds.Total

		list[i] = dto.DatasetShort{
			ID:     ds.ID,
			Name:   ds.Name,
			Type:   ds.Type,
			Public: ds.Public,
			NamespaceInfo: dto.Namespace{
				ID:   ds.NamespaceID.Int32,
				Name: ds.NamespaceName.String,
			},
			ProjectInfo: dto.ProjectCatalogInfo{
				ID:            ds.ProjectID.Int32,
				Name:          ds.ProjectName.String,
				NamespaceID:   ds.NamespaceID.Int32,
				NamespaceName: ds.NamespaceName.String,
			},
		}
	}

	return list, total, nil
}

// Experiment Variables

// CreateExperimentVariable создает новую переменную experiment
func (p *ExperimentService) CreateExperimentVariable(ctx context.Context, experimentID int32, name, value, varType, comment, creator string) (*dto.ExperimentVariable, int32, error) {
	variable, err := p.repo.DB.InsertExperimentVariable(ctx, core.InsertExperimentVariableParams{
		ExperimentID: experimentID,
		Name:         name,
	})
	if err != nil {
		p.repo.Logger.Error("failed to insert variable", err)
		return nil, 0, serviceerrors.NewInternalError("Не удалось создать переменную", err)
	}

	variableVersion, err := p.repo.DB.InsertExperimentVariableVersion(ctx, core.InsertExperimentVariableVersionParams{
		VariableID: pgtype.Int4{Int32: variable, Valid: true},
		Value:      value,
		Type:       varType,
		Comment:    comment,
		Creator:    creator,
	})
	if err != nil {
		p.repo.Logger.Error("failed to insert variable version", err)
		return nil, 0, serviceerrors.NewInternalError("Не удалось создать версию переменной", err)
	}

	updatedVar, err := p.repo.DB.UpdateExperimentVariableVersion(ctx, core.UpdateExperimentVariableVersionParams{
		ID:        variable,
		VersionID: variableVersion.ID,
	})
	if err != nil {
		p.repo.Logger.Error("failed to update variable version", err)
		return nil, 0, serviceerrors.NewInternalError("Не удалось обновить версию переменной", err)
	}

	experiment, err := p.repo.DB.SelectExperiment(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to select experiment", err)
		return nil, 0, serviceerrors.NewNotFoundError("Пайплайн не найден", err)
	}

	return &dto.ExperimentVariable{
		ID:        variable,
		Name:      updatedVar.Name,
		Value:     variableVersion.Value,
		Type:      variableVersion.Type,
		VersionID: variableVersion.ID,
	}, experiment.ProjectID, nil
}

// UpdateExperimentVariable обновляет переменную experiment
func (p *ExperimentService) UpdateExperimentVariable(ctx context.Context, variableID int32, name, value, varType, comment, creator string) (*dto.ExperimentVariable, *dto.ExperimentVariable, int32, error) {
	variable, err := p.repo.DB.SelectExperimentVariable(ctx, variableID)
	if err != nil {
		p.repo.Logger.Error("failed to select variable", err)
		return nil, nil, 0, serviceerrors.NewNotFoundError("Переменная не найдена", err)
	}

	oldVariable := &dto.ExperimentVariable{
		ID:    variable.ID,
		Name:  variable.Name,
		Value: variable.Value,
		Type:  variable.Type,
	}

	// Обновляем имя если изменилось
	if name != "" && variable.Name != name {
		err = p.repo.DB.UpdateExperimentVariable(ctx, core.UpdateExperimentVariableParams{
			ID:   variableID,
			Name: name,
		})
		if err != nil {
			p.repo.Logger.Error("failed to update variable name", err)
			return nil, nil, 0, serviceerrors.NewInternalError("Не удалось обновить имя переменной", err)
		}
	}

	// Обновляем значение или тип если изменились
	if (value != "" && variable.Value != value) || (varType != "" && variable.Type != varType) {
		finalValue := variable.Value
		if value != "" {
			finalValue = value
		}

		finalType := variable.Type
		if varType != "" {
			finalType = varType
		}

		variableVersion, err := p.repo.DB.InsertExperimentVariableVersion(ctx, core.InsertExperimentVariableVersionParams{
			VariableID: pgtype.Int4{Int32: variable.ID, Valid: true},
			Value:      finalValue,
			Type:       finalType,
			Comment:    comment,
			Creator:    creator,
		})
		if err != nil {
			p.repo.Logger.Error("failed to insert variable version", err)
			return nil, nil, 0, serviceerrors.NewInternalError("Не удалось создать версию переменной", err)
		}

		_, err = p.repo.DB.UpdateExperimentVariableVersion(ctx, core.UpdateExperimentVariableVersionParams{
			ID:        variable.ID,
			VersionID: variableVersion.ID,
		})
		if err != nil {
			p.repo.Logger.Error("failed to update variable version", err)
			return nil, nil, 0, serviceerrors.NewInternalError("Не удалось обновить версию переменной", err)
		}
	}

	newVariable, err := p.repo.DB.SelectExperimentVariable(ctx, variableID)
	if err != nil {
		p.repo.Logger.Error("failed to select updated variable", err)
		return nil, nil, 0, serviceerrors.NewNotFoundError("Обновленная переменная не найдена", err)
	}

	experiment, err := p.repo.DB.SelectExperiment(ctx, variable.ExperimentID)
	if err != nil {
		p.repo.Logger.Error("failed to select experiment", err)
		return nil, nil, 0, serviceerrors.NewNotFoundError("Пайплайн не найден", err)
	}

	newVar := &dto.ExperimentVariable{
		ID:        newVariable.ID,
		Name:      newVariable.Name,
		Value:     newVariable.Value,
		Type:      newVariable.Type,
		VersionID: newVariable.VersionID,
	}

	return oldVariable, newVar, experiment.ProjectID, nil
}

// DeleteExperimentVariable удаляет переменную experiment
func (p *ExperimentService) DeleteExperimentVariable(ctx context.Context, variableID int32) (*dto.ExperimentVariable, int32, error) {
	variable, err := p.repo.DB.SelectExperimentVariable(ctx, variableID)
	if err != nil {
		p.repo.Logger.Error("failed to select variable", err)
		return nil, 0, serviceerrors.NewNotFoundError("Переменная не найдена", err)
	}

	err = p.repo.DB.DeleteExperimentVariableByExperimentID(ctx, variableID)
	if err != nil {
		p.repo.Logger.Error("failed to delete variable", err)
		return nil, 0, serviceerrors.NewInternalError("Не удалось удалить переменную", err)
	}

	experiment, err := p.repo.DB.SelectExperiment(ctx, variable.ExperimentID)
	if err != nil {
		p.repo.Logger.Error("failed to select experiment", err)
		return nil, 0, serviceerrors.NewNotFoundError("Пайплайн не найден", err)
	}

	result := &dto.ExperimentVariable{
		ID:    variable.ID,
		Name:  variable.Name,
		Value: variable.Value,
		Type:  variable.Type,
	}

	return result, experiment.ProjectID, nil
}

// GetExperimentVariables возвращает список переменных experiment
func (p *ExperimentService) GetExperimentVariables(ctx context.Context, experimentID int32) ([]dto.ExperimentVariableShort, error) {
	variables, err := p.repo.DB.GetExperimentVariables(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get experiment variables", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить список переменных", err)
	}

	result := make([]dto.ExperimentVariableShort, len(variables))
	for i, variable := range variables {
		result[i] = dto.ExperimentVariableShort{
			ID:            variable.ID,
			Name:          variable.Name,
			Type:          variable.Type,
			VersionID:     variable.VersionID,
			VersionIDName: variable.VersionNameID,
			UpdatedAt:     variable.UpdatedAt.Time,
		}
	}

	return result, nil
}

// GetExperimentVariable возвращает переменную experiment по ID
func (p *ExperimentService) GetExperimentVariable(ctx context.Context, variableID int32) (*dto.ExperimentVariable, error) {
	variable, err := p.repo.DB.SelectExperimentVariable(ctx, variableID)
	if err != nil {
		p.repo.Logger.Error("failed to select variable", err)
		return nil, serviceerrors.NewNotFoundError("Переменная не найдена", err)
	}

	return &dto.ExperimentVariable{
		ID:            variable.ID,
		Name:          variable.Name,
		Value:         variable.Value,
		Type:          variable.Type,
		VersionID:     variable.VersionID,
		VersionIDName: variable.VersionIDName,
		ExperimentID:  variable.ExperimentID,
	}, nil
}

// GetExperimentVariableByName возвращает переменную experiment по имени
func (p *ExperimentService) GetExperimentVariableByName(ctx context.Context, experimentID int32, name string) (*dto.ExperimentVariable, error) {
	variable, err := p.repo.DB.SelectExperimentVariableV2(ctx, core.SelectExperimentVariableV2Params{
		ExperimentID: experimentID,
		Name:         name,
	})
	if err != nil {
		p.repo.Logger.Error("failed to select variable by name", err)
		return nil, serviceerrors.NewNotFoundError("Переменная не найдена", err)
	}

	return &dto.ExperimentVariable{
		ID:           variable.ID,
		Name:         variable.Name,
		Value:        variable.Value,
		Type:         variable.Type,
		VersionID:    variable.VersionID,
		ExperimentID: variable.ExperimentID,
	}, nil
}

// UpdateExperimentVariableByName обновляет переменную experiment по имени (создает если не существует)
func (p *ExperimentService) UpdateExperimentVariableByName(ctx context.Context, experimentID int32, name, value, varType, comment, creator string) (*dto.ExperimentVariable, *dto.ExperimentVariable, int32, bool, error) {
	variable, err := p.repo.DB.SelectExperimentVariableV2(ctx, core.SelectExperimentVariableV2Params{
		ExperimentID: experimentID,
		Name:         name,
	})

	isNew := false
	if err != nil {
		// Переменная не существует, создаем новую
		newVar, projectID, err := p.CreateExperimentVariable(ctx, experimentID, name, value, varType, comment, creator)
		if err != nil {
			return nil, nil, 0, false, err
		}
		return nil, newVar, projectID, true, nil
	}

	// Переменная существует, обновляем её
	oldVar, newVar, projectID, err := p.UpdateExperimentVariable(ctx, variable.ID, "", value, varType, comment, creator)
	if err != nil {
		return nil, nil, 0, false, err
	}

	return oldVar, newVar, projectID, isNew, nil
}

// DeleteExperimentVariableByName удаляет переменную experiment по имени
func (p *ExperimentService) DeleteExperimentVariableByName(ctx context.Context, experimentID int32, name string) (*dto.ExperimentVariable, int32, error) {
	variable, err := p.repo.DB.SelectExperimentVariableV2(ctx, core.SelectExperimentVariableV2Params{
		ExperimentID: experimentID,
		Name:         name,
	})
	if err != nil {
		p.repo.Logger.Error("failed to select variable by name", err)
		return nil, 0, serviceerrors.NewNotFoundError("Переменная не найдена", err)
	}

	return p.DeleteExperimentVariable(ctx, variable.ID)
}

// GetExperimentURLs генерирует URLs для experiment
func (p *ExperimentService) GetExperimentURLs(ctx context.Context, experimentID int32) ([]dto.ExperimentURL, error) {
	experimentIDStr := strconv.Itoa(int(experimentID))

	ytWorkDir, err := orch.GetYTWorkDir(ctx, p.repo.DB, p.repo.Logger, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get yt work dir", err)
		ytWorkDir = ""
	}

	projectIDInt, err := p.repo.DB.GetExperimentProject(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get experiment project", err)
	}
	projectID := strconv.Itoa(int(projectIDInt))

	// Создаем URLs из конфига
	responseURLs := make([]dto.ExperimentURL, len(p.repo.Config.ExperimentURLs))
	i := 0
	for _, url := range p.repo.Config.ExperimentURLs {
		newURL := strings.ReplaceAll(url.URL, "EXPERIMENT_ID", experimentIDStr)
		newURL = strings.ReplaceAll(newURL, "YT_WORK_DIR", ytWorkDir)
		newURL = strings.ReplaceAll(newURL, "PROJECT_ID", projectID)

		responseURLs[i] = dto.ExperimentURL{
			URL:  newURL,
			Name: url.Name,
		}
		i++
	}

	slices.SortFunc(responseURLs, func(a, b dto.ExperimentURL) int {
		return strings.Compare(a.Name, b.Name)
	})

	return responseURLs, nil
}

// GetExperimentGrafanaURL возвращает Grafana URL для experiment
func (p *ExperimentService) GetExperimentGrafanaURL(ctx context.Context, experimentID int32) (*dto.ExperimentURL, error) {
	experimentIDStr := strconv.Itoa(int(experimentID))

	ytWorkDir, err := orch.GetYTWorkDir(ctx, p.repo.DB, p.repo.Logger, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get yt work dir", err)
		return nil, err
	}

	url, ok := p.repo.Config.ExperimentURLs["grafana"]
	if !ok {
		return nil, serviceerrors.NewNotFoundError("Grafana URL не найден в конфигурации", nil)
	}

	newURL := strings.ReplaceAll(url.URL, "EXPERIMENT_ID", experimentIDStr)
	newURL = strings.ReplaceAll(newURL, "YT_WORK_DIR", ytWorkDir)

	return &dto.ExperimentURL{
		URL:  newURL,
		Name: url.Name,
	}, nil
}

// Helper methods for internal use

// GetDatasetFromLinkByAlias получает ID и alias dataset по alias в experiment
func (p *ExperimentService) GetDatasetFromLinkByAlias(ctx context.Context, experimentID int32, alias string) (int32, string, error) {
	dataset, err := p.repo.DB.DatasetFromLinkByAlias(ctx, core.DatasetFromLinkByAliasParams{
		Alias:        alias,
		ExperimentID: experimentID,
	})
	if err != nil {
		return 0, "", serviceerrors.NewNotFoundError("Dataset с указанным alias не найден", err)
	}
	return dataset.ID, dataset.Alias, nil
}

// DeleteExperimentDatasetByID удаляет связь dataset с experiment по ID связи
func (p *ExperimentService) DeleteExperimentDatasetByID(ctx context.Context, linkID, experimentID int32) error {
	return p.repo.DB.DeleteExperimentDataset(ctx, core.DeleteExperimentDatasetParams{
		ID:           linkID,
		ExperimentID: experimentID,
	})
}

// InsertExperimentDatasetLink создает новую связь dataset с experiment
func (p *ExperimentService) InsertExperimentDatasetLink(ctx context.Context, experimentID, datasetID int32, alias string) (int32, error) {
	return p.repo.DB.InsertExperimentDataset(ctx, core.InsertExperimentDatasetParams{
		ExperimentID: experimentID,
		DatasetID:    datasetID,
		Alias:        alias,
	})
}

// UpdateExperimentDatasetLinkID обновляет ID dataset в существующей связи
func (p *ExperimentService) UpdateExperimentDatasetLinkID(ctx context.Context, linkID, newDatasetID, experimentID int32) error {
	return p.repo.DB.UpdateExperimentDatasetIDInLink(ctx, core.UpdateExperimentDatasetIDInLinkParams{
		ID:           linkID,
		DatasetID:    newDatasetID,
		ExperimentID: experimentID,
	})
}

// GetExperimentDatasetByLink получает dataset по alias в experiment
func (p *ExperimentService) GetExperimentDatasetByLink(ctx context.Context, experimentID int32, alias string) (*dto.ExperimentDataset, error) {
	ds, err := p.repo.DB.GetExperimentDataset(ctx, core.GetExperimentDatasetParams{
		ExperimentID: experimentID,
		Alias:        alias,
	})
	if err != nil {
		return nil, serviceerrors.NewNotFoundError("Dataset не найден", err)
	}

	return &dto.ExperimentDataset{
		LinkID:      ds.LinkID,
		DatasetID:   ds.DatasetID,
		Name:        ds.Name,
		Alias:       ds.Alias,
		ProjectID:   ds.ProjectID,
		ProjectName: ds.ProjectName,
	}, nil
}

// RemoveDatasetFromExperimentByAlias удаляет связь по alias в рамках одного вызова сервиса
func (p *ExperimentService) RemoveDatasetFromExperimentByAlias(ctx context.Context, experimentID int32, alias string) (*dto.ExperimentDataset, error) {
	ds, err := p.GetExperimentDatasetByLink(ctx, experimentID, alias)
	if err != nil {
		return nil, serviceerrors.NewNotFoundError("Dataset с указанным alias не найден", err)
	}
	if err := p.DeleteExperimentDatasetByID(ctx, ds.LinkID, experimentID); err != nil {
		return nil, serviceerrors.NewInternalError("Не удалось удалить связь dataset", err)
	}
	return ds, nil
}

// GetSupervisorExperimentID возвращает идентификатор пайплайна в рантайме супервизора (поле orch_id в БД).
func (p *ExperimentService) GetSupervisorExperimentID(ctx context.Context, experimentID int32) (string, error) {
	experiment, err := p.repo.DB.SelectCompleteExperiment(ctx, experimentID)
	if err != nil {
		return "", serviceerrors.NewNotFoundError("Пайплайн не найден", err)
	}
	return experiment.OrchID.String, nil
}

// GetDatasetFromLink получает ID и alias dataset по ID связи
func (p *ExperimentService) GetDatasetFromLink(ctx context.Context, linkID int32) (int32, string, error) {
	dataset, err := p.repo.DB.DatasetFromLink(ctx, linkID)
	if err != nil {
		return 0, "", serviceerrors.NewNotFoundError("Связь dataset не найдена", err)
	}
	return dataset.ID, dataset.Alias, nil
}

// UpdateExperimentDatasetAlias обновляет alias dataset в существующей связи
func (p *ExperimentService) UpdateExperimentDatasetAlias(ctx context.Context, linkID, experimentID int32, newAlias string) error {
	return p.repo.DB.UpdateExperimentDataset(ctx, core.UpdateExperimentDatasetParams{
		ID:           linkID,
		ExperimentID: experimentID,
		Alias:        newAlias,
	})
}

// Legacy variable methods (v1 API)

// UpdateExperimentVariableName обновляет имя переменной
func (p *ExperimentService) UpdateExperimentVariableName(ctx context.Context, variableID int32, newName string) error {
	return p.repo.DB.UpdateExperimentVariable(ctx, core.UpdateExperimentVariableParams{
		ID:   variableID,
		Name: newName,
	})
}

// InsertExperimentVariableVersionAndSetCurrent создает новую версию переменной и устанавливает её как текущую
func (p *ExperimentService) InsertExperimentVariableVersionAndSetCurrent(ctx context.Context, variableID int32, value, varType string) error {
	variableVersion, err := p.repo.DB.InsertExperimentVariableVersion(ctx, core.InsertExperimentVariableVersionParams{
		VariableID: pgtype.Int4{Int32: variableID, Valid: true},
		Value:      value,
		Type:       varType,
	})
	if err != nil {
		return serviceerrors.NewInternalError("Не удалось создать версию переменной", err)
	}

	_, err = p.repo.DB.UpdateExperimentVariableVersion(ctx, core.UpdateExperimentVariableVersionParams{
		ID:        variableID,
		VersionID: variableVersion.ID,
	})
	if err != nil {
		return serviceerrors.NewInternalError("Не удалось обновить текущую версию переменной", err)
	}
	return nil
}

// InsertExperimentVariableVersionAndSetCurrentWithMeta создает новую версию переменной с метаданными
func (p *ExperimentService) InsertExperimentVariableVersionAndSetCurrentWithMeta(ctx context.Context, variableID int32, value, varType, comment, creator string) error {
	variableVersion, err := p.repo.DB.InsertExperimentVariableVersion(ctx, core.InsertExperimentVariableVersionParams{
		VariableID: pgtype.Int4{Int32: variableID, Valid: true},
		Value:      value,
		Type:       varType,
		Comment:    comment,
		Creator:    creator,
	})
	if err != nil {
		return serviceerrors.NewInternalError("Не удалось создать версию переменной", err)
	}

	_, err = p.repo.DB.UpdateExperimentVariableVersion(ctx, core.UpdateExperimentVariableVersionParams{
		ID:        variableID,
		VersionID: variableVersion.ID,
	})
	if err != nil {
		return serviceerrors.NewInternalError("Не удалось обновить текущую версию переменной", err)
	}
	return nil
}

// DeleteExperimentVariableByID удаляет переменную по ID
func (p *ExperimentService) DeleteExperimentVariableByID(ctx context.Context, variableID int32) error {
	return p.repo.DB.DeleteExperimentVariableByExperimentID(ctx, variableID)
}
