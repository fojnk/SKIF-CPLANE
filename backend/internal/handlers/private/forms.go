package private

import (
	"context"

	models "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

// getDatasetFormHandler godoc
//
//	@Summary	get dataset config edit form
//	@Tags		form
//	@Accept		json
//	@Produce	json
//	@Param		type	query		string	true	"dataset type (json, kafka; legacy: Queue, KeyValue, StaticTableDir, Kafka)"
//	@Success	200		{object}	responses.GetFormResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/forms/dataset [get]
func getDatasetFormHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetDatasetFormRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	formParams, err := svc.GetDatasetFormParams(ctx, r.Type)
	if err != nil {
		l.Error("failed to get dataset form", err)
		return nil, shared.ConvertServiceError(err, shared.EntityForms)
	}

	return responses.GetFormResponse{
		Params: formParams,
	}, nil
}

// getProjectFormHandler godoc
//
//	@Summary	get project config edit form
//	@Tags		form
//	@Accept		json
//	@Produce	json
//	@Success	200	{object}	responses.GetFormResponse
//
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//
//	@Router		/api/v2/forms/project [get]
func getProjectFormHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetProjectFormRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	formParams, err := svc.GetProjectFormParams(ctx)
	if err != nil {
		l.Error("failed to get project form", err)
		return nil, shared.ConvertServiceError(err, shared.EntityForms)
	}

	return responses.GetFormResponse{
		Params: formParams,
	}, nil
}

// getExperimentFormsHandler godoc
//
// @Summary get project config edit form
// @Tags 	form
// @Accept 	json
// @Produce json
// @Success 200 	{object} 	responses.GetFormResponse
//
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//
// @Router 	/api/v2/forms/experiment [get]
func getExperimentFormsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentFormsRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	experimentForms, err := svc.IFormService.GetPipelintFormsParams(ctx)
	if err != nil {
		l.Error("failed to get experiment forms", err)
		return nil, shared.ConvertServiceError(err, shared.EntityForms)
	}

	return responses.GetFormResponse{
		Params: experimentForms,
	}, nil
}
