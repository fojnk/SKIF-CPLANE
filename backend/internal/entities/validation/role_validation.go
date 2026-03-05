package validation

import (
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
)

func ValidateGrant(r *requests.GrantRequest) error {
	toInt := func(b bool) int {
		if b {
			return 1
		}
		return 0
	}
	if toInt(r.UserGroupID != nil)+toInt(r.UserID != nil) != 1 {
		return fmt.Errorf("user_id or user_group_id should be specified (not both and not neither)")
	}
	if toInt(r.RoleID != nil)+toInt(r.RuleID != nil) != 1 {
		return fmt.Errorf("rule_id or role_id should be specified (not both and not neither)")
	}
	return nil
}

func ValidateDisclaim(r *requests.DisclaimRequest) error {
	toInt := func(b bool) int {
		if b {
			return 1
		}
		return 0
	}
	if toInt(r.UserGroupID != nil)+toInt(r.UserID != nil) != 1 {
		return fmt.Errorf("user_id or user_group_id should be specified (not both and not neither)")
	}
	if toInt(r.RoleID != nil)+toInt(r.RuleID != nil) != 1 {
		return fmt.Errorf("rule_id or role_id should be specified (not both and not neither)")
	}
	return nil
}
