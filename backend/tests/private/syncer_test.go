package private

import (
	"time"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/role"
	user2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/user"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *ControlPlaneTestSuite) TestIDMSyncer() {
	roleRes, err := s.c.Role.PostAPIV1Role(&role.PostAPIV1RoleParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateRoleRequest{
			Description: "streamflow owner",
			Name:        ptr("streamflow_owner"),
			IdmID:       ptr("streamflow_owner"),
		},
		XSuperuserToken: ptr("super_user_token"),
	})
	s.Require().NoError(err)
	s.Require().NotNil(roleRes)
	s.Require().NotNil(roleRes.Payload)

	// create users
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

	// wait for syncer to sync users
	time.Sleep(5 * time.Second)

	roles, err := s.c.User.GetAPIV2UserRoles(&user2.GetAPIV2UserRolesParams{
		Context:         s.ctx,
		UserID:          userRes1.Payload.ID,
		XSuperuserToken: ptr("super_user_token"),
	})
	s.Require().NoError(err)
	s.Require().NotNil(roles)
	s.Require().NotNil(roles.Payload)
	// Проверяем, что созданная роль присутствует в списке ролей пользователя
	var foundRole bool
	for _, r := range roles.Payload.Roles {
		if r.ID == roleRes.Payload.ID {
			foundRole = true
			break
		}
	}
	s.Require().True(foundRole, "Созданная роль должна быть в списке ролей пользователя")
	s.Require().GreaterOrEqual(len(roles.Payload.Roles), 1, "Должна быть хотя бы одна роль")
}

//func (s *ControlPlaneTestSuite) TestABCSyncer() {
//	// create user group
//	userGroupRes, err := s.c.UserGroup.PostAPIV1Usergroup(&user_group.PostAPIV1UsergroupParams{
//		Request: &models.RequestsCreateUserGroupRequest{
//			Name: ptr("abc_12345_Разработчик"),
//		},
//		Context:         s.ctx,
//		XSuperuserToken: ptr("super_user_token"),
//	})
//	s.Require().NoError(err)
//	s.Require().NotNil(userGroupRes)
//	s.Require().NotNil(userGroupRes.Payload)
//
//	userGroupID := userGroupRes.Payload.ID
//
//	// create users
//	userRes1, err := s.c.User.PostAPIV1User(&user.PostAPIV1UserParams{
//		Request: &models.RequestsCreateUserRequest{
//			Name: ptr("test-syncer-user-1"),
//		},
//		Context:         s.ctx,
//		XSuperuserToken: ptr("super_user_token"),
//	})
//	s.Require().NoError(err)
//	s.Require().NotNil(userRes1)
//	s.Require().NotNil(userRes1.Payload)
//
//	userRes2, err := s.c.User.PostAPIV1User(&user.PostAPIV1UserParams{
//		Request: &models.RequestsCreateUserRequest{
//			Name: ptr("test-syncer-user-3"),
//		},
//		Context:         s.ctx,
//		XSuperuserToken: ptr("super_user_token"),
//	})
//	s.Require().NoError(err)
//	s.Require().NotNil(userRes2)
//	s.Require().NotNil(userRes2.Payload)
//	userID2 := userRes2.Payload.ID
//
//	// add user to user group
//
//	addUserToUserGroupRes2, err := s.c.ACL.PostAPIV1UsergroupUser(&acl.PostAPIV1UsergroupUserParams{
//		Request: &models.RequestsAddUserToGroupRequest{
//			UserGroupID: &userGroupID,
//			UserID:      &userID2,
//		},
//		Context:         s.ctx,
//		XSuperuserToken: ptr("super_user_token"),
//	})
//	s.Require().NoError(err)
//	s.Require().NotNil(addUserToUserGroupRes2)
//	s.Require().NotNil(addUserToUserGroupRes2.Payload)
//
//	// wait for syncer to sync users
//	time.Sleep(5 * time.Second)
//
//	// check users in user group
//	userGroupUsersRes, err := s.c.User.GetAPIV1Users(&user.GetAPIV1UsersParams{
//		UserGroupID:     userGroupID,
//		Context:         s.ctx,
//		XSuperuserToken: ptr("super_user_token"),
//	})
//	s.Require().NoError(err)
//	s.Require().NotNil(userGroupUsersRes)
//	s.Require().NotNil(userGroupUsersRes.Payload)
//	s.Require().Equal(2, len(userGroupUsersRes.Payload.Users))
//	s.Require().Equal("test-syncer-user-1", userGroupUsersRes.Payload.Users[0].Name)
//	s.Require().Equal("test-syncer-user-2", userGroupUsersRes.Payload.Users[1].Name)
//}
