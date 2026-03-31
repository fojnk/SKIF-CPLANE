package private

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestACL() {
	// Create namespace
	nsResp, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-ps"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsResp)
	s.Require().NotNil(nsResp.Payload)

	s.grantNamespace(nsResp.Payload.ID)

	// Create project
	projResp, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-experiment-status"),
			NamespaceID: ptr(nsResp.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projResp)
	s.Require().NotNil(projResp.Payload)

	// Create complete experiment
	cpResp, err := s.c.Experiment.PostAPIV1Experiment(&experiment.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-cp-experiment-status"),
			ProjectID: ptr(projResp.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(cpResp)
	s.Require().NotNil(cpResp.Payload)

	usersExperiment, err := s.c.ACL.GetAPIV2ACLUsers(&acl.GetAPIV2ACLUsersParams{
		Context:    s.ctx,
		ObjectType: "experiment",
		ObjectID:   cpResp.Payload.ID,
		Limit:      10,
		Offset:     0,
	})

	s.Require().NoError(err)
	s.Require().NotNil(usersExperiment)
	s.requireACLUsersIncludesTestUser(usersExperiment.Payload.Users, "experiment")

	usersProject, err := s.c.ACL.GetAPIV2ACLUsers(&acl.GetAPIV2ACLUsersParams{
		Context:    s.ctx,
		ObjectType: "project",
		ObjectID:   projResp.Payload.ID,
		Limit:      10,
		Offset:     0,
	})

	s.Require().NoError(err)
	s.Require().NotNil(usersProject)
	s.requireACLUsersIncludesTestUser(usersProject.Payload.Users, "project")
}

func (s *StreamflowTestSuite) requireACLUsersIncludesTestUser(users []*models2.DtoUserRights, objectHint string) {
	var found *models2.DtoUserRights
	for _, u := range users {
		s.Require().NotNil(u)
		if u.ID == s.userID {
			found = u
			break
		}
	}
	s.Require().NotNil(found, "expected test user in ACL users for %s", objectHint)
	s.Require().NotEmpty(found.Rights, "test user should have rights on %s", objectHint)
}
