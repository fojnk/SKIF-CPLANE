package requests

type CreateRoleRequest struct {
	Name        string `json:"name" validate:"required,min=1,max=128"`
	Description string `json:"description"`
	// IdmID is an optional stable external key stored in t_role.idm_id; when empty, a value is generated.
	IdmID string `json:"idm_id"`
}

type CreateRuleRequest struct {
	ObjectType      string `json:"object_type" validate:"required,oneof=root namespace project experiment dataset cube workspace model"`
	ObjectAttribute string `json:"object_attribute" validate:"required"`
	ObjectID        *int32 `json:"object_id" validate:"required"`
	Action          string `json:"action" validate:"required,oneof=00R 01E 02C 03D"`
}

type ListRulesRequest struct {
	RoleID int32 `validate:"required"`
}

type UpdateRoleRequest struct {
	ID          int32  `json:"id" validate:"required"`
	Name        string `json:"name" validate:"required,min=1,max=128"`
	Description string `json:"description"`
}

type ListRolesRequest struct {
}

type ListUserMatchesRequest struct {
	UserID int32 `validate:"required"`
}

type ListUserGroupMatchesRequest struct {
	UserGroupID int32 `validate:"required"`
}

type ListUserRolesRequest struct {
	UserID int32 `validate:"required"`
}
