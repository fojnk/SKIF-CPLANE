package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/orchestrator/client"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/validation"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type ValidationService struct {
	repo *repository.Repository
}

// convertArrayMapToStringMap преобразует map[string][]string в map[string]string
// Склеивает массивы в YSON формат: [elem1;elem2;...]
func convertArrayMapToStringMap(data map[string][]string) map[string]string {
	result := make(map[string]string)
	for key, values := range data {
		switch len(values) {
		case 0:
			result[key] = "[]"
		case 1:
			result[key] = values[0]
		default:
			// Склеиваем массив в YSON формат
			result[key] = "[" + strings.Join(values, ";") + "]"
		}
	}
	return result
}

func NewValidationService(repo *repository.Repository) *ValidationService {
	return &ValidationService{repo: repo}
}

// GetExperimentConfigMap получает конфигурацию experiment как map[string]interface{}
// Если передан experimentID, получает полную информацию о experiment и конвертирует в orchestrator config
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

		// Конвертируем в orchestrator config
		cfg, err := orch.ExperimentInfoToOrchestratorConfig(s.repo.Logger, &experimentData)
		if err != nil {
			s.repo.Logger.Error("failed to convert experiment info to orchestrator config", err)
			return nil, serviceerrors.NewBadRequestError(fmt.Sprintf("Не удалось преобразовать в конфиг оркестратора: %s", err.Error()), err)
		}

		cfgJSON, err := json.Marshal(cfg)
		if err != nil {
			s.repo.Logger.Error("failed to marshal orchestrator config", err)
			return nil, serviceerrors.NewInternalError("Не удалось сериализовать конфиг оркестратора", err)
		}

		var cfgMap map[string]interface{}
		err = json.Unmarshal(cfgJSON, &cfgMap)
		if err != nil {
			s.repo.Logger.Error("failed to unmarshal orchestrator config", err)
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
		// Полная валидация с учетом контекста experiment
		experimentData, err := s.repo.DB.CompleteExperimentInfo(ctx, experimentID)
		if err != nil {
			s.repo.Logger.Error("failed to complete experiment info", err)
			return serviceerrors.NewNotFoundError("Не удалось получить информацию о пайплайне", err)
		}

		experimentData.ExperimentConfig = pgtype.Text{String: experimentConfig, Valid: true}

		cfg, err := orch.ExperimentInfoToOrchestratorConfig(s.repo.Logger, &experimentData)
		if err != nil {
			s.repo.Logger.Error("failed to convert experiment info to orchestrator config", err)
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
	req := client.PostV1ExperimentsValidationFastJSONRequestBody{
		Config:          config,
		ShouldWriteLogs: shouldWriteLogs,
	}

	resp, err := s.repo.Clients.Orchestrator.Client.PostV1ExperimentsValidationFastWithResponse(ctx, req)
	if err != nil {
		s.repo.Logger.Error("failed to call orchestrator validation", err)
		return nil, serviceerrors.NewServiceUnavailableError("Оркестратор недоступен", err)
	}

	if resp.HTTPResponse == nil {
		return nil, serviceerrors.NewServiceUnavailableError("Оркестратор недоступен", fmt.Errorf("empty response"))
	}

	if resp.StatusCode() != http.StatusOK {
		return nil, serviceerrors.NewInternalError(
			fmt.Sprintf("Оркестратор вернул статус %d", resp.StatusCode()),
			fmt.Errorf("%s", string(resp.Body)),
		)
	}

	if resp.JSON200 == nil {
		return nil, serviceerrors.NewInternalError("Некорректный ответ от оркестратора", fmt.Errorf("empty JSON200"))
	}

	// Преобразуем ответ из автогенерированного формата в dto
	result := &dto.ValidationResponse{
		ExperimentIsValid: resp.JSON200.ExperimentIsValid,
		Summary:         resp.JSON200.Summary,
		Errors:          make([]dto.ValidationError, 0, len(resp.JSON200.Errors)),
		Logs:            make([]dto.LogRecord, 0, len(resp.JSON200.Logs)),
	}

	for _, e := range resp.JSON200.Errors {
		result.Errors = append(result.Errors, dto.ValidationError{
			ErrorMessage: e,
		})
	}

	for _, l := range resp.JSON200.Logs {
		result.Logs = append(result.Logs, dto.LogRecord{
			EntityType: string(l.EntityType),
			EntityName: l.EntityName,
			Records:    l.Records,
		})
	}

	return result, nil
}

// ValidateExperimentRun performs experiment configuration validation with data run via orchestrator
func (s *ValidationService) ValidateExperimentRun(ctx context.Context, config map[string]interface{}, shouldWriteLogs bool, dataSets *[][]dto.ValidationRequestDataItem, shouldReadYtSample *bool) (*dto.ValidationResponseWithRun, error) {
	s.repo.Logger.Info("ValidateExperimentRun called")

	configJSON, err := json.Marshal(config)
	if err != nil {
		return nil, serviceerrors.NewInternalError("Не удалось сериализовать конфигурацию", err)
	}

	reqBody := map[string]interface{}{
		"config":            string(configJSON),
		"should_write_logs": shouldWriteLogs,
	}
	if shouldReadYtSample != nil {
		reqBody["should_read_yt_sample"] = *shouldReadYtSample
	}

	// Преобразуем dataSets
	if dataSets != nil {
		converted := make([][]map[string]interface{}, len(*dataSets))
		for i, batch := range *dataSets {
			converted[i] = make([]map[string]interface{}, len(batch))
			for j, item := range batch {
				sourceName := item.SourceName

				// Преобразуем data из строки YSON в map[string][]string
				// (оркестратор ожидает массивы строк)
				// Data приходит как "[{\"id\"=1};{\"id\"=2}]", нужно отправить как {"source_name": ["[{\"id\"=1};{\"id\"=2}]"]}
				dataForOrch := map[string][]string{
					sourceName: {item.Data},
				}

				converted[i][j] = map[string]interface{}{
					"source_name": sourceName,
					"data":        dataForOrch,
				}
			}
		}
		reqBody["data_sets"] = converted
	}

	reqJSON, err := json.Marshal(reqBody)
	if err != nil {
		return nil, serviceerrors.NewInternalError("Не удалось сериализовать запрос", err)
	}

	resp, err := s.repo.Clients.Orchestrator.Client.PostV1ExperimentsValidationRunWithBodyWithResponse(ctx, "application/json", bytes.NewReader(reqJSON))
	if err != nil {
		s.repo.Logger.Error("failed to call orchestrator validation", err)
		// Логируем ответ, если он есть, даже при ошибке
		if resp != nil && resp.HTTPResponse != nil {

			s.repo.Logger.Info(fmt.Sprintf("orchestrator response on error: status=%d, body_length=%d, body=%s", resp.StatusCode(), len(resp.Body), resp.Body))
		}
		return nil, serviceerrors.NewServiceUnavailableError("Оркестратор недоступен", err)
	}

	// Логирование ответа оркестратора
	if resp != nil && resp.HTTPResponse != nil {
		s.repo.Logger.Info(fmt.Sprintf("orchestrator validation response: status=%d, body_length=%d", resp.StatusCode(), len(resp.Body)))
		if len(resp.Body) > 0 {
			// Ограничиваем размер лога, чтобы не засорять логи большими ответами
			bodyPreview := string(resp.Body)
			if len(bodyPreview) > 1000 {
				bodyPreview = bodyPreview[:1000] + "... (truncated)"
			}
			s.repo.Logger.Info(fmt.Sprintf("orchestrator response body: %s", bodyPreview))
		}
	}

	if resp.HTTPResponse == nil {
		return nil, serviceerrors.NewServiceUnavailableError("Оркестратор недоступен", fmt.Errorf("empty response"))
	}

	if resp.StatusCode() != http.StatusOK {
		// Пытаемся распарсить JSON из тела ответа, если оркестратор вернул ошибки
		result := &dto.ValidationResponseWithRun{}

		if err := json.Unmarshal(resp.Body, result); err == nil {
			if result.Summary != nil && *result.Summary != "" && len(result.Errors) > 0 {
				result.Errors = append([]string{*result.Summary + "\n"}, result.Errors...)
			}

			return result, nil
		}

		// Не удалось распарсить JSON, возвращаем ошибку
		return nil, serviceerrors.NewInternalError(
			fmt.Sprintf("Оркестратор вернул статус %d", resp.StatusCode()),
			fmt.Errorf("%s", string(resp.Body)),
		)
	}

	if resp.JSON200 == nil {
		return nil, serviceerrors.NewInternalError("Некорректный ответ от оркестратора", fmt.Errorf("empty JSON200"))
	}

	result := &dto.ValidationResponseWithRun{
		ExperimentIsValid: resp.JSON200.ExperimentIsValid,
		Summary:         resp.JSON200.Summary,
		Errors:          resp.JSON200.Errors,
		Logs:            resp.JSON200.Logs,
	}

	// Если есть summary/errors при невалидном пайплайне, добавляем summary первым элементом в errors
	if resp.JSON200.Summary != nil && *resp.JSON200.Summary != "" && !resp.JSON200.ExperimentIsValid {
		result.Errors = make([]string, 0, len(resp.JSON200.Errors)+1)
		result.Errors = append(result.Errors, *resp.JSON200.Summary+"\n")
		result.Errors = append(result.Errors, resp.JSON200.Errors...)
	}

	if resp.JSON200.RunResult.BatchRuns != nil {
		result.RunResult = dto.RunResults{
			BatchRuns: make([]dto.BatchRunResult, 0, len(*resp.JSON200.RunResult.BatchRuns)),
		}

		for _, batchRun := range *resp.JSON200.RunResult.BatchRuns {
			batchResult := dto.BatchRunResult{
				CubeRuns: make(map[string]dto.CubeRunResult),
			}

			if batchRun.CubeRuns != nil {
				for cubeName, cubeRun := range *batchRun.CubeRuns {
					// Преобразуем Inputs и Outputs из map[string][]string в map[string]string
					batchResult.CubeRuns[cubeName] = dto.CubeRunResult{
						Inputs:  convertArrayMapToStringMap(cubeRun.Inputs),
						Outputs: convertArrayMapToStringMap(cubeRun.Outputs),
						Logs:    cubeRun.Logs,
					}
				}
			}

			result.RunResult.BatchRuns = append(result.RunResult.BatchRuns, batchResult)
		}
	}

	return result, nil
}
