package public

import (
	"github.com/go-openapi/runtime/client"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	privateModels "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
	dataset2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/client/dataset"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/client/experiment"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/client/project"
	publicModels "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/models"
)

func (s *ControlPlaneTestSuite) TestExperimentDatasetsBasic() {
	nsRes, err := s.privateC.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &privateModels.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-pds"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID, s.RobotID)

	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &publicModels.RequestsCreateProjectRequest{
			Name:         ptr("test-project-experiment-datasets"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	dsRes, err := s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &publicModels.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-experiment-datasets"),
			ProjectID: &projRes.Payload.ID,
			Type:      "Queue",
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(dsRes)
	s.Require().NotNil(dsRes.Payload)

	plRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment.PostAPIV1ExperimentParams{
		Request: &publicModels.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment-experiment-datasets"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(plRes)
	s.Require().NotNil(plRes.Payload)

	available1, err := s.c.Dataset.PostAPIV2DatasetsSearch(&dataset2.PostAPIV2DatasetsSearchParams{
		Request: &publicModels.RequestsSearchDatasetsRequest{
			Limit:     ptr(int64(10)),
			Offset:    ptr(int64(0)),
			ProjectID: projRes.Payload.ID,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))

	s.Require().NoError(err)
	s.Require().NotNil(available1)
	s.Require().NotNil(available1.Payload)
	s.Require().Equal(int64(1), available1.Payload.Total)

	available, err := s.c.Experiment.PostAPIV2ExperimentSearchDatasets(&experiment.PostAPIV2ExperimentSearchDatasetsParams{
		Request: &publicModels.RequestsGetExperimentAvailableDatasetsToLinkRequest{
			ExperimentID: &plRes.Payload.ID,
			Limit:      ptr(int64(10)),
			Offset:     ptr(int64(0)),
			Filters: &publicModels.DtoDatasetFilters{
				ProjectID: projRes.Payload.ID,
			},
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))

	s.Require().NoError(err)
	s.Require().NotNil(available)
	s.Require().NotNil(available.Payload)
	s.Require().Equal(int64(1), available.Payload.Total)

	addDsRes, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment.PostAPIV1ExperimentDatasetParams{
		Request: &publicModels.RequestsAddDatasetToExperimentRequest{
			DatasetID: &dsRes.Payload.ID,
			Alias:        ptr("test-alias-experiment-datasets"),
			ExperimentID:   &plRes.Payload.ID,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes)
	s.Require().NotNil(addDsRes.Payload)
	s.Require().Equal(addDsRes.Payload.ProjectID, projRes.Payload.ID)

	getPls, err := s.c.Dataset.GetAPIV2DatasetLinks(&dataset2.GetAPIV2DatasetLinksParams{
		DatasetID: dsRes.Payload.ID,
		Limit:        int64(10),
		Offset:       int64(0),
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(getPls)
	s.Require().NotNil(getPls.Payload)
	s.Require().Equal(getPls.Payload.Total, int64(1))

	getDsRes, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: plRes.Payload.ID,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(getDsRes)
	s.Require().NotNil(getDsRes.Payload)

	s.Require().Equal(1, len(getDsRes.Payload.Datasets))
	s.Require().Equal(dsRes.Payload.ID, getDsRes.Payload.Datasets[0].DatasetID)
	s.Require().Equal("test-alias-experiment-datasets", getDsRes.Payload.Datasets[0].Alias)

	dsRes2, err := s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &publicModels.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-experiment-datasets-2"),
			ProjectID: &projRes.Payload.ID,
			Type:      "Queue",
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(dsRes2)
	s.Require().NotNil(dsRes2.Payload)

	addDsRes2, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment.PostAPIV1ExperimentDatasetParams{
		Request: &publicModels.RequestsAddDatasetToExperimentRequest{
			DatasetID: &dsRes2.Payload.ID,
			Alias:        ptr("test-alias-experiment-datasets-2"),
			ExperimentID:   &plRes.Payload.ID,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes2)
	s.Require().NotNil(addDsRes2.Payload)

	getDsRes2, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: plRes.Payload.ID,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(getDsRes2)
	s.Require().NotNil(getDsRes2.Payload)

	s.Require().Equal(2, len(getDsRes2.Payload.Datasets))

	if getDsRes2.Payload.Datasets[0].DatasetID > getDsRes2.Payload.Datasets[1].DatasetID {
		s.Require().Equal(getDsRes2.Payload.Datasets[0].DatasetID, dsRes2.Payload.ID)
		s.Require().Equal(getDsRes2.Payload.Datasets[0].Alias, "test-alias-experiment-datasets-2")
		s.Require().Equal(getDsRes2.Payload.Datasets[1].DatasetID, dsRes.Payload.ID)
		s.Require().Equal(getDsRes2.Payload.Datasets[1].Alias, "test-alias-experiment-datasets")
	} else {
		s.Require().Equal(getDsRes2.Payload.Datasets[0].DatasetID, dsRes.Payload.ID)
		s.Require().Equal(getDsRes2.Payload.Datasets[0].Alias, "test-alias-experiment-datasets")
		s.Require().Equal(getDsRes2.Payload.Datasets[1].DatasetID, dsRes2.Payload.ID)
		s.Require().Equal(getDsRes2.Payload.Datasets[1].Alias, "test-alias-experiment-datasets-2")
	}

	// delete dataset
	delDsRes, err := s.c.Experiment.DeleteAPIV1ExperimentDataset(&experiment.DeleteAPIV1ExperimentDatasetParams{
		Request: &publicModels.RequestsRemoveDatasetFromExperimentRequest{
			ExperimentID: &plRes.Payload.ID,
			LinkID:     &addDsRes.Payload.LinkID,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(delDsRes)
	s.Require().NotNil(delDsRes.Payload)

	getDsRes3, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: plRes.Payload.ID,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(getDsRes3)
	s.Require().NotNil(getDsRes3.Payload)

	s.Require().Equal(1, len(getDsRes3.Payload.Datasets))
	s.Require().Equal(dsRes2.Payload.ID, getDsRes3.Payload.Datasets[0].DatasetID)
	s.Require().Equal("test-alias-experiment-datasets-2", getDsRes3.Payload.Datasets[0].Alias)

	// update dataset
	updateDsRes, err := s.c.Experiment.PutAPIV1ExperimentDataset(&experiment.PutAPIV1ExperimentDatasetParams{
		Request: &publicModels.RequestsUpdateExperimentDatasetRequest{
			ExperimentID: &plRes.Payload.ID,
			LinkID:     &addDsRes2.Payload.LinkID,
			Alias:      ptr("test-alias-experiment-datasets-2-updated"),
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(updateDsRes)
	s.Require().NotNil(updateDsRes.Payload)
	s.Require().Equal("test-alias-experiment-datasets-2-updated", updateDsRes.Payload.Alias)

	getDsRes4, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: plRes.Payload.ID,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(getDsRes4)
	s.Require().NotNil(getDsRes4.Payload)

	s.Require().Equal(1, len(getDsRes4.Payload.Datasets))
	s.Require().Equal(dsRes2.Payload.ID, getDsRes4.Payload.Datasets[0].DatasetID)
	s.Require().Equal("test-alias-experiment-datasets-2-updated", getDsRes4.Payload.Datasets[0].Alias)

}
