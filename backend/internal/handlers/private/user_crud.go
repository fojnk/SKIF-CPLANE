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

// userInfoHandler godoc
//
//	@Summary	who am i
//	@Tags		user
//	@Accept		json
//	@Produce	json
//	@Success	200	{object}	responses.UserByNameResponse
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/who_am_i [get]
func userInfoHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetUserInfoRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}

	return &responses.UserByNameResponse{
		ID:   userID,
		Name: u.Username,
	}, nil
}

// createUserGroupHandler godoc
//
//	@Summary	create user group
//	@Tags		user_group
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.CreateUserGroupRequest	true	"request body"
//	@Param		x-superuser-token	header		string							false	"superuser token"
//	@Success	200					{object}	responses.CreateUserGroupResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	409					{object}	responses.ErrorResponse	"Conflict - resource already exists"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/usergroup [post]
func createUserGroupHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateUserGroupRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.UserGroup, acl.MetaAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	id, err := svc.CreateUserGroup(ctx, r.Name)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserGroup)
	}

	return &responses.CreateUserGroupResponse{ID: id}, nil
}

// createUserHandler godoc
//
//	@Summary	create user
//	@Tags		user
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.CreateUserRequest	true	"request body"
//	@Param		x-superuser-token	header		string						false	"superuser token"
//	@Success	200					{object}	responses.CreateUserResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	409					{object}	responses.ErrorResponse	"Conflict - resource already exists"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/user [post]
func createUserHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateUserRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.User, acl.MetaAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	id, err := svc.CreateUser(ctx, r.Name)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}

	return &responses.CreateUserResponse{ID: id}, nil
}

// listUsersHandler godoc
//
//	@Summary	list users in user group
//	@Tags		user
//	@Param		user_group_id		query	int		true	"user group id"
//	@Param		x-superuser-token	header	string	false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.ListUsersResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/users [get]
func listUsersHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListUsersRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.User, acl.MetaAttribute, acl.Read, r.UserGroupID, u); err != nil {
		return nil, err
	}

	users, err := svc.ListUsersInGroup(ctx, r.UserGroupID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserGroup)
	}

	return &responses.ListUsersResponse{
		Users: users,
	}, nil
}

// updateUserGroupHandler godoc
//
//	@Summary	update user group
//	@Tags		user_group
//	@Accept		json
//	@Param		request				body	requests.UpdateUserGroupRequest	true	"request body"
//	@Param		x-superuser-token	header	string							false	"superuser token"
//	@Success	200
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/usergroup [put]
func updateUserGroupHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateUserGroupRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.UserGroup, acl.MetaAttribute, acl.Edit, r.ID, u); err != nil {
		return nil, err
	}

	err := svc.UpdateUserGroup(ctx, r.ID, r.Name)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserGroup)
	}

	return nil, nil
}

// userByNameHandler godoc
//
//	@Summary	get user by name
//	@Tags		user
//	@Param		name				query	string	true	"name"
//	@Param		x-superuser-token	header	string	false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.UserByNameResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/user [get]
func userByNameHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UserByNameRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.User, acl.MetaAttribute, acl.Read, 0, u); err != nil {
		return nil, err
	}

	userID, err := svc.GetUserIDByName(ctx, r.Name)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}

	return &responses.UserByNameResponse{
		ID:   userID,
		Name: r.Name,
	}, nil
}

// listUserGroupsHandler godoc
//
//	@Summary	list user groups
//	@Tags		user_group
//	@Param		x-superuser-token	header	string	false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.ListUserGroupsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/usergroups [get]
func listUserGroupsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListUserGroupsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.UserGroup, acl.MetaAttribute, acl.Read, 0, u); err != nil {
		return nil, err
	}

	userGroups, err := svc.ListUserGroups(ctx)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityUserGroup)
	}

	return &responses.ListUserGroupsResponse{
		UserGroups: userGroups,
	}, nil
}
