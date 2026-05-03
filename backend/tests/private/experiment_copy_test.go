package private

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/dataset"
	experiment2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestExperimentCopyCrossNs() {
	// NAMESPACE 1
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("test-ns-pl"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	// PROJECT 1
	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	// ADD DATA SOURCE 1 TO Project 1
	resDataset, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset"),
			ProjectID: &projRes.Payload.ID,
			Type:      ptr("json"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(resDataset)
	s.Require().NotNil(resDataset.Payload)
	s.Require().Equal("test-dataset", resDataset.Payload.Name)

	// NAMESPACE 2
	nsRes2, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("copy-ns-pl"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes2)
	s.Require().NotNil(nsRes2.Payload)

	s.grantNamespace(nsRes2.Payload.ID)

	// PROJECT 2
	projRes2, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("copy-project"),
			NamespaceID: &nsRes2.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes2)
	s.Require().NotNil(projRes2.Payload)

	res, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)

	listRes, err := s.c.Experiment.GetAPIV1Experiments(&experiment2.GetAPIV1ExperimentsParams{
		ProjectID: projRes.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes)
	s.Require().NotNil(listRes.Payload)
	s.Require().Contains(
		derefSlice(s.T(), listRes.Payload.Experiments),
		models2.DtoCompleteExperimentList{
			ID:     res.Payload.ID,
			Name:   "test-experiment",
			Status: "OK",
		},
	)

	resVars, err := s.c.Experiment.PostAPIV1ExperimentVariable(&experiment2.PostAPIV1ExperimentVariableParams{
		Request: &models2.RequestsCreateExperimentVariableRequest{
			ExperimentID: &res.Payload.ID,
			Variable: &models2.DtoExperimentVariableForCreate{
				Name:  ptr("test-variable"),
				Type:  ptr("string"),
				Value: ptr("test-value"),
			},
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(resVars)
	s.Require().NotNil(resVars.Payload)
	s.Require().Equal(resVars.Payload.Variable.Value, ptr("test-value"))
	s.Require().Equal(resVars.Payload.Variable.Type, ptr("string"))
	s.Require().Equal(resVars.Payload.Variable.Name, ptr("test-variable"))

	// LINK DATA SOURCE TO EXPERIMENT 1
	addDsRes, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &resDataset.Payload.ID,
			Alias:        ptr("test-alias-experiment-datasets"),
			ExperimentID: &res.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes)
	s.Require().NotNil(addDsRes.Payload)

	getDsRes, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment2.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: res.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getDsRes)
	s.Require().NotNil(getDsRes.Payload)

	s.Require().Equal(1, len(getDsRes.Payload.Datasets))
	s.Require().Equal(resDataset.Payload.ID, getDsRes.Payload.Datasets[0].DatasetID)
	s.Require().Equal("test-alias-experiment-datasets", getDsRes.Payload.Datasets[0].Alias)

	listRes2, err := s.c.Experiment.GetAPIV1Experiments(&experiment2.GetAPIV1ExperimentsParams{
		ProjectID: projRes2.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes2)
	s.Require().NotNil(listRes2.Payload)
	s.Require().Empty(listRes2.Payload.Experiments)

	res2, err := s.c.Experiment.PostAPIV1ExperimentCopy(&experiment2.PostAPIV1ExperimentCopyParams{
		Request: &models2.RequestsCopyCompleteExperimentRequest{
			Name:            ptr("copy-experiment"),
			ProjectID:       &projRes2.Payload.ID,
			SrcExperimentID: &res.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res2)
	s.Require().NotNil(res2.Payload)

	listRes3, err := s.c.Experiment.GetAPIV1Experiments(&experiment2.GetAPIV1ExperimentsParams{
		ProjectID: projRes2.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes3)
	s.Require().NotNil(listRes3.Payload)
	s.Require().Contains(
		derefSlice(s.T(), listRes3.Payload.Experiments),
		models2.DtoCompleteExperimentList{
			ID:     res2.Payload.ID,
			Name:   "copy-experiment",
			Status: "OK",
		},
	)

	copyResVars, err := s.c.Experiment.GetAPIV1ExperimentVariables(&experiment2.GetAPIV1ExperimentVariablesParams{
		ExperimentID: res2.Payload.ID,
		Context:      s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(copyResVars)
	s.Require().NotNil(copyResVars.Payload)
	s.Require().Equal(copyResVars.Payload.Variables[0].Name, ptr("test-variable"))
	s.Require().Equal(copyResVars.Payload.Variables[0].Type, ptr("string"))

	getDsRes2, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment2.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: res2.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getDsRes2)
	s.Require().NotNil(getDsRes2.Payload)

	s.Require().Equal(0, len(getDsRes2.Payload.Datasets))
	//s.Require().Equal(resDataset.Payload.ID, getDsRes2.Payload.Datasets[0].DatasetID)
	//s.Require().Equal("test-alias-experiment-datasets", getDsRes2.Payload.Datasets[0].Alias)
}

func (s *StreamflowTestSuite) TestExperimentCopySameNsSameProject() {
	// NAMESPACE 1
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("test-ns-pl"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	// PROJECT 1
	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	// PROJECT 2
	projRes2, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("copy-project"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes2)
	s.Require().NotNil(projRes2.Payload)

	// ADD DATA SOURCE 1 TO Project 1
	resDataset, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset"),
			ProjectID: &projRes.Payload.ID,
			Type:      ptr("json"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(resDataset)
	s.Require().NotNil(resDataset.Payload)
	s.Require().Equal("test-dataset", resDataset.Payload.Name)

	res, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)

	listRes, err := s.c.Experiment.GetAPIV1Experiments(&experiment2.GetAPIV1ExperimentsParams{
		ProjectID: projRes.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes)
	s.Require().NotNil(listRes.Payload)
	s.Require().Contains(
		derefSlice(s.T(), listRes.Payload.Experiments),
		models2.DtoCompleteExperimentList{
			ID:     res.Payload.ID,
			Name:   "test-experiment",
			Status: "OK",
		},
	)

	resVars, err := s.c.Experiment.PostAPIV1ExperimentVariable(&experiment2.PostAPIV1ExperimentVariableParams{
		Request: &models2.RequestsCreateExperimentVariableRequest{
			ExperimentID: &res.Payload.ID,
			Variable: &models2.DtoExperimentVariableForCreate{
				Name:  ptr("test-variable"),
				Type:  ptr("string"),
				Value: ptr("test-value"),
			},
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(resVars)
	s.Require().NotNil(resVars.Payload)
	s.Require().Equal(resVars.Payload.Variable.Value, ptr("test-value"))
	s.Require().Equal(resVars.Payload.Variable.Type, ptr("string"))
	s.Require().Equal(resVars.Payload.Variable.Name, ptr("test-variable"))

	// LINK DATA SOURCE TO EXPERIMENT 1
	addDsRes, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &resDataset.Payload.ID,
			Alias:        ptr("test-alias-experiment-datasets"),
			ExperimentID: &res.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes)
	s.Require().NotNil(addDsRes.Payload)

	getDsRes, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment2.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: res.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getDsRes)
	s.Require().NotNil(getDsRes.Payload)

	s.Require().Equal(1, len(getDsRes.Payload.Datasets))
	s.Require().Equal(resDataset.Payload.ID, getDsRes.Payload.Datasets[0].DatasetID)
	s.Require().Equal("test-alias-experiment-datasets", getDsRes.Payload.Datasets[0].Alias)

	listRes2, err := s.c.Experiment.GetAPIV1Experiments(&experiment2.GetAPIV1ExperimentsParams{
		ProjectID: projRes2.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes2)
	s.Require().NotNil(listRes2.Payload)
	s.Require().Empty(listRes2.Payload.Experiments)

	res2, err := s.c.Experiment.PostAPIV1ExperimentCopy(&experiment2.PostAPIV1ExperimentCopyParams{
		Request: &models2.RequestsCopyCompleteExperimentRequest{
			Name:            ptr("copy-experiment"),
			ProjectID:       &projRes2.Payload.ID,
			SrcExperimentID: &res.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res2)
	s.Require().NotNil(res2.Payload)

	listRes3, err := s.c.Experiment.GetAPIV1Experiments(&experiment2.GetAPIV1ExperimentsParams{
		ProjectID: projRes2.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes3)
	s.Require().NotNil(listRes3.Payload)
	s.Require().Contains(
		derefSlice(s.T(), listRes3.Payload.Experiments),
		models2.DtoCompleteExperimentList{
			ID:     res2.Payload.ID,
			Name:   "copy-experiment",
			Status: "OK",
		},
	)

	copyResVars, err := s.c.Experiment.GetAPIV1ExperimentVariables(&experiment2.GetAPIV1ExperimentVariablesParams{
		ExperimentID: res2.Payload.ID,
		Context:      s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(copyResVars)
	s.Require().NotNil(copyResVars.Payload)
	s.Require().Equal(copyResVars.Payload.Variables[0].Name, ptr("test-variable"))
	s.Require().Equal(copyResVars.Payload.Variables[0].Type, ptr("string"))

	getDsRes2, err := s.c.Experiment.GetAPIV1ExperimentDatasets(&experiment2.GetAPIV1ExperimentDatasetsParams{
		ExperimentID: res2.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getDsRes2)
	s.Require().NotNil(getDsRes2.Payload)

	s.Require().Equal(0, len(getDsRes2.Payload.Datasets))
	//s.Require().Equal(resDataset.Payload.ID, getDsRes2.Payload.Datasets[0].DatasetID)
	//s.Require().Equal("test-alias-experiment-datasets", getDsRes2.Payload.Datasets[0].Alias)
}
