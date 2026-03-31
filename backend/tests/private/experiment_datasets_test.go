package private

import (
	dataset2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/dataset"
	experiment2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestExperimentDatasetsBasic() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-pds"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-experiment-datasets"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	dsRes, err := s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-experiment-datasets"),
			ProjectID: &projRes.Payload.ID,
			Type:      "Queue",
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(dsRes)
	s.Require().NotNil(dsRes.Payload)

	plRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment-experiment-datasets"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(plRes)
	s.Require().NotNil(plRes.Payload)

	available1, err := s.c.Dataset.PostAPIV2DatasetsSearch(&dataset2.PostAPIV2DatasetsSearchParams{
		Request: &models2.RequestsSearchDatasetsRequest{
			Limit:     ptr(int64(10)),
			Offset:    ptr(int64(0)),
			ProjectID: projRes.Payload.ID,
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(available1)
	s.Require().NotNil(available1.Payload)
	s.Require().Equal(int64(1), available1.Payload.Total)

	available, err := s.c.Experiment.PostAPIV2ExperimentSearchDatasets(&experiment2.PostAPIV2ExperimentSearchDatasetsParams{
		Request: &models2.RequestsGetExperimentAvailableDatasetsToLinkRequest{
			ExperimentID: &plRes.Payload.ID,
			Limit:        ptr(int64(10)),
			Offset:       ptr(int64(0)),
			Filters: &models2.DtoDatasetFilters{
				ProjectID: projRes.Payload.ID,
			},
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(available)
	s.Require().NotNil(available.Payload)
	s.Require().Equal(int64(1), available.Payload.Total)

	addDsRes, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &dsRes.Payload.ID,
			Alias:        ptr("test-alias-experiment-datasets"),
			ExperimentID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes)
	s.Require().NotNil(addDsRes.Payload)
	s.Require().Equal(addDsRes.Payload.ProjectName, projRes.Payload.Name)
	s.Require().Equal(addDsRes.Payload.ProjectID, projRes.Payload.ID)

	getPls, err := s.c.Dataset.GetAPIV2DatasetLinks(&dataset2.GetAPIV2DatasetLinksParams{
		DatasetID: dsRes.Payload.ID,
		Limit:     int64(10),
		Offset:    int64(0),
	})
	s.Require().NoError(err)
	s.Require().NotNil(getPls)
	s.Require().NotNil(getPls.Payload)
	s.Require().Equal(getPls.Payload.Total, int64(1))

	getDsRes, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment2.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: plRes.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getDsRes)
	s.Require().NotNil(getDsRes.Payload)

	s.Require().Equal(1, len(getDsRes.Payload.Datasets))
	s.Require().Equal(dsRes.Payload.ID, getDsRes.Payload.Datasets[0].DatasetID)
	s.Require().Equal("test-alias-experiment-datasets", getDsRes.Payload.Datasets[0].Alias)

	dsRes2, err := s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-experiment-datasets-2"),
			ProjectID: &projRes.Payload.ID,
			Type:      "Queue",
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(dsRes2)
	s.Require().NotNil(dsRes2.Payload)

	addDsRes2, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &dsRes2.Payload.ID,
			Alias:        ptr("test-alias-experiment-datasets-2"),
			ExperimentID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes2)
	s.Require().NotNil(addDsRes2.Payload)

	getDsRes2, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment2.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: plRes.Payload.ID,
	})
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
	delDsRes, err := s.c.Experiment.DeleteAPIV1ExperimentDataset(&experiment2.DeleteAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsRemoveDatasetFromExperimentRequest{
			ExperimentID: &plRes.Payload.ID,
			LinkID:       &addDsRes.Payload.LinkID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(delDsRes)
	s.Require().NotNil(delDsRes.Payload)

	getDsRes3, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment2.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: plRes.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getDsRes3)
	s.Require().NotNil(getDsRes3.Payload)

	s.Require().Equal(1, len(getDsRes3.Payload.Datasets))
	s.Require().Equal(dsRes2.Payload.ID, getDsRes3.Payload.Datasets[0].DatasetID)
	s.Require().Equal("test-alias-experiment-datasets-2", getDsRes3.Payload.Datasets[0].Alias)

	// update dataset
	updateDsRes, err := s.c.Experiment.PutAPIV1ExperimentDataset(&experiment2.PutAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsUpdateExperimentDatasetRequest{
			ExperimentID: &plRes.Payload.ID,
			LinkID:       &addDsRes2.Payload.LinkID,
			Alias:        ptr("test-alias-experiment-datasets-2-updated"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateDsRes)
	s.Require().NotNil(updateDsRes.Payload)
	s.Require().Equal("test-alias-experiment-datasets-2-updated", updateDsRes.Payload.Alias)

	getDsRes4, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment2.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: plRes.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getDsRes4)
	s.Require().NotNil(getDsRes4.Payload)

	s.Require().Equal(1, len(getDsRes4.Payload.Datasets))
	s.Require().Equal(dsRes2.Payload.ID, getDsRes4.Payload.Datasets[0].DatasetID)
	s.Require().Equal("test-alias-experiment-datasets-2-updated", getDsRes4.Payload.Datasets[0].Alias)

	listLogsRes, err := s.c.Experiment.GetAPIV1ExperimentLogs(&experiment2.GetAPIV1ExperimentLogsParams{
		ExperimentID: &plRes.Payload.ID,
		From:         0,
		Limit:        10,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listLogsRes)
	s.Require().NotNil(listLogsRes.Payload)
	s.Require().Len(listLogsRes.Payload.Logs, 5)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[4].User)
	s.Require().Equal("new", listLogsRes.Payload.Logs[4].Act)

	details1, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[4].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details1)
	s.Require().NotNil(details1.Payload)
	s.Require().Equal("test-experiment-experiment-datasets", details1.Payload.Details.New.Name)
	s.Require().Equal("{}", details1.Payload.Details.New.Config)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[3].User)
	s.Require().Equal("new dataset link", listLogsRes.Payload.Logs[3].Act)

	details2, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[3].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details2)
	s.Require().NotNil(details2.Payload)
	s.Require().Equal("test-alias-experiment-datasets", details2.Payload.Details.New.DatasetAlias)
	s.Require().Equal(dsRes.Payload.ID, details2.Payload.Details.New.DatasetID)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[2].User)
	s.Require().Equal("new dataset link", listLogsRes.Payload.Logs[2].Act)
	s.Require().NotNil(listLogsRes.Payload.Logs[2])

	details3, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[2].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details3)
	s.Require().NotNil(details3.Payload)
	s.Require().Equal("test-alias-experiment-datasets-2", details3.Payload.Details.New.DatasetAlias)
	s.Require().Equal(dsRes2.Payload.ID, details3.Payload.Details.New.DatasetID)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[1].User)
	s.Require().Equal("delete dataset link", listLogsRes.Payload.Logs[1].Act)

	details4, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[1].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details4)
	s.Require().NotNil(details4.Payload)
	s.Require().Equal("test-alias-experiment-datasets", details4.Payload.Details.Old.DatasetAlias)
	s.Require().Equal(dsRes.Payload.ID, details4.Payload.Details.Old.DatasetID)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[0].User)
	s.Require().Equal("update dataset link", listLogsRes.Payload.Logs[0].Act)

	details5, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[0].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details5)
	s.Require().NotNil(details5.Payload)
	s.Require().Equal("test-alias-experiment-datasets-2-updated", details5.Payload.Details.New.DatasetAlias)
	s.Require().Equal("test-alias-experiment-datasets-2", details5.Payload.Details.Old.DatasetAlias)
}
