package private

import (
	"context"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

// getAppUpcomingHandler godoc
//
//	@Summary	get app upcoming content
//	@Tags		app
//	@Produce	json
//	@Success	200	{object}	responses.GetAppUpcomingResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/upcoming [get]
func getAppUpcomingHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetAppUpcomingRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	upcoming, err := svc.GetAppUpcoming(ctx)
	if err != nil {
		l.Error("failed to get app upcoming", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppUpcoming)
	}

	return &responses.GetAppUpcomingResponse{
		AppUpcoming: *upcoming,
	}, nil
}

// updateAppUpcomingHandler godoc
//
//	@Summary	update app upcoming content
//	@Tags		app
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.UpdateAppUpcomingRequest	true	"request body"
//	@Success	200		{object}	responses.UpdateAppUpcomingResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/upcoming [put]
func updateAppUpcomingHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateAppUpcomingRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Delete, 0, u); err != nil {
		return nil, err
	}

	updated, err := svc.UpdateAppUpcoming(ctx, r.Content)
	if err != nil {
		l.Error("failed to update app upcoming", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppUpcoming)
	}

	return &responses.UpdateAppUpcomingResponse{
		AppUpcoming: *updated,
	}, nil
}
