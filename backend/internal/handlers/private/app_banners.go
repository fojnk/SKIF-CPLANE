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

// createAppBannerHandler godoc
//
//	@Summary	create app banner
//	@Tags		app
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CreateAppBannerRequest	true	"request body"
//	@Success	200		{object}	responses.CreateAppBannerResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/banner [post]
func createAppBannerHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateAppBannerRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	bannerType := ""
	if r.Type != nil {
		bannerType = *r.Type
	}

	appBannerId, err := svc.CreateAppBanner(ctx, r.Title, r.Message, r.Color, r.ColorDark, bannerType, r.Active, r.Starts, r.Ends)
	if err != nil {
		l.Error("failed to create app banner", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppBanner)
	}

	return &responses.CreateAppBannerResponse{
		Id: appBannerId,
	}, nil
}

// deleteAppBannerHandler godoc
//
//	@Summary	delete app banner
//	@Tags		app
//	@Accept		json
//	@Param		request	body	requests.DeleteAppBannerRequest	true	"request body"
//	@Success	200
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/banner [delete]
func deleteAppBannerHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteAppBannerRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Delete, 0, u); err != nil {
		return nil, err
	}

	err := svc.DeleteAppBanner(ctx, r.Id)
	if err != nil {
		l.Error("failed to delete app banner", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppBanner)
	}

	return nil, nil
}

// updateAppBannerHandler godoc
//
//	@Summary	update app banner
//	@Tags		app
//	@Accept		json
//	@Param		request	body		requests.UpdateAppBannerRequest	true	"request body"
//	@Success	200		{object}	responses.UpdateAppBannerResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/banner [put]
func updateAppBannerHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateAppBannerRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Edit, 0, u); err != nil {
		return nil, err
	}

	updated, err := svc.UpdateAppBanner(ctx, r.Id, r.Title, r.Message, r.Color, r.ColorDark, r.Type, r.Active, r.Starts, r.Ends)
	if err != nil {
		l.Error("failed to update app banner", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppBanner)
	}

	return &responses.UpdateAppBannerResponse{
		AppBanner: *updated,
	}, nil
}

// listAppBannersHandler godoc
//
//	@Summary	list app banners
//	@Tags		app
//	@Produce	json
//	@Success	200	{object}	responses.ListAppBannersResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/banners [get]
func listAppBannersHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetListOfAppBannersRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	banners, err := svc.ListAppBanners(ctx)
	if err != nil {
		l.Error("failed to list app banners", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppBanner)
	}

	return &responses.ListAppBannersResponse{
		AppBanners: banners,
	}, nil
}

// getAppBannerHandler godoc
//
//	@Summary	get app banner info
//	@Tags		app
//	@Param		banner_id	query	int	true	"banner_id"
//	@Produce	json
//	@Success	200	{object}	responses.GetAppBannerResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/banner [get]
func getAppBannerHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetAppBannerRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	banner, err := svc.GetAppBanner(ctx, r.Id)
	if err != nil {
		l.Error("failed to get app banner", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppBanner)
	}

	return &responses.GetAppBannerResponse{
		AppBanner: *banner,
	}, nil
}

// getListAppBannerTypesHandler godoc
//
//	@Summary	get app banner types
//	@Tags		app
//	@Produce	json
//	@Success	200	{object}	responses.GetAvailableBannerTypesResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/banner/types [get]
func getListAppBannerTypesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetAppBannerTypesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	types := svc.GetAvailableBannerTypes()
	return responses.GetAvailableBannerTypesResponse{
		Types: types,
	}, nil
}

// getAppIsAdminHandler godoc
//
//	@Summary	check if user is admin
//	@Tags		app
//	@Produce	json
//	@Success	200	{object}	responses.GetAppIsAdminResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/is-admin [get]
func getAppIsAdminHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetAppIsAdminRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	err := shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Delete, 0, u)
	isAdmin := err == nil

	return &responses.GetAppIsAdminResponse{
		IsAdmin: isAdmin,
	}, nil
}

// getCurrentAppBannerHandler godoc
//
//	@Summary	get current active app banner
//	@Tags		app
//	@Produce	json
//	@Success	200	{object}	responses.GetCurrentAppBannerResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/app/banners/current [get]
func getCurrentAppBannerHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetCurrentAppBannerRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	banner, err := svc.GetCurrentAppBanner(ctx)
	if err != nil {
		l.Error("failed to get current app banner", err)
		return nil, shared.ConvertServiceError(err, shared.EntityAppBanner)
	}

	return &responses.GetCurrentAppBannerResponse{
		AppBanner: banner,
	}, nil
}
