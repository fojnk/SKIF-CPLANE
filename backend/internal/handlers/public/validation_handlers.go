package public

import (
	"context"
	"encoding/json"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	models "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

// validateExperimentFastHandler godoc
//
//	@Summary	validate experiment config fast
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ExperimentValidateFastRequest	true	"request body"
//	@Success	200		{object}	dto.ValidationResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/validations/fast [post]
func validateExperimentFastHandler(ctx context.Context, svc *service.Service, l *logger.Logger, req *requests.ExperimentValidateFastRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	var config map[string]interface{}
	if err := json.Unmarshal([]byte(req.ExperimentConfig), &config); err != nil {
		l.Error("failed to unmarshal experiment config", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Некорректный формат конфигурации пайплайна",
			HTTPStatusCode:  400,
		}
	}

	result, err := svc.ValidateExperimentFast(ctx, config, true)
	if err != nil {
		l.Error("failed to validate experiment (fast)", err)
		if resp := serviceerrors.ToErrorResponse(err); resp != nil {
			return nil, resp
		}
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Не удалось выполнить валидацию",
			HTTPStatusCode:  500,
		}
	}

	return result, nil
}

// validateExperimentRunHandler godoc
//
//	@Summary	validate experiment config with run
//	@Description	Validates experiment configuration and runs it with provided datasets. Returns validation results with run outputs.
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ExperimentValidateRunRequest	true	"request body"
//	@Success	200		{object}	dto.ValidationResponseWithRun
//	@Failure	400		{object}	dto.ValidationErrorResponse	"Bad Request"
//	@Failure	401		{object}	dto.ValidationErrorResponse	"Unauthorized"
//	@Failure	403		{object}	dto.ValidationErrorResponse	"Forbidden"
//	@Failure	500		{object}	dto.ValidationErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/validations/run [post]
func validateExperimentRunHandler(ctx context.Context, svc *service.Service, l *logger.Logger, req *requests.ExperimentValidateRunRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	var config map[string]interface{}
	if err := json.Unmarshal([]byte(req.ExperimentConfig), &config); err != nil {
		l.Error("failed to unmarshal experiment config", err)
		return &dto.ValidationResponseWithRun{
			ExperimentIsValid: false,
			Errors:          []string{"Некорректный формат конфигурации пайплайна"},
			Logs:            []string{},
			RunResult:       dto.RunResults{},
		}, nil
	}

	// Prepare data sets if provided
	dataSets := shared.ConvertDataSetsToDTO(req.DataSets)

	result, err := svc.ValidateExperimentRun(ctx, config, true, dataSets, req.ShouldReadYtSample)
	if err != nil {
		l.Error("failed to validate experiment (run)", err)

		errorMsg := "Не удалось выполнить валидацию"
		if resp := serviceerrors.ToErrorResponse(err); resp != nil {
			errorMsg = resp.ExternalMessage
		}

		return &dto.ValidationResponseWithRun{
			ExperimentIsValid: false,
			Errors:          []string{errorMsg},
			Logs:            []string{},
			RunResult:       dto.RunResults{},
		}, nil
	}

	return result, nil
}
