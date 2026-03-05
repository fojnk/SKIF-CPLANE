package dto

type MatchedRule struct {
	RuleID          int32  `json:"rule_id"`
	RoleID          int32  `json:"role_id"`
	RoleName        string `json:"role_name"`
	ObjectType      string `json:"object_type"`
	ObjectAttribute string `json:"object_attribute"`
	ObjectID        int32  `json:"object_id"`
	Action          string `json:"action"`
}

type Role struct {
	ID          int32  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Rule struct {
	ID              int32  `json:"id"`
	ObjectType      string `json:"object_type"`
	ObjectAttribute string `json:"object_attribute"`
	ObjectID        int32  `json:"object_id"`
	Action          string `json:"action"`
}
