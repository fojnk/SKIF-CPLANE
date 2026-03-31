package private

import (
	dataset2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/dataset"
	experiment2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	namespace2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	project2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

// check 2
func (s *StreamflowTestSuite) TestDeletes() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("del-" +
				"ns"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	// create project
	prRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			NamespaceID: &nsRes.Payload.ID,
			Name:        ptr("del-pr"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(prRes)
	s.Require().NotNil(prRes.Payload)

	// create dataset
	dsRes, err := s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			ProjectID: &prRes.Payload.ID,
			Name:      ptr("del-ds"),
			Type:      "Queue",
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(dsRes)
	s.Require().NotNil(dsRes.Payload)

	// create experiment
	plRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			ProjectID: &prRes.Payload.ID,
			Name:      ptr("del-pl"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(plRes)
	s.Require().NotNil(plRes.Payload)

	// link dataset to experiment
	linkRes, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			ExperimentID: &plRes.Payload.ID,
			DatasetID:    &dsRes.Payload.ID,
			Alias:        ptr("del-ds-alias"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(linkRes)
	s.Require().NotNil(linkRes.Payload)

	// try to delete namespace
	_, err = s.c.Namespace.DeleteAPIV1Namespace(&namespace2.DeleteAPIV1NamespaceParams{
		Request: &models2.RequestsDeleteNamespaceRequest{
			ID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().Error(err)

	// try to delete project
	_, err = s.c.Project.DeleteAPIV1Project(&project2.DeleteAPIV1ProjectParams{
		Request: &models2.RequestsDeleteProjectRequest{
			ID: &prRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().Error(err)

	// try to delete experiment
	_, err = s.c.Experiment.DeleteAPIV1Experiment(&experiment2.DeleteAPIV1ExperimentParams{
		Request: &models2.RequestsDeleteCompleteExperimentRequest{
			ID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().Error(err)

	// try to delete dataset
	_, err = s.c.Dataset.DeleteAPIV1Dataset(&dataset2.DeleteAPIV1DatasetParams{
		Request: &models2.RequestsDeleteDatasetRequest{
			ID: &dsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().Error(err)

	// remove dataset from experiment
	delLinkRes, err := s.c.Experiment.DeleteAPIV1ExperimentDataset(&experiment2.DeleteAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsRemoveDatasetFromExperimentRequest{
			LinkID:       &linkRes.Payload.LinkID,
			ExperimentID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(delLinkRes)
	s.Require().NotNil(delLinkRes.Payload)

	// ensure link is deleted
	getLinkRes, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment2.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: plRes.Payload.ID,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().Len(getLinkRes.Payload.Datasets, 0)

	// delete dataset
	_, err = s.c.Dataset.DeleteAPIV1Dataset(&dataset2.DeleteAPIV1DatasetParams{
		Request: &models2.RequestsDeleteDatasetRequest{
			ID: &dsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)

	// ensure dataset is deleted
	getDsRes, err := s.c.Dataset.GetAPIV2Datasets(&dataset2.GetAPIV2DatasetsParams{
		ProjectID: prRes.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().Len(getDsRes.Payload.Datasets, 0)

	// delete experiment
	_, err = s.c.Experiment.DeleteAPIV1Experiment(&experiment2.DeleteAPIV1ExperimentParams{
		Request: &models2.RequestsDeleteCompleteExperimentRequest{
			ID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)

	// ensure experiment is deleted
	getPlRes, err := s.c.Experiment.GetAPIV1Experiments(&experiment2.GetAPIV1ExperimentsParams{
		ProjectID: prRes.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().Len(getPlRes.Payload.Experiments, 0)

	// delete project
	_, err = s.c.Project.DeleteAPIV1Project(&project2.DeleteAPIV1ProjectParams{
		Request: &models2.RequestsDeleteProjectRequest{
			ID: &prRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)

	// ensure project is deleted
	getPrRes, err := s.c.Project.GetAPIV1Projects(&project2.GetAPIV1ProjectsParams{
		NamespaceID: nsRes.Payload.ID,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().Len(getPrRes.Payload.Projects, 0)

	// delete namespace
	_, err = s.c.Namespace.DeleteAPIV1Namespace(&namespace2.DeleteAPIV1NamespaceParams{
		Request: &models2.RequestsDeleteNamespaceRequest{
			ID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)

	// ensure namespace is deleted
	getNsRes, err := s.c.Namespace.GetAPIV1Namespaces(&namespace2.GetAPIV1NamespacesParams{
		Context: s.ctx,
	})
	s.Require().NoError(err)
	for _, ns := range getNsRes.Payload.Namespaces {
		s.Require().NotEqual(ns.ID, nsRes.Payload.ID)
	}
}
