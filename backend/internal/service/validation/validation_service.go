package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/validation"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/supervisor"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/supervisorenrich"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type ValidationService struct {
	repo *repository.Repository
}

func NewValidationService(repo *repository.Repository) *ValidationService {
	return &ValidationService{repo: repo}
}

// GetExperimentConfigMap получает конфигурацию experiment как map[string]interface{}
// Если передан experimentID, получает полную информацию о experiment и конвертирует в конфиг супервизора
// Если experimentConfig не пустой, он используется вместо конфига из БД
func (s *ValidationService) GetExperimentConfigMap(ctx context.Context, experimentID int32, experimentConfig string) (map[string]interface{}, error) {
	if experimentID != 0 {
		// Получаем полную информацию о experiment
		experimentData, err := s.repo.DB.CompleteExperimentInfo(ctx, experimentID)
		if err != nil {
			s.repo.Logger.Error("failed to complete experiment info", err)
			return nil, serviceerrors.NewNotFoundError("Не удалось получить информацию о пайплайне", err)
		}

		// Если передан конфиг из запроса, используем его
		if experimentConfig != "" {
			experimentData.ExperimentConfig = pgtype.Text{String: experimentConfig, Valid: true}
		}

		if !experimentData.ExperimentConfig.Valid {
			return nil, serviceerrors.NewBadRequestError("конфиг пайплайна пуст", nil)
		}

		if supervisor.IsSupervisorExperimentLayout([]byte(experimentData.ExperimentConfig.String)) {
			req, err := supervisor.RequestFromCompleteInfo(s.repo.Logger, &experimentData)
			if err != nil {
				s.repo.Logger.Error("failed to build skif supervisor experiment request", err)
				return nil, serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось собрать конфиг супервизора: %s", err.Error()), err)
			}
			if err := supervisorenrich.ApplyExperimentVariables(req, experimentData.Variables); err != nil {
				return nil, serviceerrors.NewBadRequestError(fmt.Sprintf("Ошибка подстановки переменных: %s", err.Error()), err)
			}
			cfgJSON, err := json.Marshal(req)
			if err != nil {
				return nil, serviceerrors.NewInternalError("Не удалось сериализовать конфиг супервизора", err)
			}
			var cfgMap map[string]interface{}
			if err := json.Unmarshal(cfgJSON, &cfgMap); err != nil {
				return nil, serviceerrors.NewInternalError("Не удалось десериализовать конфиг супервизора", err)
			}
			return cfgMap, nil
		}

		cfg, err := orch.ExperimentInfoToSupervisorPipelineConfig(s.repo.Logger, &experimentData)
		if err != nil {
			s.repo.Logger.Error("failed to convert experiment info to supervisor pipeline config", err)
			return nil, serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось преобразовать в конфиг супервизора: %s", err.Error()), err)
		}

		cfgJSON, err := json.Marshal(cfg)
		if err != nil {
			s.repo.Logger.Error("failed to marshal supervisor pipeline config", err)
			return nil, serviceerrors.NewInternalError("Не удалось сериализовать конфиг супервизора", err)
		}

		var cfgMap map[string]interface{}
		err = json.Unmarshal(cfgJSON, &cfgMap)
		if err != nil {
			s.repo.Logger.Error("failed to unmarshal supervisor pipeline config", err)
			return nil, serviceerrors.NewInternalError("Не удалось десериализовать конфиг оркестратора", err)
		}

		return cfgMap, nil
	}

	// Если experimentID не передан, просто парсим конфиг из строки
	var config map[string]interface{}
	err := json.Unmarshal([]byte(experimentConfig), &config)
	if err != nil {
		s.repo.Logger.Error("failed to unmarshal experiment config", err)
		return nil, serviceerrors.NewBadRequestError("Некорректный формат конфигурации пайплайна", err)
	}

	return config, nil
}

// ValidateProjectConfig валидирует конфигурацию проекта
func (s *ValidationService) ValidateProjectConfig(ctx context.Context, projectConfig string) error {
	err := validation.ProjectSyntaxConfigValidation(projectConfig)
	if err != nil {
		s.repo.Logger.Error("failed to validate project config", err)
		return serviceerrors.NewBadRequestError("Ошибка валидации конфигурации проекта", err)
	}

	return nil
}

// ValidateDatasetConfig валидирует конфигурацию dataset
func (s *ValidationService) ValidateDatasetConfig(ctx context.Context, datasetConfig string) error {
	err := validation.DatasetParamsSyntaxConfigValidation(datasetConfig)
	if err != nil {
		s.repo.Logger.Error("failed to validate dataset config", err)
		return serviceerrors.NewBadRequestError("Ошибка валидации конфигурации dataset", err)
	}

	return nil
}

// ValidateExperimentConfig валидирует конфигурацию experiment
func (s *ValidationService) ValidateExperimentConfig(ctx context.Context, experimentConfig string, experimentID int32) error {
	if experimentID != 0 {
		experimentData, err := s.repo.DB.CompleteExperimentInfo(ctx, experimentID)
		if err != nil {
			s.repo.Logger.Error("failed to complete experiment info", err)
			return serviceerrors.NewNotFoundError("Не удалось получить информацию о пайплайне", err)
		}

		if experimentConfig != "" {
			experimentData.ExperimentConfig = pgtype.Text{String: experimentConfig, Valid: true}
		}
		if !experimentData.ExperimentConfig.Valid {
			return serviceerrors.NewBadRequestError("конфиг пайплайна пуст", nil)
		}

		cfgStr := experimentData.ExperimentConfig.String
		if supervisor.IsSupervisorExperimentLayout([]byte(cfgStr)) {
			err := validation.ExperimentSyntaxConfigValidation(cfgStr)
			if err != nil {
				return serviceerrors.NewBadRequestError("Ошибка синтаксической валидации конфига: "+err.Error(), err)
			}
			return nil
		}

		cfg, err := orch.ExperimentInfoToSupervisorPipelineConfig(s.repo.Logger, &experimentData)
		if err != nil {
			s.repo.Logger.Error("failed to convert experiment info to supervisor pipeline config", err)
			return serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось преобразовать в конфиг оркестратора: %s", err.Error()), err)
		}

		cfgJSON, err := json.Marshal(cfg)
		if err != nil {
			s.repo.Logger.Error("failed to marshal orchestrator config to JSON", err)
			return serviceerrors.NewInternalError("Не удалось сериализовать конфиг experiment", err)
		}

		err = validation.ExperimentSyntaxConfigValidation(string(cfgJSON))
		if err != nil {
			return serviceerrors.NewBadRequestError("Ошибка синтаксической валидации конфига: "+err.Error(), err)
		}

		return nil
	} else {
		// Простая синтаксическая валидация без контекста
		err := validation.ExperimentSyntaxConfigValidation(experimentConfig)
		if err != nil {
			return serviceerrors.NewBadRequestError("Ошибка синтаксической валидации конфига: "+err.Error(), err)
		}

		return nil
	}
}

func (s *ValidationService) ValidateExperimentFast(ctx context.Context, config map[string]interface{}, shouldWriteLogs bool) (*dto.ValidationResponse, error) {
	_ = ctx
	_ = shouldWriteLogs
	cfgJSON, err := json.Marshal(config)
	if err != nil {
		return nil, serviceerrors.NewInternalError("Не удалось сериализовать конфигурацию", err)
	}
	if err := validation.ExperimentSyntaxConfigValidation(string(cfgJSON)); err != nil {
		summary := "локальная проверка"
		return &dto.ValidationResponse{
			ExperimentIsValid: false,
			Summary:           &summary,
			Errors: []dto.ValidationError{{
				ErrorMessage: err.Error(),
			}},
			Logs: nil,
		}, nil
	}
	summary := "локальная синтаксическая проверка пройдена (глубокая валидация — у супервизора)"
	return &dto.ValidationResponse{
		ExperimentIsValid: true,
		Summary:           &summary,
		Errors:            nil,
		Logs:              nil,
	}, nil
}

// ValidateExperimentRun — прогон с данными выполняется супервизором, не через control plane.
func (s *ValidationService) ValidateExperimentRun(ctx context.Context, config map[string]interface{}, shouldWriteLogs bool, dataSets *[][]dto.ValidationRequestDataItem, shouldReadYtSample *bool) (*dto.ValidationResponseWithRun, error) {
	_ = ctx
	_ = config
	_ = shouldWriteLogs
	_ = dataSets
	_ = shouldReadYtSample
	return nil, serviceerrors.NewServiceUnavailableError(
		"Валидация с прогоном данных выполняется супервизором и недоступна в control plane",
		fmt.Errorf("supervisor only"),
	)
}
