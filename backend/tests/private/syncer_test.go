package private

import (
	cacl "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/role"
	user2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/user"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestUserRoleGrant() {
	roleRes, err := s.c.Role.PostAPIV1Role(&role.PostAPIV1RoleParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateRoleRequest{
			Description: "streamflow owner",
			Name:        ptr("streamflow_owner"),
			IdmID:       "streamflow_owner",
		},
		XSuperuserToken: ptr("super_user_token"),
	})
	s.Require().NoError(err)
	s.Require().NotNil(roleRes)
	s.Require().NotNil(roleRes.Payload)

	userRes1, err := s.c.User.PostAPIV1User(&user2.PostAPIV1UserParams{
		Request: &models2.RequestsCreateUserRequest{
			Name: ptr("vladimir.petrov"),
		},
		Context:         s.ctx,
		XSuperuserToken: ptr("super_user_token"),
	})
	s.Require().NoError(err)
	s.Require().NotNil(userRes1)
	s.Require().NotNil(userRes1.Payload)

	grantRes, err := s.c.ACL.PostAPIV1Grant(&cacl.PostAPIV1GrantParams{
		Request: &models2.RequestsGrantRequest{
			UserID: userRes1.Payload.ID,
			RoleID: roleRes.Payload.ID,
		},
		XSuperuserToken: ptr("super_user_token"),
		Context:         s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(grantRes)

	roles, err := s.c.User.GetAPIV2UserRoles(&user2.GetAPIV2UserRolesParams{
		Context:         s.ctx,
		UserID:          userRes1.Payload.ID,
		XSuperuserToken: ptr("super_user_token"),
	})
	s.Require().NoError(err)
	s.Require().NotNil(roles)
	s.Require().NotNil(roles.Payload)

	var foundRole bool
	for _, r := range roles.Payload.Roles {
		if r.ID == roleRes.Payload.ID {
			foundRole = true
			break
		}
	}
	s.Require().True(foundRole, "Назначенная роль должна быть в списке ролей пользователя")
	s.Require().GreaterOrEqual(len(roles.Payload.Roles), 1)
}
