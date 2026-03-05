package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"slices"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/orchestrator/client"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

// StartExperiment запускает experiment через jobd (если доступен) или напрямую через orchestrator
func (p *ExperimentService) StartExperiment(ctx context.Context, experimentID int32, username ...string) error {
	experiment, err := p.repo.DB.SelectCompleteExperiment(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to select complete experiment", err)
		return serviceerrors.NewNotFoundError("Пайплайн не найден", err)
	}

	orchID := experiment.OrchID.String

	// Если jobd доступен, создаем джобу
	if p.repo.Clients.Jobd != nil && len(username) > 0 && username[0] != "" {
		entity := &clients.LinkedEntity{
			Type: "experiment",
			Id:   int64(experimentID),
		}

		execTarget := "orchestrator"
		tags := []string{"experiment", "start"}
		jobName := fmt.Sprintf("start-experiment-%d", experimentID)
		desc := fmt.Sprintf("Start experiment %d", experimentID)
		jobConfig := map[string]interface{}{
			"experiment_id": orchID,
		}

		stepDesc := "Start experiment"
		stepOrder := int32(0)
		stepConfig := map[string]interface{}{
			"type":        "experiment_start",
			"experiment_id": orchID,
		}
		steps := []clients.CreateStep{
			{
				Name:        "start_experiment",
				Description: &stepDesc,
				Order:       &stepOrder,
				Config:      &stepConfig,
			},
		}

		createJobReq := clients.CreateJobRequest{
			Name:            jobName,
			Description:     &desc,
			Type:            "experiment_start",
			ExecutionTarget: &execTarget,
			Config:          &jobConfig,
			Entity:          entity,
			Tags:            &tags,
			Steps:           &steps,
		}

		ctxWithUserID := clients.WithUserID(ctx, username[0])
		jobResp, err := p.repo.Clients.Jobd.CreateJob(ctxWithUserID, createJobReq)
		if err != nil {
			p.repo.Logger.Error("failed to create start experiment job in jobd, falling back to direct orchestrator call", err)
			// Fallback to direct orchestrator call
		} else {
			var jobID int64
			if jobResp.Job != nil && jobResp.Job.Id != nil {
				jobID = *jobResp.Job.Id
			}
			p.repo.Logger.Info(fmt.Sprintf("Start experiment job created in jobd: job_id=%d, experiment_id=%d", jobID, experimentID))
			return nil
		}
	}

	// Fallback: прямой вызов orchestrator
	resp, err := p.repo.Clients.Orchestrator.Client.PostV1ExperimentsStartWithResponse(ctx, &client.PostV1ExperimentsStartParams{
		ExperimentId: orchID,
	}, client.PostV1ExperimentsStartJSONRequestBody(make(map[string]interface{})))
	if err != nil || resp == nil || resp.HTTPResponse == nil {
		p.repo.Logger.Error("failed to start experiment", err)
		return serviceerrors.NewServiceUnavailableError("Оркестратор недоступен", err)
	}

	if resp.HTTPResponse.StatusCode != http.StatusOK {
		return serviceerrors.NewInternalError(fmt.Sprintf("Оркестратор вернул статус %d", resp.HTTPResponse.StatusCode), fmt.Errorf("%s", string(resp.Body)))
	}

	return nil
}

// StopExperiment останавливает experiment через jobd (если доступен) или напрямую через orchestrator
func (p *ExperimentService) StopExperiment(ctx context.Context, experimentID int32, username ...string) error {
	experiment, err := p.repo.DB.SelectCompleteExperiment(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to select complete experiment", err)
		return serviceerrors.NewNotFoundError("Пайплайн не найден", err)
	}

	orchID := experiment.OrchID.String

	// Если jobd доступен, создаем джобу
	if p.repo.Clients.Jobd != nil && len(username) > 0 && username[0] != "" {
		entity := &clients.LinkedEntity{
			Type: "experiment",
			Id:   int64(experimentID),
		}

		execTarget := "orchestrator"
		tags := []string{"experiment", "stop"}
		jobName := fmt.Sprintf("stop-experiment-%d", experimentID)
		desc := fmt.Sprintf("Stop experiment %d", experimentID)
		jobConfig := map[string]interface{}{
			"experiment_id": orchID,
		}

		stepDesc := "Stop experiment"
		stepOrder := int32(0)
		stepConfig := map[string]interface{}{
			"type":        "experiment_stop",
			"experiment_id": orchID,
		}
		steps := []clients.CreateStep{
			{
				Name:        "stop_experiment",
				Description: &stepDesc,
				Order:       &stepOrder,
				Config:      &stepConfig,
			},
		}

		createJobReq := clients.CreateJobRequest{
			Name:            jobName,
			Description:     &desc,
			Type:            "experiment_stop",
			ExecutionTarget: &execTarget,
			Config:          &jobConfig,
			Entity:          entity,
			Tags:            &tags,
			Steps:           &steps,
		}

		ctxWithUserID := clients.WithUserID(ctx, username[0])
		jobResp, err := p.repo.Clients.Jobd.CreateJob(ctxWithUserID, createJobReq)
		if err != nil {
			p.repo.Logger.Error("failed to create stop experiment job in jobd, falling back to direct orchestrator call", err)
			// Fallback to direct orchestrator call
		} else {
			var jobID int64
			if jobResp.Job != nil && jobResp.Job.Id != nil {
				jobID = *jobResp.Job.Id
			}
			p.repo.Logger.Info(fmt.Sprintf("Stop experiment job created in jobd: job_id=%d, experiment_id=%d", jobID, experimentID))
			return nil
		}
	}

	// Fallback: прямой вызов orchestrator
	resp, err := p.repo.Clients.Orchestrator.Client.PostV1ExperimentsStopWithResponse(ctx, &client.PostV1ExperimentsStopParams{
		ExperimentId: orchID,
	}, client.PostV1ExperimentsStopJSONRequestBody(make(map[string]interface{})))
	if err != nil || resp == nil || resp.HTTPResponse == nil {
		p.repo.Logger.Error("failed to stop experiment", err)
		return serviceerrors.NewServiceUnavailableError("Оркестратор недоступен", err)
	}

	if resp.HTTPResponse.StatusCode != http.StatusOK &&
		resp.HTTPResponse.StatusCode != http.StatusNotFound {
		return serviceerrors.NewInternalError(
			fmt.Sprintf("Оркестратор вернул статус %d", resp.HTTPResponse.StatusCode),
			fmt.Errorf("%s", string(resp.Body)),
		)
	}

	return nil
}

const (
	ExperimentStatusUnknown dto.ExperimentStatus = "UNKNOWN"
	ExperimentStatusOK      dto.ExperimentStatus = "OK"
	ExperimentStatusWarning dto.ExperimentStatus = "WARNING"
	ExperimentStatusError   dto.ExperimentStatus = "ERROR"
	ExperimentStatusPending dto.ExperimentStatus = "PENDING"
)

var orchToExperimentStatus = map[string]dto.ExperimentStatus{
	"unknown":   ExperimentStatusUnknown,
	"deploying": ExperimentStatusPending,
	"running":   ExperimentStatusOK,
	"stopping":  ExperimentStatusPending,
	"stopped":   ExperimentStatusWarning,
	"failed":    ExperimentStatusError,
	"pending":   ExperimentStatusPending,
	"starting":  ExperimentStatusPending,
}

// GetExperimentStatus возвращает статус experiment
func (p *ExperimentService) GetExperimentStatus(ctx context.Context, orchID string) responses.ExperimentStatusResponse {
	statusInfo, err := p.repo.Clients.Orchestrator.Client.GetV1ExperimentsStatusWithResponse(ctx, &client.GetV1ExperimentsStatusParams{
		ExperimentId: orchID,
	})

	if statusInfo == nil || statusInfo.HTTPResponse == nil {
		return responses.ExperimentStatusResponse{
			Status:  ExperimentStatusUnknown,
			Summary: "failed to fetch status from orchestrator",
			Message: "",
			Debug:   err.Error(),
		}
	}

	if statusInfo.HTTPResponse.StatusCode == http.StatusNotFound {
		return responses.ExperimentStatusResponse{
			Status:  ExperimentStatusUnknown,
			Summary: "not applied",
			Message: "",
			Debug:   string(statusInfo.Body),
		}
	}

	if err != nil {
		p.repo.Logger.Error("failed to fetch status from orchestrator", err)
		return responses.ExperimentStatusResponse{
			Status:  ExperimentStatusUnknown,
			Summary: "failed to fetch status from orchestrator",
			Message: "",
			Debug:   string(statusInfo.Body),
		}
	}

	status := ExperimentStatusUnknown
	summary := "unknown"
	message := ""

	if statusInfo.JSON200 != nil {
		if statusInfo.JSON200.OverallStatus == nil || statusInfo.JSON200.Messages == nil {
			return responses.ExperimentStatusResponse{
				Status:  ExperimentStatusUnknown,
				Summary: "failed to fetch status from orchestrator",
				Message: "",
				Debug:   string(statusInfo.Body),
			}
		}
		overallStatus, ok := orchToExperimentStatus[string(*statusInfo.JSON200.OverallStatus)]
		if !ok {
			status = ExperimentStatusUnknown
		}
		if ok {
			status = overallStatus
		}

		if len(*statusInfo.JSON200.Messages) > 0 {
			message = *(*statusInfo.JSON200.Messages)[0].MessageBody
			summary = *(*statusInfo.JSON200.Messages)[0].MessageName
		}
		if len(*statusInfo.JSON200.Messages) == 0 {
			summary = string(*statusInfo.JSON200.OverallStatus)
		}
	}

	debugInfo, err := json.Marshal(statusInfo.JSON200)
	if err != nil {
		p.repo.Logger.Error("failed to marshal status info", err)
	}

	return responses.ExperimentStatusResponse{
		Status:  status,
		Summary: summary,
		Message: message,
		Debug:   string(debugInfo),
	}
}

// CheckExperimentConfigUpdates проверяет есть ли неприменённые изменения конфига
func (p *ExperimentService) CheckExperimentConfigUpdates(ctx context.Context, experimentID int32) (bool, string, string, error) {
	experimentData, err := p.repo.DB.CompleteExperimentInfo(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get complete experiment info", err)
		return true, "", "Не удалось получить информацию по пайплайну: " + err.Error(), serviceerrors.NewNotFoundError("Не удалось получить информацию по пайплайну", err)
	}

	cfg, err := orch.ExperimentInfoToOrchestratorConfig(p.repo.Logger, &experimentData)
	if err != nil {
		p.repo.Logger.Error("failed to convert to orchestrator config", err)
		return true, "", "Не удалось преобразовать в конфиг оркестратора: " + err.Error(), serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось преобразовать в конфиг оркестратора: %s", err.Error()), err)
	}

	cfgJSON, err := json.Marshal(cfg)
	if err != nil {
		p.repo.Logger.Error("failed to marshal config", err)
		return true, "", "Failed to get orch config: " + err.Error(), serviceerrors.NewInternalError("Не удалось сериализовать конфиг оркестратора", err)
	}

	currOrchConfig := string(cfgJSON)

	appliedVersion, err := p.repo.DB.SelectExperimentAppliedVersion(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to select applied version", err)
		return true, "", currOrchConfig, nil
	}

	changed := appliedVersion.OrchConfig != currOrchConfig

	return changed, appliedVersion.OrchConfig, currOrchConfig, nil
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
// that are missing in the orchestrator configuration for the experiment.
func (p *ExperimentService) FindUnknownExperimentVariables(ctx context.Context, experimentID int32, config string) ([]string, error) {
	experimentData, err := p.repo.DB.CompleteExperimentInfo(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to complete experiment info", err)
		return nil, serviceerrors.NewNotFoundError("Не удалось получить информацию о пайплайне", err)
	}

	orchConfig, err := orch.ExperimentInfoToOrchestratorConfig(p.repo.Logger, &experimentData)
	if err != nil {
		p.repo.Logger.Error("failed to convert experiment info to orchestrator config", err)
		return nil, serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось преобразовать пайплайн в конфиг оркестратора: %s", err.Error()), err)
	}

	requestedVariables := extractVariableNames(config)

	unknown := make([]string, 0)
	for _, variable := range requestedVariables {
		if !variableExists(orchConfig.Variables, variable) {
			unknown = append(unknown, variable)
		}
	}

	return unknown, nil
}

// ApplyExperimentConfig применяет конфигурацию experiment в orchestrator
func (p *ExperimentService) ApplyExperimentConfig(ctx context.Context, experimentID int32) (string, error) {
	experimentData, err := p.repo.DB.CompleteExperimentInfo(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to complete experiment info", err)
		return "", serviceerrors.NewNotFoundError("Не удалось получить информацию о пайплайне", err)
	}

	cfg, err := orch.ExperimentInfoToOrchestratorConfig(p.repo.Logger, &experimentData)
	if err != nil {
		p.repo.Logger.Error("failed to convert experiment info to orchestrator config", err)
		return "", serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось конвертировать в конфиг оркестратора: %s", err.Error()), err)
	}

	cfgJSON, err := json.Marshal(cfg)
	if err != nil {
		p.repo.Logger.Error("failed to marshal orchestrator config to JSON", err)
		return "", serviceerrors.NewInternalError("Не удалось сериализовать конфиг оркестратора", err)
	}

	var cfgMap map[string]interface{}
	err = json.Unmarshal(cfgJSON, &cfgMap)
	if err != nil {
		p.repo.Logger.Error("failed to unmarshal orchestrator config to JSON", err)
		return "", serviceerrors.NewInternalError("Не удалось десериализовать конфиг оркестратора", err)
	}

	dryRun := false
	resp, err := p.repo.Clients.Orchestrator.Client.PostV1ExperimentsApplyWithResponse(ctx, client.PostV1ExperimentsApplyJSONRequestBody{
		DryRun:         &dryRun,
		ExperimentConfig: cfgMap,
	})
	if err != nil || resp == nil || resp.HTTPResponse == nil {
		p.repo.Logger.Error("failed to apply experiment config", err)
		return "", serviceerrors.NewServiceUnavailableError("Оркестратор недоступен при применении конфигурации", err)
	}

	if resp.HTTPResponse.StatusCode != http.StatusOK {
		p.repo.Logger.Error("orchestrator returned non-OK status", err)
		return "", serviceerrors.NewInternalError(fmt.Sprintf("Ошибка оркестратора (статус %d)", resp.HTTPResponse.StatusCode), fmt.Errorf("%s", string(resp.Body)))
	}

	templateID, err := p.repo.DB.BaseTemplateIDByExperimentID(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to retrieve template ID", err)
		return "", serviceerrors.NewNotFoundError("Не удалось получить ID шаблона", err)
	}

	err = p.repo.DB.InsertExperimentAppliedVersion(ctx, core.InsertExperimentAppliedVersionParams{
		ExperimentID:     experimentData.ExperimentID,
		CurrentVersion: templateID,
		OrchConfig:     string(cfgJSON),
	})
	if err != nil {
		p.repo.Logger.Error("failed to insert applied version", err)
		return "", serviceerrors.NewInternalError("Не удалось сохранить примененную версию", err)
	}

	return string(cfgJSON), nil
}

// GetOrchestratorConfig возвращает конфигурацию orchestrator для experiment
func (p *ExperimentService) GetOrchestratorConfig(ctx context.Context, experimentID int32) (string, error) {
	experimentData, err := p.repo.DB.CompleteExperimentInfo(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get experiment info", err)
		return "", serviceerrors.NewNotFoundError("Не удалось получить информацию о пайплайне", err)
	}

	cfg, err := orch.ExperimentInfoToOrchestratorConfig(p.repo.Logger, &experimentData)
	if err != nil {
		p.repo.Logger.Error("failed to convert experiment info to orchestrator config", err)
		return "", serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось преобразовать в конфиг оркестратора: %s", err.Error()), err)
	}

	cfgJSON, err := json.Marshal(cfg)
	if err != nil {
		p.repo.Logger.Error("failed to marshal orchestrator config", err)
		return "", serviceerrors.NewInternalError("Не удалось сериализовать конфиг оркестратора", err)
	}

	return string(cfgJSON), nil
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
		ExperimentID:   experimentID,
		DatasetID: datasetID,
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
		ID:         linkID,
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
		ID:         linkID,
		ExperimentID: experimentID,
		Alias:      newAlias,
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
			LinkID:       dataset.LinkID,
			DatasetID: dataset.DatasetID,
			Name:         dataset.Name,
			Alias:        dataset.Alias,
			ProjectID:    dataset.ProjectID,
			ProjectName:  dataset.ProjectName,
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
			ID:      ds.ID,
			Name:    ds.Name,
			Type:    ds.Type,
			Public:  ds.Public,
			Managed: ds.Managed,
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
		Name:       name,
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
		ExperimentID:    variable.ExperimentID,
	}, nil
}

// GetExperimentVariableByName возвращает переменную experiment по имени
func (p *ExperimentService) GetExperimentVariableByName(ctx context.Context, experimentID int32, name string) (*dto.ExperimentVariable, error) {
	variable, err := p.repo.DB.SelectExperimentVariableV2(ctx, core.SelectExperimentVariableV2Params{
		ExperimentID: experimentID,
		Name:       name,
	})
	if err != nil {
		p.repo.Logger.Error("failed to select variable by name", err)
		return nil, serviceerrors.NewNotFoundError("Переменная не найдена", err)
	}

	return &dto.ExperimentVariable{
		ID:         variable.ID,
		Name:       variable.Name,
		Value:      variable.Value,
		Type:       variable.Type,
		VersionID:  variable.VersionID,
		ExperimentID: variable.ExperimentID,
	}, nil
}

// UpdateExperimentVariableByName обновляет переменную experiment по имени (создает если не существует)
func (p *ExperimentService) UpdateExperimentVariableByName(ctx context.Context, experimentID int32, name, value, varType, comment, creator string) (*dto.ExperimentVariable, *dto.ExperimentVariable, int32, bool, error) {
	variable, err := p.repo.DB.SelectExperimentVariableV2(ctx, core.SelectExperimentVariableV2Params{
		ExperimentID: experimentID,
		Name:       name,
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
		Name:       name,
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

	// Получаем URLs из orchestrator
	var urlFromOrch []dto.ExperimentURL
	orchestratorInfo, err := p.repo.Clients.Orchestrator.Client.GetV1ExperimentsInfoWithResponse(ctx, &client.GetV1ExperimentsInfoParams{
		ExperimentId: experimentIDStr,
	})

	if err == nil && orchestratorInfo != nil && orchestratorInfo.JSON200 != nil && orchestratorInfo.JSON200.CloudWebLinks != nil {
		counter := 0
		urlFromOrch = make([]dto.ExperimentURL, len(*orchestratorInfo.JSON200.CloudWebLinks))

		for _, url := range *orchestratorInfo.JSON200.CloudWebLinks {
			if url.Name == nil || url.Link == nil {
				continue
			}

			newURL := strings.ReplaceAll(*url.Link, "EXPERIMENT_ID", experimentIDStr)
			newURL = strings.ReplaceAll(newURL, "YT_WORK_DIR", ytWorkDir)
			newURL = strings.ReplaceAll(newURL, "PROJECT_ID", projectID)

			urlFromOrch[counter] = dto.ExperimentURL{
				URL:  newURL,
				Name: *url.Name,
			}
			counter++
		}
	}

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

	if len(urlFromOrch) > 0 {
		responseURLs = append(responseURLs, urlFromOrch...)
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
		Alias:      alias,
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
		ID:         linkID,
		ExperimentID: experimentID,
	})
}

// InsertExperimentDatasetLink создает новую связь dataset с experiment
func (p *ExperimentService) InsertExperimentDatasetLink(ctx context.Context, experimentID, datasetID int32, alias string) (int32, error) {
	return p.repo.DB.InsertExperimentDataset(ctx, core.InsertExperimentDatasetParams{
		ExperimentID:   experimentID,
		DatasetID: datasetID,
		Alias:        alias,
	})
}

// UpdateExperimentDatasetLinkID обновляет ID dataset в существующей связи
func (p *ExperimentService) UpdateExperimentDatasetLinkID(ctx context.Context, linkID, newDatasetID, experimentID int32) error {
	return p.repo.DB.UpdateExperimentDatasetIDInLink(ctx, core.UpdateExperimentDatasetIDInLinkParams{
		ID:           linkID,
		DatasetID: newDatasetID,
		ExperimentID:   experimentID,
	})
}

// GetExperimentDatasetByLink получает dataset по alias в experiment
func (p *ExperimentService) GetExperimentDatasetByLink(ctx context.Context, experimentID int32, alias string) (*dto.ExperimentDataset, error) {
	ds, err := p.repo.DB.GetExperimentDataset(ctx, core.GetExperimentDatasetParams{
		ExperimentID: experimentID,
		Alias:      alias,
	})
	if err != nil {
		return nil, serviceerrors.NewNotFoundError("Dataset не найден", err)
	}

	return &dto.ExperimentDataset{
		LinkID:       ds.LinkID,
		DatasetID: ds.DatasetID,
		Name:         ds.Name,
		Alias:        ds.Alias,
		ProjectID:    ds.ProjectID,
		ProjectName:  ds.ProjectName,
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

// GetExperimentOrchID возвращает Orchestrator ID пайплайна
func (p *ExperimentService) GetExperimentOrchID(ctx context.Context, experimentID int32) (string, error) {
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
		ID:         linkID,
		ExperimentID: experimentID,
		Alias:      newAlias,
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
