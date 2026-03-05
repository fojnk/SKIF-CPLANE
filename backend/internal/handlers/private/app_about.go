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

// getAppAboutHandler godoc
//
//	@Summary	get app about content
//	@Tags		app
//	@Produce	json
//	@Success	200	{object}	responses.GetAppAboutResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/about [get]
func getAppAboutHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetAppAboutRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	about, err := svc.GetAppAbout(ctx)
	if err != nil {
		l.Error("failed to get app about", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppAbout)
	}

	return &responses.GetAppAboutResponse{
		AppAbout: *about,
	}, nil
}

// updateAppAboutHandler godoc
//
//	@Summary	update app about content
//	@Tags		app
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.UpdateAppAboutRequest	true	"request body"
//	@Success	200		{object}	responses.UpdateAppAboutResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/about [put]
func updateAppAboutHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateAppAboutRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Delete, 0, u); err != nil {
		return nil, err
	}

	updated, err := svc.UpdateAppAbout(ctx, r.Content, r.Links)
	if err != nil {
		l.Error("failed to update app about", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppAbout)
	}

	return &responses.UpdateAppAboutResponse{
		AppAbout: *updated,
	}, nil
}
