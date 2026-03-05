package responses

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
)

type ListUserGroupsResponse struct {
	UserGroups []dto.UserGroup `json:"user_groups"`
}

type UserByNameResponse struct {
	ID   int32  `json:"id"`
	Name string `json:"name"`
}

type ListUsersResponse struct {
	Users []dto.User `json:"users"`
}

type CreateUserResponse struct {
	ID int32 `json:"id"`
}

type CreateUserGroupResponse struct {
	ID int32 `json:"id"`
}
