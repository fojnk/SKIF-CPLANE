package requests

type UserByNameRequest struct {
	Name string `validate:"required"`
}

type UpdateUserGroupRequest struct {
	ID   int32  `json:"id" validate:"required"`
	Name string `json:"name" validate:"required,min=1,max=128"`
}

type ListUsersRequest struct {
	UserGroupID int32 `validate:"required"`
}

type GetUserInfoRequest struct {
}

type CreateUserRequest struct {
	Name string `json:"name" validate:"required,min=1,max=128"`
}

type CreateUserGroupRequest struct {
	Name string `json:"name" validate:"required,min=1,max=128"`
}

type ListUserGroupsRequest struct {
}
