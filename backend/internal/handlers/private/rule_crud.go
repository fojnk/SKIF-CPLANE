package private

import (
	"context"
	"fmt"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

// createRoleHandler godoc
//
//	@Summary	create role
//	@Tags		role
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.CreateRoleRequest	true	"request body"
//	@Param		x-superuser-token	header		string						false	"superuser token"
//	@Success	200					{object}	responses.CreateRoleResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	409					{object}	responses.ErrorResponse	"Conflict - resource already exists"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/role [post]
func createRoleHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateRoleRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Role, acl.MetaAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

    id, err := svc.CreateRole(ctx, r.Name, r.Description, r.IdmID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserRole)
	}

	return &responses.CreateRoleResponse{ID: id}, nil
}

// createRuleHandler godoc
//
//	@Summary	create rule
//	@Tags		rule
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.CreateRuleRequest	true	"request body"
//	@Param		x-superuser-token	header		string						false	"superuser token"
//	@Success	200					{object}	responses.CreateRuleResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/rule [post]
func createRuleHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateRuleRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Rule, acl.MetaAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	id, err := svc.CreateRule(ctx, r.ObjectType, r.ObjectAttribute, r.Action, *r.ObjectID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityRule)
	}

	l.Info(fmt.Sprintf("created rule id: %d, object_type: %s, object_attribute: %s, object_id: %d, action: %s", id, r.ObjectType, r.ObjectAttribute, *r.ObjectID, r.Action))

	return &responses.CreateRuleResponse{ID: id}, nil
}

// listRulesHandler godoc
//
//	@Summary	list role rules
//	@Tags		rule
//	@Param		role_id				query	int		true	"role id"
//	@Param		x-superuser-token	header	string	false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.ListRulesResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/rules [get]
func listRulesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListRulesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Role, acl.MetaAttribute, acl.Read, r.RoleID, u); err != nil {
		return nil, err
	}

	rules, err := svc.ListRoleRules(ctx, r.RoleID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityRole)
	}

	return &responses.ListRulesResponse{
		Rules: rules,
	}, nil
}

// updateRoleHandler godoc
//
//	@Summary	update role
//	@Tags		role
//	@Accept		json
//	@Param		request				body	requests.UpdateRoleRequest	true	"request body"
//	@Param		x-superuser-token	header	string						false	"superuser token"
//	@Success	200
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/role [put]
func updateRoleHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateRoleRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Role, acl.MetaAttribute, acl.Edit, r.ID, u); err != nil {
		return nil, err
	}

	err := svc.UpdateRole(ctx, r.ID, r.Name, r.Description)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityRole)
	}

	return nil, nil
}

// listRolesHandler godoc
//
//	@Summary	list roles
//	@Tags		role
//	@Param		x-superuser-token	header	string	false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.ListRolesResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/roles [get]
func listRolesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListRolesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Role, acl.MetaAttribute, acl.Read, 0, u); err != nil {
		return nil, err
	}

	roles, err := svc.ListRoles(ctx)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityRole)
	}

	return &responses.ListRolesResponse{
		Roles: roles,
	}, nil
}

// listUserMatchesHandler godoc
//
//	@Summary	list user matches
//	@Tags		user_match
//	@Param		user_id				query	int		true	"user id"
//	@Param		x-superuser-token	header	string	false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.ListUserMatchesResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/user_matches [get]
func listUserMatchesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListUserMatchesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Role, acl.MetaAttribute, acl.Read, 0, u); err != nil {
		return nil, err
	}

	matches, err := svc.ListUserMatches(ctx, r.UserID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserRule)
	}

	return &responses.ListUserMatchesResponse{
		Rules: matches,
	}, nil
}

// listUserGroupMatchesHandler godoc
//
//	@Summary	list user group matches
//	@Tags		user_group_match
//	@Param		user_group_id		query	int		true	"user group id"
//	@Param		x-superuser-token	header	string	false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.ListUserGroupMatchesResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/user_group_matches [get]
func listUserGroupMatchesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListUserGroupMatchesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Role, acl.MetaAttribute, acl.Read, 0, u); err != nil {
		return nil, err
	}

	matches, err := svc.ListUserGroupMatches(ctx, r.UserGroupID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserGroupRule)
	}

	return &responses.ListUserGroupMatchesResponse{
		Rules: matches,
	}, nil
}
