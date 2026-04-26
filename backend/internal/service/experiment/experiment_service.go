package service

import (
	"context"
	"encoding/json"
	"fmt"
	"maps"
	"slices"
	"strconv"

	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type ExperimentService struct {
	repo *repository.Repository
}

func NewExperimentService(repo *repository.Repository) *ExperimentService {
	return &ExperimentService{repo}
}

func (p *ExperimentService) CreateExperiment(ctx context.Context, experimentName, description string, projectID int32) (*dto.CompleteExperiment, error) {
	namespaceID, err := p.repo.DB.NamespaceIDByProjectID(ctx, projectID)
	if err != nil {
		p.repo.Logger.Error("failed to get namespace", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespace)
	}

	templateID, err := p.repo.DB.InsertExperimentTemplate(ctx, dbcore.InsertExperimentTemplateParams{
		NamespaceID: namespaceID,
		Name:        experimentName,
		Description: description,
	})
	if err != nil {
		p.repo.Logger.Error("failed to create experiment template", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	templateVID, err := p.repo.DB.InsertExperimentTemplateVTx(ctx, dbcore.InsertExperimentTemplateVParams{
		ParentID:              templateID,
		Config:                pgtype.Text{String: `{}`, Valid: true},
		AdditionalInformation: []byte(`{}`),
	})
	if err != nil {
		p.repo.Logger.Error("failed to insert experiment template V", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	experimentInsertedID, err := p.repo.DB.InsertExperiment(ctx, dbcore.InsertExperimentParams{
		TemplateVID: templateVID,
		ProjectID:   projectID,
	})
	if err != nil {
		p.repo.Logger.Error("failed to insert experiment", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	if err := p.repo.DB.UpdateExperimentOrchID(ctx, dbcore.UpdateExperimentOrchIDParams{
		ID:     experimentInsertedID,
		OrchID: pgtype.Text{String: strconv.FormatInt(int64(experimentInsertedID), 10), Valid: true},
	}); err != nil {
		p.repo.Logger.Error("failed to update experiment", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	return &dto.CompleteExperiment{
		ID:          experimentInsertedID,
		Name:        experimentName,
		Description: description,
		Config:      "",
	}, nil
}

func (p *ExperimentService) UpdateExperiment(ctx context.Context, experiment dto.CompleteExperiment) (*dto.CompleteExperiment, error) {
	templateID, err := p.repo.DB.TemplateIDByExperimentID(ctx, experiment.ID)
	if err != nil {
		p.repo.Logger.Error("failed to get template id", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	if experiment.Config != "" {
		additionalInformation, err := p.updateAdditionalCubeInformation(ctx, experiment.Config, experiment.AdditionalInformation)
		if err != nil {
			p.repo.Logger.Info(fmt.Sprintf("failed to update experiment %d additionalInformation, err: %s", experiment.ID, err.Error()))
		}

		if additionalInformation == "" {
			additionalInformation = "{}"
		}

		templateVID, err := p.repo.DB.InsertExperimentTemplateVTx(ctx, dbcore.InsertExperimentTemplateVParams{
			ParentID:              templateID,
			Config:                pgtype.Text{String: experiment.Config, Valid: true},
			AdditionalInformation: []byte(additionalInformation),
		})
		if err != nil {
			p.repo.Logger.Error("failed to insert template vtx", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
		}

		if err := p.repo.DB.UpdateExperiment(ctx, dbcore.UpdateExperimentParams{
			ID:          experiment.ID,
			TemplateVID: templateVID,
		}); err != nil {
			p.repo.Logger.Error("failed to update experiment", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
		}
	}

	if experiment.Name != "" {
		if err := p.repo.DB.UpdateExperimentTemplate(ctx, dbcore.UpdateExperimentTemplateParams{
			ID:   templateID,
			Name: experiment.Name,
		}); err != nil {
			p.repo.Logger.Error("failed to update template", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
		}
	}

	completeExperiment, err := p.repo.DB.SelectCompleteExperiment(ctx, experiment.ID)
	if err != nil {
		p.repo.Logger.Error("failed to get complete experiment", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	return &dto.CompleteExperiment{
		ID:                    experiment.ID,
		Name:                  completeExperiment.Name,
		Config:                completeExperiment.Config.String,
		AdditionalInformation: string(completeExperiment.AdditionalInformation),
	}, nil
}

func (p *ExperimentService) GetExperimentsInProject(ctx context.Context, projectID int32) (*[]dto.CompleteExperiment, error) {
	completeExperiments, err := p.repo.DB.SelectCompleteExperimentsInProject(ctx, projectID)
	if err != nil {
		p.repo.Logger.Error("failed to get complete experiments", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	list := make([]dto.CompleteExperiment, len(completeExperiments))
	for i, experiment := range completeExperiments {
		list[i] = dto.CompleteExperiment{
			ID:     experiment.ID,
			Name:   experiment.Name,
			Status: dto.ExperimentStatus("UNKNOWN"),
		}
	}

	return &list, nil
}

func (p *ExperimentService) GetExperimentByID(ctx context.Context, experimentID int32) (*dto.CompleteExperiment, error) {
	completeExperiment, err := p.repo.DB.SelectCompleteExperiment(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get complete experiment", err)
		return nil, serviceerrors.NewNotFoundError("Пайплайн не найден", err)
	}

	return &dto.CompleteExperiment{
		ID:     completeExperiment.ID,
		Name:   completeExperiment.Name,
		Config: completeExperiment.Config.String,
	}, nil
}

func (p *ExperimentService) DeleteExperiment(ctx context.Context, experimentID int32) error {
	_, err := p.repo.DB.SelectExperiment(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get experiment", err)
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	linksCount, err := p.repo.DB.GetLinksCountByExperimentID(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get links count", err)
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	if linksCount > 0 {
		return serviceerrors.NewConflictError("Невозможно удалить пайплайн: существуют связи", nil)
	}

	if err := p.StopExperiment(ctx, experimentID); err != nil {
		return err
	}

	if err := p.repo.DB.DeleteExperiment(ctx, experimentID); err != nil {
		p.repo.Logger.Error("failed to delete experiment", err)
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	return nil
}

// CopyExperiment копирует experiment из одного проекта в другой
func (p *ExperimentService) CopyExperiment(ctx context.Context, srcExperimentID, targetProjectID int32, newName, newDescription, username string) (*dto.CompleteExperiment, error) {
	// Получаем source experiment
	completeExperiment, err := p.repo.DB.SelectCompleteExperiment(ctx, srcExperimentID)
	if err != nil {
		p.repo.Logger.Error("failed to select complete experiment", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	// Создаем копию
	namespaceID, err := p.repo.DB.NamespaceIDByProjectID(ctx, targetProjectID)
	if err != nil {
		p.repo.Logger.Error("failed to get namespace", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespace)
	}

	templateID, err := p.repo.DB.InsertExperimentTemplate(ctx, dbcore.InsertExperimentTemplateParams{
		NamespaceID: namespaceID,
		Name:        newName,
		Description: newDescription,
	})
	if err != nil {
		p.repo.Logger.Error("failed to insert experiment template", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	templateVID, err := p.repo.DB.InsertExperimentTemplateVTx(ctx, dbcore.InsertExperimentTemplateVParams{
		ParentID:              templateID,
		Config:                completeExperiment.Config,
		AdditionalInformation: completeExperiment.AdditionalInformation,
	})
	if err != nil {
		p.repo.Logger.Error("failed to insert experiment template V", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	experimentInsertedID, err := p.repo.DB.InsertExperiment(ctx, dbcore.InsertExperimentParams{
		TemplateVID: templateVID,
		ProjectID:   targetProjectID,
	})
	if err != nil {
		p.repo.Logger.Error("failed to insert experiment", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	if err := p.repo.DB.UpdateExperimentOrchID(ctx, dbcore.UpdateExperimentOrchIDParams{
		ID:     experimentInsertedID,
		OrchID: pgtype.Text{String: strconv.FormatInt(int64(experimentInsertedID), 10), Valid: true},
	}); err != nil {
		p.repo.Logger.Error("failed to update experiment", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	// Копируем переменные experiment
	variables, err := p.repo.DB.GetExperimentVariables2(ctx, srcExperimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get experiment variables", err)
		// Не возвращаем ошибку, просто логируем
	} else {
		for i := range variables {
			variable, err := p.repo.DB.InsertExperimentVariable(ctx, dbcore.InsertExperimentVariableParams{
				ExperimentID: experimentInsertedID,
				Name:         variables[i].Name,
			})
			if err != nil {
				p.repo.Logger.Error("failed to insert variable", err)
				continue
			}

			variableVersion, err := p.repo.DB.InsertExperimentVariableVersion(ctx, dbcore.InsertExperimentVariableVersionParams{
				VariableID: pgtype.Int4{Int32: variable, Valid: true},
				Value:      variables[i].Value,
				Type:       variables[i].Type,
				Comment:    "copy experiment variables",
				Creator:    username,
			})
			if err != nil {
				p.repo.Logger.Error("failed to insert variable version", err)
				continue
			}

			_, err = p.repo.DB.UpdateExperimentVariableVersion(ctx, dbcore.UpdateExperimentVariableVersionParams{
				ID:        variable,
				VersionID: variableVersion.ID,
			})
			if err != nil {
				p.repo.Logger.Error("failed to update variable version", err)
				continue
			}
		}
	}

	return &dto.CompleteExperiment{
		ID:          experimentInsertedID,
		Name:        newName,
		Description: newDescription,
		Config:      completeExperiment.Config.String,
	}, nil
}

// UpdateExperimentWithValidation обновляет experiment с валидацией конфига
func (p *ExperimentService) UpdateExperimentWithValidation(ctx context.Context, experimentID int32, name, description, config, comment, creator, additionalInformationReq string, disableValidation bool) (*dto.CompleteExperiment, error) {
	templateID, err := p.repo.DB.TemplateIDByExperimentID(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get template id", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	// Обновляем конфиг если он указан
	if config != "" {
		additionalInformation, err := p.updateAdditionalCubeInformation(ctx, config, additionalInformationReq)
		if err != nil {
			p.repo.Logger.Info(fmt.Sprintf("failed to update experiment %d additionalInformation, err: %s", experimentID, err.Error()))
		}

		if additionalInformation == "" {
			additionalInformation = "{}"
		}

		templateVID, err := p.repo.DB.InsertExperimentTemplateVTx(ctx, dbcore.InsertExperimentTemplateVParams{
			ParentID:              templateID,
			Config:                pgtype.Text{String: config, Valid: true},
			Comment:               comment,
			Creator:               creator,
			AdditionalInformation: []byte(additionalInformation),
		})
		if err != nil {
			p.repo.Logger.Error("failed to insert template vtx", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
		}

		if err := p.repo.DB.UpdateExperiment(ctx, dbcore.UpdateExperimentParams{
			ID:          experimentID,
			TemplateVID: templateVID,
		}); err != nil {
			p.repo.Logger.Error("failed to update experiment", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
		}
	}

	// Обновляем имя или описание если они указаны
	if name != "" || description != "" {
		if err := p.repo.DB.UpdateExperimentTemplate(ctx, dbcore.UpdateExperimentTemplateParams{
			ID:          templateID,
			Name:        name,
			Description: description,
		}); err != nil {
			p.repo.Logger.Error("failed to update template", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
		}
	}

	// Получаем обновленный experiment
	completeExperiment, err := p.repo.DB.SelectCompleteExperiment(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get complete experiment", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	return &dto.CompleteExperiment{
		ID:                    completeExperiment.ID,
		Name:                  completeExperiment.Name,
		Description:           completeExperiment.Description,
		Config:                completeExperiment.Config.String,
		AdditionalInformation: string(completeExperiment.AdditionalInformation),
	}, nil
}

// Функция для генерации данных о типах кубов для фронта
func (p *ExperimentService) updateAdditionalCubeInformation(ctx context.Context, experimentConfig string, additionalInformation string) (string, error) {
	if additionalInformation == "" {
		additionalInformation = "{}"
	}

	workerConfig, err := ExtractWorkerFromExperimentConfig(experimentConfig)
	if err != nil {
		p.repo.Logger.Error("failed to extract worker from pp config", err)
		return additionalInformation, err
	}

	if workerConfig == nil {
		return additionalInformation, nil
	}

	cubeKeysMap := getExperimentCubesOptionsNames(workerConfig)

	// получаем сет ключей в структурах кубов
	cubesOptionNamesSet := map[string]bool{}
	for cube := range maps.Values(cubeKeysMap) {
		for _, k := range cube {
			cubesOptionNamesSet[k] = true
		}
	}

	cubes, err := p.repo.DB.SelectCubesByParamsNames(ctx, slices.Collect(maps.Keys(cubesOptionNamesSet)))
	if err != nil {
		if !errors.IsPostgresNotFound(err) {
			p.repo.Logger.Error("failed to get complete experiment", err)
			return additionalInformation, err
		}
	}

	paramsName2CubeID := map[string]int32{}
	for _, cube := range cubes {
		paramsName2CubeID[cube.ParamsName] = cube.ID
	}

	return addCubeIdToExperimentAddInfoByCubesKeys(paramsName2CubeID, cubeKeysMap, additionalInformation), nil
}

// GetCompleteExperiment возвращает полную информацию о experiment включая project info
func (p *ExperimentService) GetCompleteExperiment(ctx context.Context, experimentID, userID int32) (*dto.CompleteExperiment, string, error) {
	completeExperiment, err := p.repo.DB.SelectCompleteExperiment(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to get complete experiment", err)
		return nil, "", serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}

	additionalInformation, err := p.updateAdditionalCubeInformation(ctx, completeExperiment.Config.String, string(completeExperiment.AdditionalInformation))
	if err != nil {
		p.repo.Logger.Info(fmt.Sprintf("failed to update experiment %d additionalInformation, err: %s", experimentID, err.Error()))
	}
	if additionalInformation == "" {
		additionalInformation = "{}"
	}

	project, err := p.repo.DB.SelectProject(ctx, dbcore.SelectProjectParams{
		ID:     completeExperiment.ProjectID,
		UserID: userID,
	})
	if err != nil {
		p.repo.Logger.Error("failed to select project", err)
		return nil, "", serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	return &dto.CompleteExperiment{
		ID:                    completeExperiment.ID,
		Name:                  completeExperiment.Name,
		Description:           completeExperiment.Description,
		Status:                dto.ExperimentStatus("UNKNOWN"),
		Config:                completeExperiment.Config.String,
		ProjectID:             completeExperiment.ProjectID,
		ProjectName:           project.Name,
		AdditionalInformation: additionalInformation,
	}, project.Name, nil
}

// GetExperimentProjectID возвращает ID проекта для experiment
func (p *ExperimentService) GetExperimentProjectID(ctx context.Context, experimentID int32) (int32, error) {
	experiment, err := p.repo.DB.SelectExperiment(ctx, experimentID)
	if err != nil {
		p.repo.Logger.Error("failed to select experiment", err)
		return 0, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment)
	}
	return experiment.ProjectID, nil
}

func getExperimentCubesOptionsNames(workerConfig *models.Worker) map[string][]string {
	cubes := workerConfig.GraphConfig.Cubes

	// Определяем постоянные поля
	constFields := map[string]bool{
		"Name":          true,
		"InputsMapping": true,
		"OutputNames":   true,
	}

	keysData := map[string][]string{}
	for _, cubeAny := range cubes {
		cube, ok := cubeAny.(map[string]any)
		if !ok {
			continue
		}

		cubeName, ok := cube["Name"].(string)
		if !ok {
			continue
		}

		cubeKeys := []string{}
		for _, key := range slices.Collect(maps.Keys(cube)) {
			if constFields[key] {
				continue
			}

			cubeKeys = append(cubeKeys, key)
		}

		keysData[cubeName] = cubeKeys
	}

	return keysData
}

func ExtractWorkerFromExperimentConfig(pc string) (*models.Worker, error) {
	pp := map[string]any{}
	err := json.Unmarshal([]byte(pc), &pp)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal experiment config: %v", err)
	}

	worker := &models.Worker{}
	workerConfigBytes, err := json.Marshal(pp["Worker"])
	if err != nil {
		return nil, fmt.Errorf("failed to marshal worker map: %v", err)
	}
	if err := json.Unmarshal(workerConfigBytes, &worker); err != nil {
		return nil, fmt.Errorf("failed to unmarshal worker json: %v", err)
	}

	return worker, nil
}

func addCubeIdToExperimentAddInfoByCubesKeys(paramsName2CubeID map[string]int32, cubesKeys map[string][]string, additionalInformationJson string) string {
	experimentAdditionalInformation := map[string]any{}
	if additionalInformationJson == "" {
		additionalInformationJson = "{}"
	}
	_ = json.Unmarshal([]byte(additionalInformationJson), &experimentAdditionalInformation)

	cubesInfo, ok := experimentAdditionalInformation["Cubes"].([]any)
	if !ok {
		cubesInfo = make([]any, 0)
	}
	for name, keys := range cubesKeys {
		cubeInfo := map[string]any{}
		cubeInfoIdx := slices.IndexFunc(cubesInfo, func(cubeInfo any) bool {
			cubeInfoD, _ := cubeInfo.(map[string]any)
			cubeName, ok := cubeInfoD["Name"]
			return ok && cubeName == name
		})

		if cubeInfoIdx != -1 {
			cubeInfo, _ = cubesInfo[cubeInfoIdx].(map[string]any)
		}

		cubeID := int32(0)
		found := false
		// Ищем ID куба по ключам
		for _, key := range keys {
			if id, exists := paramsName2CubeID[key]; exists {
				if !found {
					cubeID = id
					found = true
				} else {
					// Найдено более одного ID - сбрасываем
					cubeID = -1
					break
				}
			}
		}

		oldID, _ := cubeInfo["CubeTypeID"].(int32)
		// Если нашли единственный ID, добавляем его
		if found && cubeID != -1 && cubeID != oldID {
			cubeInfo["CubeTypeID"] = cubeID
			if cubeInfoIdx == -1 {
				cubeInfo["Name"] = name
				cubesInfo = append(cubesInfo, cubeInfo)
			}
		}
	}

	experimentAdditionalInformation["Cubes"] = cubesInfo
	updatedPiplineAddInfo, err := json.Marshal(experimentAdditionalInformation)
	if err != nil {
		return additionalInformationJson
	}

	return string(updatedPiplineAddInfo)
}
