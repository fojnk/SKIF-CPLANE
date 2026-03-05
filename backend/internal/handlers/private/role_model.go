package private

import (
	"context"
	"github.com/jackc/pgx/v5/pgtype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

func createValid(v int32) pgtype.Int4 {
	return pgtype.Int4{
		Int32: v,
		Valid: true,
	}
}

// GrantHandler godoc
//
//	@Summary	grant permission
//	@Tags		acl
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.GrantRequest	true	"request body"
//	@Param		x-superuser-token	header		string					false	"superuser token"
//	@Success	200					{object}	responses.EmptyResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/grant [post]
func GrantHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GrantRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Rule, acl.MetaAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	err := svc.Grant(ctx, r.UserID, r.UserGroupID, r.RoleID, r.RuleID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserRule)
	}

	return &responses.EmptyResponse{}, nil
}

// listUserRolesHandler godoc
//
//	@Summary	list user roles
//	@Tags		user
//	@Param		user_id				query	int		true	"user id"
//	@Param		x-superuser-token	header	string	false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.ListRolesResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/user/roles [get]
func listUserRolesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListUserRolesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Role, acl.MetaAttribute, acl.Read, 0, u); err != nil {
		return nil, err
	}

	roles, err := svc.ListUserRoles(ctx, r.UserID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityRole)
	}

	return &responses.ListRolesResponse{
		Roles: roles,
	}, nil
}

// DisclaimHandler godoc
//
//	@Summary	disclaim permission
//	@Tags		acl
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.DisclaimRequest	true	"request body"
//	@Param		x-superuser-token	header		string						false	"superuser token"
//	@Success	200					{object}	responses.EmptyResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/disclaim [post]
func DisclaimHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DisclaimRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Rule, acl.MetaAttribute, acl.Delete, 0, u); err != nil {
		return nil, err
	}

	err := svc.Disclaim(ctx, r.UserID, r.UserGroupID, r.RoleID, r.RuleID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserRule)
	}

	return &responses.EmptyResponse{}, nil
}

// AddUserToGroupHandler godoc
//
//	@Summary	add user to user_group
//	@Tags		acl
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.AddUserToGroupRequest	true	"request body"
//	@Param		x-superuser-token	header		string							false	"superuser token"
//	@Success	200					{object}	responses.EmptyResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/usergroup/user [post]
func AddUserToGroupHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.AddUserToGroupRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.UserGroup, acl.MetaAttribute, acl.Create, r.UserGroupID, u); err != nil {
		return nil, err
	}

	if err := svc.AddUserToGroup(ctx, r.UserID, r.UserGroupID); err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserGroup)
	}
	return &responses.EmptyResponse{}, nil
}

// RemoveUserFromGroupHandler godoc
//
//	@Summary	remove user from user_group
//	@Tags		acl
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.RemoveUserFromGroupRequest	true	"request body"
//	@Param		x-superuser-token	header		string								false	"superuser token"
//	@Success	200					{object}	responses.EmptyResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/usergroup/user [delete]
func RemoveUserFromGroupHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.RemoveUserFromGroupRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.UserGroup, acl.MetaAttribute, acl.Delete, r.UserGroupID, u); err != nil {
		return nil, err
	}

	if err := svc.RemoveUserFromGroup(ctx, r.UserID, r.UserGroupID); err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserGroup)
	}
	return &responses.EmptyResponse{}, nil
}

// AddRuleToRoleHandler godoc
//
//	@Summary	add rule to role
//	@Tags		acl
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.AddRuleToRoleRequest	true	"request body"
//	@Param		x-superuser-token	header		string							false	"superuser token"
//	@Success	200					{object}	responses.EmptyResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/role/rule [post]
func AddRuleToRoleHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.AddRuleToRoleRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Role, acl.MetaAttribute, acl.Create, r.RoleID, u); err != nil {
		return nil, err
	}

	if err := svc.AddRuleToRole(ctx, r.RuleID, r.RoleID); err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityRule)
	}
	return &responses.EmptyResponse{}, nil
}

// RemoveRuleFromRoleHandler godoc
//
//	@Summary	remove rule from role
//	@Tags		acl
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.RemoveRuleFromRoleRequest	true	"request body"
//	@Param		x-superuser-token	header		string								false	"superuser token"
//	@Success	200					{object}	responses.EmptyResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/role/rule [delete]
func RemoveRuleFromRoleHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.RemoveRuleFromRoleRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Role, acl.MetaAttribute, acl.Delete, r.RoleID, u); err != nil {
		return nil, err
	}

	if err := svc.RemoveRuleFromRole(ctx, r.RuleID, r.RoleID); err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityRule)
	}
	return &responses.EmptyResponse{}, nil
}

// CheckPermissionsHandler godoc
//
//	@Summary	list user's permitted actions on the given resource
//	@Tags		acl
//	@Param		user_id	query	int		true	"user id"
//	@Param		scope	query	string	true	"scope"
//	@Produce	json
//	@Param		x-superuser-token	header		string	false	"superuser token"
//	@Success	200					{object}	responses.CheckPermissionsResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/permissions [get]
func CheckPermissionsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CheckPermissionsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Rule, acl.MetaAttribute, acl.Read, 0, u); err != nil {
		return nil, err
	}

	permissions, err := svc.CheckUserPermissions(ctx, r.UserID, r.ObjectType, r.ObjectAttribute, r.ObjectID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserRule)
	}

	return &responses.CheckPermissionsResponse{
		Permissions: permissions,
	}, nil
}
