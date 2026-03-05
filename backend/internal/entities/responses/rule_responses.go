package responses

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"

type ListUserGroupMatchesResponse struct {
	Rules []dto.MatchedRule `json:"rules"`
}

type ListUserMatchesResponse struct {
	Rules []dto.MatchedRule `json:"rules"`
}

type ListRolesResponse struct {
	Roles []dto.Role `json:"roles"`
}

type ListRulesResponse struct {
	Rules []dto.Rule `json:"rules"`
}

type CreateRuleResponse struct {
	ID int32 `json:"id"`
}

type CreateRoleResponse struct {
	ID int32 `json:"id"`
}
