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

// createAppUpdateHandler godoc
//
//	@Summary	create app update
//	@Tags		app
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CreateAppUpdateRequest	true	"request body"
//	@Success	200		{object}	responses.CreateAppUpdateResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/update [post]
func createAppUpdateHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateAppUpdateRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	update, err := svc.CreateAppUpdate(ctx, r.Title, r.Description, r.Content, r.VideoUrl, r.ImageUrl, r.ReleaseDate, r.IsPublished)
	if err != nil {
		l.Error("failed to create app update", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppUpdate)
	}

	return &responses.CreateAppUpdateResponse{
		AppUpdate: *update,
	}, nil
}

// deleteAppUpdateHandler godoc
//
//	@Summary	delete app update
//	@Tags		app
//	@Accept		json
//	@Param		request	body	requests.DeleteAppUpdateRequest	true	"request body"
//	@Success	200
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/update [delete]
func deleteAppUpdateHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteAppUpdateRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Delete, 0, u); err != nil {
		return nil, err
	}

	err := svc.DeleteAppUpdate(ctx, r.Id)
	if err != nil {
		l.Error("failed to delete app update", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppUpdate)
	}

	return nil, nil
}

// updateAppUpdateHandler godoc
//
//	@Summary	update app update
//	@Tags		app
//	@Accept		json
//	@Param		request	body		requests.UpdateAppUpdateRequest	true	"request body"
//	@Success	200		{object}	responses.UpdateAppUpdateResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/update [put]
func updateAppUpdateHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateAppUpdateRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Delete, 0, u); err != nil {
		return nil, err
	}

	updated, err := svc.UpdateAppUpdate(ctx, r.Id, r.Title, r.Description, r.Content, r.VideoUrl, r.ImageUrl, r.ReleaseDate, r.IsPublished)
	if err != nil {
		l.Error("failed to update app update", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppUpdate)
	}

	return &responses.UpdateAppUpdateResponse{
		AppUpdate: *updated,
	}, nil
}

// listAppUpdatesHandler godoc
//
//	@Summary	list all app updates
//	@Tags		app
//	@Produce	json
//	@Param		limit	query	int	false	"limit"
//	@Param		offset	query	int	false	"offset"
//	@Success	200	{object}	responses.ListAppUpdatesResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/updates [get]
func listAppUpdatesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListAppUpdatesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	// Проверяем права админа
	isAdmin := shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Delete, 0, u) == nil

	// Устанавливаем значения по умолчанию
	limit := int32(20)
	if r.Limit != nil && *r.Limit > 0 {
		limit = *r.Limit
	}
	offset := int32(0)
	if r.Offset != nil {
		offset = *r.Offset
	}

	updates, total, err := svc.ListAppUpdates(ctx, isAdmin, limit, offset)
	if err != nil {
		l.Error("failed to list app updates", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppUpdate)
	}

	pages := shared.GetPages(total, int64(limit))

	return &responses.ListAppUpdatesResponse{
		AppUpdates: updates,
		Total:      total,
		Pages:      pages,
	}, nil
}

// getAppUpdateHandler godoc
//
//	@Summary	get app update info
//	@Tags		app
//	@Param		update_id	query	int	true	"update_id"
//	@Produce	json
//	@Success	200	{object}	responses.GetAppUpdateResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/update [get]
func getAppUpdateHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetAppUpdateRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	update, err := svc.GetAppUpdate(ctx, r.Id)
	if err != nil {
		l.Error("failed to get app update", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppUpdate)
	}

	return &responses.GetAppUpdateResponse{
		AppUpdate: *update,
	}, nil
}
