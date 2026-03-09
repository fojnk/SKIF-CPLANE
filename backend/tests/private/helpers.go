package private

import (
	"testing"

	"github.com/stretchr/testify/require"
	cacl "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/rule"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func derefSlice[T any](t *testing.T, slice []*T) []T {
	var res []T
	for _, el := range slice {
		require.NotNil(t, el)
		res = append(res, *el)
	}
	return res
}

func ptr[T any](val T) *T {
	return &val
}

func (s *ControlPlaneTestSuite) grantNamespace(namespaceID int64) {
	var req models2.RequestsCreateRuleRequest

	if namespaceID == 0 {
		req = models2.RequestsCreateRuleRequest{
			ObjectType:      ptr("root"),
			ObjectAttribute: ptr("namespace"),
			ObjectID:        ptr(int64(0)),
			Action:          ptr("03D"),
		}
	} else {
		req = models2.RequestsCreateRuleRequest{
			ObjectType:      ptr("namespace"),
			ObjectAttribute: ptr(".*"),
			ObjectID:        ptr(int64(namespaceID)),
			Action:          ptr("03D"),
		}
	}

	ruleRes, err := s.c.Rule.PostAPIV1Rule(&rule.PostAPIV1RuleParams{
		Request:         &req,
		XSuperuserToken: ptr("super_user_token"),
		Context:         s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(ruleRes)

	s.grantRule(ruleRes.Payload.ID)
}

func (s *ControlPlaneTestSuite) grantCubeSystem() {
	req := models2.RequestsCreateRuleRequest{
		ObjectType:      ptr("cube"),
		ObjectAttribute: ptr("cube"),
		ObjectID:        ptr(int64(0)),
		Action:          ptr("03D"),
	}

	ruleRes, err := s.c.Rule.PostAPIV1Rule(&rule.PostAPIV1RuleParams{
		Request:         &req,
		XSuperuserToken: ptr("super_user_token"),
		Context:         s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(ruleRes)

	s.grantRule(ruleRes.Payload.ID)
}

func (s *ControlPlaneTestSuite) grantRule(ruleID int64) {
	grantRes, err := s.c.ACL.PostAPIV1Grant(&cacl.PostAPIV1GrantParams{
		Request: &models2.RequestsGrantRequest{
			UserID: s.userID,
			RuleID: ruleID,
		},
		XSuperuserToken: ptr("super_user_token"),
		Context:         s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(grantRes)
}
