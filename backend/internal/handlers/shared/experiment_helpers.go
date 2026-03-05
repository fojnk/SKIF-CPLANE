package shared

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	pkgErrors "github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients"
)

// convertServiceErrorInShared преобразует ServiceError в ErrorResponse для использования в shared пакете
func convertServiceErrorInShared(err error, entityType EntityType) *responses.ErrorResponse {
	if err == nil {
		return nil
	}

	var svcErr *serviceerrors.ServiceError
	if errors.As(err, &svcErr) {
		return convertServiceError(svcErr, entityType)
	}

	// Для обычных ошибок используем fallback
	return InternalServerError(err, entityType)
}

// GetExperimentStatus is deprecated: use service.GetExperimentStatus instead
// Deprecated: This function is kept for backward compatibility. Use svc.GetExperimentStatus directly.
func GetExperimentStatus(ctx context.Context, svc *service.Service, l *logger.Logger, experimentID string) responses.ExperimentStatusResponse {
	return svc.GetExperimentStatus(ctx, experimentID)
}

func CheckExperimentQuota(ctx context.Context, svc *service.Service, l *logger.Logger, config string, experimentId int32) *responses.ErrorResponse {
	unlimited, err := svc.CheckExperimentQuota(ctx, experimentId)

	if err != nil {
		l.Error("failed to check experiment limit", err)
		return convertServiceErrorInShared(err, EntityCompliteExperimentInfo)
	}

	if !unlimited {
		var experimentConfig models2.ExperimentConfig

		err := json.Unmarshal([]byte(config), &experimentConfig)
		if err != nil {
			return convertServiceErrorInShared(err, EntityCompliteExperimentInfo)
		}

		if len(experimentConfig.Placement.OnecloudDatacenters) > 1 {
			return &responses.ErrorResponse{
				HTTPStatusCode:  http.StatusBadRequest,
				ExternalMessage: "Ваш пайплайн ограничен по квоте, вы не можете использовать больше 1 датацентра.",
				InternalError:   errors.New("quota error"),
			}
		}

		if experimentConfig.Resources.Resharder.ReplicasInDc > 1 {
			return &responses.ErrorResponse{
				HTTPStatusCode:  http.StatusBadRequest,
				ExternalMessage: "Ваш пайплайн ограничен по квоте, вы не можете использовать больше 1 реплики решардера.",
				InternalError:   errors.New("quota error"),
			}
		}

		if experimentConfig.Resources.Worker.ReplicasInDc > 1 {
			return &responses.ErrorResponse{
				HTTPStatusCode:  http.StatusBadRequest,
				ExternalMessage: "Ваш пайплайн ограничен по квоте, вы не можете использовать больше 1 реплики воркера.",
				InternalError:   errors.New("quota error"),
			}
		}
	}

	return nil
}

func VariableExperimentValidation(ctx context.Context, svc *service.Service, l *logger.Logger, newConfig string, experimentID int32) *responses.ErrorResponse {
	unknownVars, err := svc.FindUnknownExperimentVariables(ctx, experimentID, newConfig)
	if err != nil {
		l.Error("failed to validate experiment variables", err)
		return convertServiceErrorInShared(err, EntityCompliteExperimentInfo)
	}

	if len(unknownVars) > 0 {
		message := fmt.Sprintf("Неизвестные переменные: %v", unknownVars)
		return &responses.ErrorResponse{
			HTTPStatusCode:  http.StatusBadRequest,
			InternalError:   errors.New(message),
			ExternalMessage: message,
		}
	}

	return nil
}

// CreateExperimentStartStopJob creates a job for experiment start or stop operation
func CreateExperimentStartStopJob(ctx context.Context, svc *service.Service, l *logger.Logger, experimentID int32, orchExperimentID string, operation string) (int64, *responses.ErrorResponse) {
	var jobType string
	var jobName string
	var desc string
	var tags []string
	var stepName string
	var stepDesc string

	if operation == "start" {
		jobType = "experiment_start"
		jobName = fmt.Sprintf("start-experiment-%d", experimentID)
		desc = fmt.Sprintf("Start experiment %d", experimentID)
		tags = []string{"experiment", "start"}
		stepName = "start_experiment"
		stepDesc = "Start experiment"
	} else {
		jobType = "experiment_stop"
		jobName = fmt.Sprintf("stop-experiment-%d", experimentID)
		desc = fmt.Sprintf("Stop experiment %d", experimentID)
		tags = []string{"experiment", "stop"}
		stepName = "stop_experiment"
		stepDesc = "Stop experiment"
	}

	jobConfig := map[string]interface{}{
		"experiment_id": orchExperimentID,
	}

	entity := &clients.LinkedEntity{
		Type: "experiment",
		Id:   int64(experimentID),
	}

	execTarget := "orchestrator"

	stepOrder := int32(0)
	stepConfig := map[string]interface{}{
		"type":        jobType,
		"experiment_id": orchExperimentID,
	}
	steps := []clients.CreateStep{
		{
			Name:        stepName,
			Description: &stepDesc,
			Order:       &stepOrder,
			Config:      &stepConfig,
		},
	}

	createJobReq := clients.CreateJobRequest{
		Name:            jobName,
		Description:     &desc,
		Type:            jobType,
		ExecutionTarget: &execTarget,
		Config:          &jobConfig,
		Entity:          entity,
		Tags:            &tags,
		Steps:           &steps,
	}

	jobResp, err := svc.Repo.Clients.Jobd.CreateJob(ctx, createJobReq)
	if err != nil {
		l.Error(fmt.Sprintf("failed to create %s job in jobd", operation), err)
		return 0, &responses.ErrorResponse{
			InternalError:   pkgErrors.Wrap(err, fmt.Sprintf("failed to create %s job in jobd", operation)),
			ExternalMessage: fmt.Sprintf("Ошибка создания джобы для %s операции: %s", operation, err.Error()),
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	var jobID int64
	if jobResp.Job != nil && jobResp.Job.Id != nil {
		jobID = *jobResp.Job.Id
	}
	l.Info(fmt.Sprintf("%s job created in jobd: job_id=%d, experiment_id=%d", operation, jobID, experimentID))

	return jobID, nil
}

// ConvertDataSetsToDTO конвертирует dataSets из формата запроса в формат DTO для сервиса
func ConvertDataSetsToDTO(dataSets *[][]requests.ExperimentValidateDataItem) *[][]dto.ValidationRequestDataItem {
	if dataSets == nil {
		return nil
	}

	converted := make([][]dto.ValidationRequestDataItem, len(*dataSets))
	for i, batch := range *dataSets {
		converted[i] = make([]dto.ValidationRequestDataItem, len(batch))
		for j, item := range batch {
			converted[i][j] = dto.ValidationRequestDataItem{
				SourceName: item.SourceName,
				OutputName: item.OutputName,
				Data:       item.Data,
			}
		}
	}
	return &converted
}
