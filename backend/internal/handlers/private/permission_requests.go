package private

import (
	"context"
	"net/http"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

func checkPermissionRequestsAdminAccess(ctx context.Context, svc *service.Service, l *logger.Logger, u *user.UserInfo) *responses.ErrorResponse {
	if err := shared.CheckPermission(ctx, l, svc, acl.Rule, acl.MetaAttribute, acl.Create, 0, u); err == nil {
		return nil
	} else if err.HTTPStatusCode != http.StatusForbidden {
		return err
	}

	// Root users are treated as app admins in frontend, so backend must allow them too.
	return shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Delete, 0, u)
}

func CreatePermissionRequestHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreatePermissionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	item, err := svc.CreatePermissionRequest(ctx, u.Username, r)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}
	return item, nil
}

func ListMyPermissionRequestsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, _ *struct{}, u *user.UserInfo) (any, *responses.ErrorResponse) {
	items, err := svc.ListMyPermissionRequests(ctx, u.Username)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}
	return &responses.ListPermissionRequestsResponse{
		Items: items,
		Total: int64(len(items)),
	}, nil
}

func ListPermissionRequestsAdminHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListPermissionRequestsAdminRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := checkPermissionRequestsAdminAccess(ctx, svc, l, u); err != nil {
		return nil, err
	}
	items, total, err := svc.ListPermissionRequestsForAdmin(ctx, r)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}
	return &responses.ListPermissionRequestsResponse{Items: items, Total: total}, nil
}

func ApprovePermissionRequestHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ReviewPermissionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := checkPermissionRequestsAdminAccess(ctx, svc, l, u); err != nil {
		return nil, err
	}
	if err := svc.ApprovePermissionRequest(ctx, r.ID, u.Username); err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserRule)
	}
	return &responses.EmptyResponse{}, nil
}

func RejectPermissionRequestHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ReviewPermissionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := checkPermissionRequestsAdminAccess(ctx, svc, l, u); err != nil {
		return nil, err
	}
	if err := svc.RejectPermissionRequest(ctx, r.ID, u.Username); err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}
	return &responses.EmptyResponse{}, nil
}
