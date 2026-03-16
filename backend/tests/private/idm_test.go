package private

import (
	idm2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/idm"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestNamespaceRoles() {
	res, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("dplatform"),
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)

	s.grantNamespace(res.Payload.ID)

	roles, err := s.c.Idm.PostAPIV2IdmNamespaceRoles(&idm2.PostAPIV2IdmNamespaceRolesParams{
		Context:         s.ctx,
		XSuperuserToken: ptr("super_user_token"),
	})

	s.Require().NoError(err)
	s.Require().NotNil(roles)
	s.Require().NotNil(roles.Payload)
	s.Require().Equal(roles.Payload.RolesCreated, int64(0))
}

func (s *StreamflowTestSuite) TestProjectRoles() {

	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-prj"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	res, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)
	s.Require().Equal("test-project", res.Payload.Name)

	list, err := s.c.Idm.PostAPIV2IdmProjectRoles(&idm2.PostAPIV2IdmProjectRolesParams{
		Context:         s.ctx,
		XSuperuserToken: ptr("super_user_token"),
	})
	s.Require().NoError(err)
	s.Require().NotNil(list)
	s.Require().NotNil(list.Payload)
	s.Require().Equal(list.Payload.RolesCreated, int64(0))
}
