package shared

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
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
