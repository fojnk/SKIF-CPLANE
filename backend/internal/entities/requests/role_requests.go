package requests

type GrantRequest struct {
	UserID      *int32 `json:"user_id"`
	UserGroupID *int32 `json:"user_group_id"`
	RuleID      *int32 `json:"rule_id"`
	RoleID      *int32 `json:"role_id"`
}

type DisclaimRequest struct {
	UserID      *int32 `json:"user_id"`
	UserGroupID *int32 `json:"user_group_id"`
	RuleID      *int32 `json:"rule_id"`
	RoleID      *int32 `json:"role_id"`
}

type AddUserToGroupRequest struct {
	UserID      int32 `json:"user_id" validate:"required"`
	UserGroupID int32 `json:"user_group_id" validate:"required"`
}

type RemoveUserFromGroupRequest struct {
	UserID      int32 `json:"user_id" validate:"required"`
	UserGroupID int32 `json:"user_group_id" validate:"required"`
}

type AddRuleToRoleRequest struct {
	RuleID int32 `json:"rule_id" validate:"required"`
	RoleID int32 `json:"role_id" validate:"required"`
}

type RemoveRuleFromRoleRequest struct {
	RuleID int32 `json:"rule_id" validate:"required"`
	RoleID int32 `json:"role_id" validate:"required"`
}

type CheckPermissionsRequest struct {
	UserID          int32  `validate:"required"`
	ObjectType      string `validate:"required"`
	ObjectAttribute string `validate:"required"`
	ObjectID        int32  `validate:"required"`
}
