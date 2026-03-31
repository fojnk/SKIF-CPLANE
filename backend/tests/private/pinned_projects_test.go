package private

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	project2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestPinnedProjects() {

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

	res, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)
	s.Require().Equal("test-project", res.Payload.Name)

	listRes, err := s.c.Project.GetAPIV1Projects(&project2.GetAPIV1ProjectsParams{
		NamespaceID: nsRes.Payload.ID,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes)
	s.Require().NotNil(listRes.Payload)
	s.Require().Contains(
		derefSlice(s.T(), listRes.Payload.Projects),
		models2.DtoProject{
			ID:   res.Payload.ID,
			Name: "test-project",
		},
	)

	addPin, err := s.c.Project.PostAPIV2ProjectPinned(&project2.PostAPIV2ProjectPinnedParams{
		Request: &models2.RequestsAddPinnedRequest{
			ProjectID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addPin)

	listPins, err := s.c.Project.GetAPIV2ProjectsPinned(&project2.GetAPIV2ProjectsPinnedParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listPins)
	s.Require().Len(listPins.Payload.PinnedProjects, 1)
	s.Require().Equal(listPins.Payload.PinnedProjects[0].ProjectID, res.Payload.ID)
	s.Require().Equal(listPins.Payload.PinnedProjects[0].ProjectName, res.Payload.Name)

	listResV2, err := s.c.Project.PostAPIV2Projects(&project2.PostAPIV2ProjectsParams{
		Context: s.ctx,
		Request: &models2.RequestsListProjectsRequestV2{
			Offset:      ptr(int64(0)),
			Limit:       ptr(int64(10)),
			Search:      "test-project",
			NamespaceID: nsRes.Payload.ID,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(listResV2)
	s.Require().NotNil(listResV2.Payload)
	s.Require().Equal(listResV2.Payload.Projects[0].NamespaceID, nsRes.Payload.ID)
	s.Require().Equal(listResV2.Payload.Projects[0].NamespaceName, "tst-ns-prj")
	s.Require().Equal(int64(0), listResV2.Payload.Projects[0].ExperimentCount)
	s.Require().Equal(int64(0), listResV2.Payload.Projects[0].DatasetCount)
	s.Require().True(listResV2.Payload.Projects[0].IsPinned)
	s.Require().Contains(listResV2.Payload.Projects[0].Rights, models2.ACLRightCreateExperiment)
	s.Require().Contains(listResV2.Payload.Projects[0].Rights, models2.ACLRightEditConfig)
	s.Require().Contains(listResV2.Payload.Projects[0].Rights, models2.ACLRightCreateDataset)

	_, err = s.c.Project.DeleteAPIV2ProjectPinned(&project2.DeleteAPIV2ProjectPinnedParams{
		Context: s.ctx,
		Request: &models2.RequestsDeletePinnedProjectRequest{
			ProjectID: ptr(res.Payload.ID),
		},
	})
	s.Require().NoError(err)

	listPins2, err := s.c.Project.GetAPIV2ProjectsPinned(&project2.GetAPIV2ProjectsPinnedParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listPins2)
	s.Require().Len(listPins2.Payload.PinnedProjects, 0)

	listResV22, err := s.c.Project.PostAPIV2Projects(&project2.PostAPIV2ProjectsParams{
		Context: s.ctx,
		Request: &models2.RequestsListProjectsRequestV2{
			Offset:      ptr(int64(0)),
			Limit:       ptr(int64(10)),
			Search:      "test-project",
			NamespaceID: nsRes.Payload.ID,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(listResV22)
	s.Require().NotNil(listResV22.Payload)
	s.Require().Equal(listResV22.Payload.Projects[0].NamespaceID, nsRes.Payload.ID)
	s.Require().Equal(listResV22.Payload.Projects[0].NamespaceName, "tst-ns-prj")
	s.Require().False(listResV22.Payload.Projects[0].IsPinned)

	resDelete, err := s.c.Project.DeleteAPIV1Project(&project2.DeleteAPIV1ProjectParams{
		Request: &models2.RequestsDeleteProjectRequest{
			ID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(resDelete)

	listRes, err = s.c.Project.GetAPIV1Projects(&project2.GetAPIV1ProjectsParams{
		NamespaceID: nsRes.Payload.ID,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes)
	s.Require().NotNil(listRes.Payload)
	s.Require().Empty(listRes.Payload.Projects)
}
