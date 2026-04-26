package private

import (
	"bytes"
	"encoding/json"
	"os"
	"strconv"
	"text/template"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/dataset"
	experiment2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	namespace2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	project2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestGetSupervisorConfig() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-ocf"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	namespaceConfigData := map[string]any{
		"namespace_key": "val",
	}

	namespaceConfigDataBytes, err := json.Marshal(namespaceConfigData)
	s.Require().NoError(err)

	namespaceUpdateRes, err := s.c.Namespace.PutAPIV1Namespace(&namespace2.PutAPIV1NamespaceParams{
		Request: &models2.RequestsUpdateNamespaceRequest{
			ID:     &nsRes.Payload.ID,
			Config: string(namespaceConfigDataBytes),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(namespaceUpdateRes)

	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-orchestrator-config"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	projectConfigData := map[string]any{
		"project_key": "val",
	}

	projectConfigDataBytes, err := json.Marshal(projectConfigData)
	s.Require().NoError(err)

	projectUpdateRes, err := s.c.Project.PutAPIV1Project(&project2.PutAPIV1ProjectParams{
		Request: &models2.RequestsUpdateProjectRequest{
			ID:                &projRes.Payload.ID,
			Config:            string(projectConfigDataBytes),
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projectUpdateRes)
	s.Require().NotNil(projectUpdateRes.Payload)

	dsRes1, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-orchestrator-config-1"),
			ProjectID: &projRes.Payload.ID,
			Params:    `{"param1": "value1"}`,
			Schema:    `{"type": "object", "properties": {"param1": {"type": "string"}}}`,
			Type:      "Queue",
			Public:    false,
			Managed:   true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(dsRes1)
	s.Require().NotNil(dsRes1.Payload)

	dsRes2, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-orchestrator-config-2"),
			ProjectID: &projRes.Payload.ID,
			Params:    `{"param2": "value2"}`,
			Schema:    `{"type": "object", "properties": {"param2": {"type": "string"}}}`,
			Type:      "Queue",
			Public:    false,
			Managed:   false,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(dsRes2)
	s.Require().NotNil(dsRes2.Payload)

	plRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment-orchestrator-config"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(plRes)
	s.Require().NotNil(plRes.Payload)

	experimentUpdateRes, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
		Request: &models2.RequestsUpdateCompleteExperimentRequest{
			ExperimentID:      &plRes.Payload.ID,
			Config:            `{"experiment_key": "val", "experiment_variable": "${test_variable_orchestrator_config}"}`,
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(experimentUpdateRes)
	s.Require().NotNil(experimentUpdateRes.Payload)

	addDsRes1, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &dsRes1.Payload.ID,
			Alias:        ptr("test-alias-orchestrator-config-experiment-datasets-1"),
			ExperimentID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes1)
	s.Require().NotNil(addDsRes1.Payload)

	addDsRes2, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &dsRes2.Payload.ID,
			Alias:        ptr("test-alias-orchestrator-config-experiment-datasets-2"),
			ExperimentID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes2)
	s.Require().NotNil(addDsRes2.Payload)

	insVarRes, err := s.c.Experiment.PostAPIV1ExperimentVariable(&experiment2.PostAPIV1ExperimentVariableParams{
		Request: &models2.RequestsCreateExperimentVariableRequest{
			ExperimentID: &plRes.Payload.ID,
			Variable: &models2.DtoExperimentVariableForCreate{
				Name:  ptr("test_variable_orchestrator_config_old"),
				Value: ptr("test_value_orchestrator_config_old"),
				Type:  ptr("string"),
			},
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(insVarRes)
	s.Require().NotNil(insVarRes.Payload)
	s.Require().Equal("test_variable_orchestrator_config_old", *insVarRes.Payload.Variable.Name)
	s.Require().Equal("test_value_orchestrator_config_old", *insVarRes.Payload.Variable.Value)

	versions1, err := s.c.Experiment.GetAPIV2ExperimentVariableVersions(&experiment2.GetAPIV2ExperimentVariableVersionsParams{
		From:         int64(0),
		Limit:        int64(100),
		VariableID:   insVarRes.Payload.Variable.ID,
		ExperimentID: plRes.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(versions1)
	s.Require().NotNil(versions1.Payload)
	s.Require().Len(versions1.Payload.Versions, 1)

	updRes, err := s.c.Experiment.PutAPIV1ExperimentVariable(&experiment2.PutAPIV1ExperimentVariableParams{
		Request: &models2.RequestsUpdateExperimentVariableRequest{
			Variable: &models2.DtoExperimentVariableForUpdate{
				ID:    insVarRes.Payload.Variable.ID,
				Name:  ptr("test_variable_orchestrator_config"),
				Value: ptr("{\n  \"OnecloudDatacenters\": [\n    \"pc\"\n  ],\n  \"OnecloudQueue\": \"prod.streamflow.prod\"\n}"),
				Type:  ptr("json"),
			},
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updRes)
	s.Require().NotNil(updRes.Payload)
	s.Require().Equal("test_variable_orchestrator_config", *updRes.Payload.Variable.Name)
	s.Require().Equal("{\n  \"OnecloudDatacenters\": [\n    \"pc\"\n  ],\n  \"OnecloudQueue\": \"prod.streamflow.prod\"\n}", *updRes.Payload.Variable.Value)

	versions2, err := s.c.Experiment.GetAPIV2ExperimentVariableVersions(&experiment2.GetAPIV2ExperimentVariableVersionsParams{
		From:         int64(0),
		Limit:        int64(100),
		VariableID:   insVarRes.Payload.Variable.ID,
		ExperimentID: plRes.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(versions2)
	s.Require().NotNil(versions2.Payload)
	s.Require().Len(versions2.Payload.Versions, 2)

	version, err := s.c.Experiment.GetAPIV2ExperimentVariableVersion(&experiment2.GetAPIV2ExperimentVariableVersionParams{
		VersionID: insVarRes.Payload.Variable.VersionID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(version)
	s.Require().NotNil(version.Payload)
	s.Require().Equal(version.Payload.Type, *insVarRes.Payload.Variable.Type)

	getvarsRes, err := s.c.Experiment.GetAPIV1ExperimentVariables(&experiment2.GetAPIV1ExperimentVariablesParams{
		ExperimentID: plRes.Payload.ID,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getvarsRes)
	s.Require().NotNil(getvarsRes.Payload)
	s.Require().Equal(1, len(getvarsRes.Payload.Variables))
	s.Require().Equal("test_variable_orchestrator_config", *getvarsRes.Payload.Variables[0].Name)
	s.Require().Equal("json", *getvarsRes.Payload.Variables[0].Type)

	getVarRes, err := s.c.Experiment.GetAPIV1ExperimentVariable(&experiment2.GetAPIV1ExperimentVariableParams{
		VariableID: *insVarRes.Payload.Variable.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getVarRes)
	s.Require().NotNil(getVarRes.Payload)
	s.Require().Equal("test_variable_orchestrator_config", *getVarRes.Payload.Variable.Name)
	s.Require().Equal("{\n  \"OnecloudDatacenters\": [\n    \"pc\"\n  ],\n  \"OnecloudQueue\": \"prod.streamflow.prod\"\n}", *getVarRes.Payload.Variable.Value)
	s.Require().Equal("json", *getVarRes.Payload.Variable.Type)

	supervisorConfigRes, err := s.c.Experiment.GetAPIV1ExperimentSupervisor(&experiment2.GetAPIV1ExperimentSupervisorParams{
		ExperimentID: plRes.Payload.ID,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(supervisorConfigRes)
	s.Require().NotNil(supervisorConfigRes.Payload)

	jsonConfigExpectedRaw, err := os.ReadFile("../testdata/orch/orchestrator_config1.json")
	s.Require().NoError(err)

	tmpl, err := template.New("supervisor_config").Parse(string(jsonConfigExpectedRaw))
	s.Require().NoError(err)

	var jsonConfigExpected bytes.Buffer
	err = tmpl.Execute(&jsonConfigExpected, map[string]string{
		"ExperimentID": strconv.FormatInt(plRes.Payload.ID, 10),
		"ProjectID":    strconv.FormatInt(projRes.Payload.ID, 10),
		"NamespaceID":  strconv.FormatInt(nsRes.Payload.ID, 10),
	})
	s.Require().NoError(err)

	s.Require().JSONEq(jsonConfigExpected.String(), supervisorConfigRes.Payload.Config)

	deleteVarRes, err := s.c.Experiment.DeleteAPIV1ExperimentVariable(&experiment2.DeleteAPIV1ExperimentVariableParams{
		Request: &models2.RequestsDeleteExperimentVariableRequest{
			VariableID: insVarRes.Payload.Variable.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(deleteVarRes)
	s.Require().NotNil(deleteVarRes.Payload)

	listLogsRes, err := s.c.Experiment.GetAPIV1ExperimentLogs(&experiment2.GetAPIV1ExperimentLogsParams{
		ExperimentID: &plRes.Payload.ID,
		From:         0,
		Limit:        10,
		Context:      s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(listLogsRes)
	s.Require().NotNil(listLogsRes.Payload)
	s.Require().Len(listLogsRes.Payload.Logs, 7)
	s.Require().Equal(int64(7), listLogsRes.Payload.Total)
	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[2].User)
	s.Require().Equal("new variable", listLogsRes.Payload.Logs[2].Act)
	s.Require().Equal("test-experiment-orchestrator-config", listLogsRes.Payload.Logs[2].Name)

	details1, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[2].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details1)
	s.Require().NotNil(details1.Payload)
	s.Require().Equal("test_variable_orchestrator_config_old", details1.Payload.Details.New.VariableName)
	s.Require().Equal("test_value_orchestrator_config_old", details1.Payload.Details.New.VariableValue)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[1].User)
	s.Require().Equal("update variable", listLogsRes.Payload.Logs[1].Act)
	s.Require().Equal("test-experiment-orchestrator-config", listLogsRes.Payload.Logs[1].Name)

	details2, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[1].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details2)
	s.Require().NotNil(details2.Payload)
	s.Require().Equal("test_variable_orchestrator_config", details2.Payload.Details.New.VariableName)
	s.Require().Equal("{\n  \"OnecloudDatacenters\": [\n    \"pc\"\n  ],\n  \"OnecloudQueue\": \"prod.streamflow.prod\"\n}", details2.Payload.Details.New.VariableValue)
	s.Require().Equal("test_variable_orchestrator_config_old", details2.Payload.Details.Old.VariableName)
	s.Require().Equal("test_value_orchestrator_config_old", details2.Payload.Details.Old.VariableValue)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[0].User)
	s.Require().Equal("delete variable", listLogsRes.Payload.Logs[0].Act)
	s.Require().Equal("test-experiment-orchestrator-config", listLogsRes.Payload.Logs[0].Name)

	details3, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[0].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details3)
	s.Require().NotNil(details3.Payload)
	s.Require().Equal("test_variable_orchestrator_config", details3.Payload.Details.Old.VariableName)
	s.Require().Equal("{\n  \"OnecloudDatacenters\": [\n    \"pc\"\n  ],\n  \"OnecloudQueue\": \"prod.streamflow.prod\"\n}", details3.Payload.Details.Old.VariableValue)
}

func (s *StreamflowTestSuite) TestGetSupervisorConfigWithNullConfigs() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-n-nocg"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-orchestrator-config-null-configs"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	dsRes1, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-orchestrator-config-null-configs-1"),
			ProjectID: &projRes.Payload.ID,
			Type:      "Queue",
			Managed:   false,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(dsRes1)
	s.Require().NotNil(dsRes1.Payload)

	dsRes2, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-orchestrator-config-null-configs-2"),
			ProjectID: &projRes.Payload.ID,
			Type:      "KeyValue",
			Managed:   false,
			Public:    false,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(dsRes2)
	s.Require().NotNil(dsRes2.Payload)

	plRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment-orchestrator-config-null-configs"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(plRes)
	s.Require().NotNil(plRes.Payload)

	addDsRes1, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &dsRes1.Payload.ID,
			Alias:        ptr("test-alias-orchestrator-config-experiment-datasets-null-configs-1"),
			ExperimentID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes1)
	s.Require().NotNil(addDsRes1.Payload)

	addDsRes2, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &dsRes2.Payload.ID,
			Alias:        ptr("test-alias-orchestrator-config-experiment-datasets-null-configs-2"),
			ExperimentID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes2)
	s.Require().NotNil(addDsRes2.Payload)

	supervisorConfigRes, err := s.c.Experiment.GetAPIV1ExperimentSupervisor(&experiment2.GetAPIV1ExperimentSupervisorParams{
		ExperimentID: plRes.Payload.ID,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(supervisorConfigRes)
	s.Require().NotNil(supervisorConfigRes.Payload)

	jsonConfigExpectedRaw, err := os.ReadFile("../testdata/orch/orchestrator_config_empty.json")
	s.Require().NoError(err)

	tmpl, err := template.New("supervisor_config").Parse(string(jsonConfigExpectedRaw))
	s.Require().NoError(err)

	var jsonConfigExpected bytes.Buffer
	err = tmpl.Execute(&jsonConfigExpected, map[string]string{
		"ExperimentID": strconv.FormatInt(plRes.Payload.ID, 10),
		"ProjectID":    strconv.FormatInt(projRes.Payload.ID, 10),
		"NamespaceID":  strconv.FormatInt(nsRes.Payload.ID, 10),
	})
	s.Require().NoError(err)

	s.Require().JSONEq(jsonConfigExpected.String(), supervisorConfigRes.Payload.Config)
}

func (s *StreamflowTestSuite) TestGetSupervisorConfigWithNoDatasets() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("t-ocfg-nds"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-orchestrator-config-no-datasets"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	plRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment-orchestrator-config-no-datasets"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(plRes)
	s.Require().NotNil(plRes.Payload)

	supervisorConfigRes, err := s.c.Experiment.GetAPIV1ExperimentSupervisor(&experiment2.GetAPIV1ExperimentSupervisorParams{
		ExperimentID: plRes.Payload.ID,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(supervisorConfigRes)
	s.Require().NotNil(supervisorConfigRes.Payload)

	jsonConfigExpectedRaw, err := os.ReadFile("../testdata/orch/orchestrator_config_no_ds.json")
	s.Require().NoError(err)

	tmpl, err := template.New("supervisor_config").Parse(string(jsonConfigExpectedRaw))
	s.Require().NoError(err)

	var jsonConfigExpected bytes.Buffer
	err = tmpl.Execute(&jsonConfigExpected, map[string]string{
		"ExperimentID": strconv.FormatInt(plRes.Payload.ID, 10),
		"ProjectID":    strconv.FormatInt(projRes.Payload.ID, 10),
		"NamespaceID":  strconv.FormatInt(nsRes.Payload.ID, 10),
	})
	s.Require().NoError(err)

	s.Require().JSONEq(jsonConfigExpected.String(), supervisorConfigRes.Payload.Config)
}

func (s *StreamflowTestSuite) TestGetSupervisorConfig2() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-ocf"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	namespaceConfigData := map[string]any{
		"namespace_key": "val",
	}

	namespaceConfigDataBytes, err := json.Marshal(namespaceConfigData)
	s.Require().NoError(err)

	namespaceUpdateRes, err := s.c.Namespace.PutAPIV1Namespace(&namespace2.PutAPIV1NamespaceParams{
		Request: &models2.RequestsUpdateNamespaceRequest{
			ID:     &nsRes.Payload.ID,
			Config: string(namespaceConfigDataBytes),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(namespaceUpdateRes)

	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-orchestrator-config"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	projectConfigData := map[string]any{
		"project_key": "val",
	}

	projectConfigDataBytes, err := json.Marshal(projectConfigData)
	s.Require().NoError(err)

	projectUpdateRes, err := s.c.Project.PutAPIV1Project(&project2.PutAPIV1ProjectParams{
		Request: &models2.RequestsUpdateProjectRequest{
			ID:                &projRes.Payload.ID,
			Config:            string(projectConfigDataBytes),
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projectUpdateRes)
	s.Require().NotNil(projectUpdateRes.Payload)

	dsRes1, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-orchestrator-config-1"),
			ProjectID: &projRes.Payload.ID,
			Params:    `{"param1": "value1"}`,
			Schema:    `{"type": "object", "properties": {"param1": {"type": "string"}}}`,
			Type:      "Queue",
			Managed:   false,
			Public:    false,
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(dsRes1)
	s.Require().NotNil(dsRes1.Payload)

	dsRes2, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-orchestrator-config-2"),
			ProjectID: &projRes.Payload.ID,
			Params:    `{"param2": "value2"}`,
			Schema:    `{"type": "object", "properties": {"param2": {"type": "string"}}}`,
			Type:      "Queue",
			Managed:   true,
			Public:    false,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(dsRes2)
	s.Require().NotNil(dsRes2.Payload)

	plRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment-orchestrator-config"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(plRes)
	s.Require().NotNil(plRes.Payload)

	experimentUpdateRes, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
		Request: &models2.RequestsUpdateCompleteExperimentRequest{
			ExperimentID:      &plRes.Payload.ID,
			Config:            `{"experiment_key": "val", "experiment_variable": "${test_variable_orchestrator_config}"}`,
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(experimentUpdateRes)
	s.Require().NotNil(experimentUpdateRes.Payload)

	addDsRes1, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &dsRes1.Payload.ID,
			Alias:        ptr("test-alias-orchestrator-config-experiment-datasets-1"),
			ExperimentID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes1)
	s.Require().NotNil(addDsRes1.Payload)

	addDsRes2, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &dsRes2.Payload.ID,
			Alias:        ptr("test-alias-orchestrator-config-experiment-datasets-2"),
			ExperimentID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes2)
	s.Require().NotNil(addDsRes2.Payload)

	insVarRes, err := s.c.Experiment.PostAPIV1ExperimentVariable(&experiment2.PostAPIV1ExperimentVariableParams{
		Request: &models2.RequestsCreateExperimentVariableRequest{
			ExperimentID: &plRes.Payload.ID,
			Variable: &models2.DtoExperimentVariableForCreate{
				Name:  ptr("test_variable_orchestrator_config_old"),
				Value: ptr("test_value_orchestrator_config_old"),
				Type:  ptr("string"),
			},
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(insVarRes)
	s.Require().NotNil(insVarRes.Payload)
	s.Require().Equal("test_variable_orchestrator_config_old", *insVarRes.Payload.Variable.Name)
	s.Require().Equal("test_value_orchestrator_config_old", *insVarRes.Payload.Variable.Value)

	updRes, err := s.c.Experiment.PutAPIV1ExperimentVariable(&experiment2.PutAPIV1ExperimentVariableParams{
		Request: &models2.RequestsUpdateExperimentVariableRequest{
			Variable: &models2.DtoExperimentVariableForUpdate{
				ID:    insVarRes.Payload.Variable.ID,
				Name:  ptr("test_variable_orchestrator_config"),
				Value: ptr("test_value_orchestrator_config"),
				Type:  ptr("string"),
			},
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updRes)
	s.Require().NotNil(updRes.Payload)
	s.Require().Equal("test_variable_orchestrator_config", *updRes.Payload.Variable.Name)
	s.Require().Equal("test_value_orchestrator_config", *updRes.Payload.Variable.Value)

	getvarsRes, err := s.c.Experiment.GetAPIV1ExperimentVariables(&experiment2.GetAPIV1ExperimentVariablesParams{
		ExperimentID: plRes.Payload.ID,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getvarsRes)
	s.Require().NotNil(getvarsRes.Payload)
	s.Require().Equal(1, len(getvarsRes.Payload.Variables))
	s.Require().Equal("test_variable_orchestrator_config", *getvarsRes.Payload.Variables[0].Name)
	s.Require().Equal("string", *getvarsRes.Payload.Variables[0].Type)

	getVarRes, err := s.c.Experiment.GetAPIV1ExperimentVariable(&experiment2.GetAPIV1ExperimentVariableParams{
		VariableID: *insVarRes.Payload.Variable.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getVarRes)
	s.Require().NotNil(getVarRes.Payload)
	s.Require().Equal("test_variable_orchestrator_config", *getVarRes.Payload.Variable.Name)
	s.Require().Equal("test_value_orchestrator_config", *getVarRes.Payload.Variable.Value)
	s.Require().Equal("string", *getVarRes.Payload.Variable.Type)

	supervisorConfigRes, err := s.c.Experiment.GetAPIV1ExperimentSupervisor(&experiment2.GetAPIV1ExperimentSupervisorParams{
		ExperimentID: plRes.Payload.ID,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(supervisorConfigRes)
	s.Require().NotNil(supervisorConfigRes.Payload)

	jsonConfigExpectedRaw, err := os.ReadFile("../testdata/orch/orchestrator_config2.json")
	s.Require().NoError(err)

	tmpl, err := template.New("supervisor_config").Parse(string(jsonConfigExpectedRaw))
	s.Require().NoError(err)

	var jsonConfigExpected bytes.Buffer
	err = tmpl.Execute(&jsonConfigExpected, map[string]string{
		"ExperimentID": strconv.FormatInt(plRes.Payload.ID, 10),
		"ProjectID":    strconv.FormatInt(projRes.Payload.ID, 10),
		"NamespaceID":  strconv.FormatInt(nsRes.Payload.ID, 10),
	})
	s.Require().NoError(err)

	s.Require().JSONEq(jsonConfigExpected.String(), supervisorConfigRes.Payload.Config)

	deleteVarRes, err := s.c.Experiment.DeleteAPIV1ExperimentVariable(&experiment2.DeleteAPIV1ExperimentVariableParams{
		Request: &models2.RequestsDeleteExperimentVariableRequest{
			VariableID: insVarRes.Payload.Variable.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(deleteVarRes)
	s.Require().NotNil(deleteVarRes.Payload)

	listLogsRes, err := s.c.Experiment.GetAPIV1ExperimentLogs(&experiment2.GetAPIV1ExperimentLogsParams{
		ExperimentID: &plRes.Payload.ID,
		From:         0,
		Limit:        10,
		Context:      s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(listLogsRes)
	s.Require().NotNil(listLogsRes.Payload)
	s.Require().Len(listLogsRes.Payload.Logs, 7)
	s.Require().Equal(int64(7), listLogsRes.Payload.Total)
	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[2].User)
	s.Require().Equal("new variable", listLogsRes.Payload.Logs[2].Act)
	s.Require().Equal("test-experiment-orchestrator-config", listLogsRes.Payload.Logs[2].Name)

	details1, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[2].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details1)
	s.Require().NotNil(details1.Payload)
	s.Require().Equal("test_variable_orchestrator_config_old", details1.Payload.Details.New.VariableName)
	s.Require().Equal("test_value_orchestrator_config_old", details1.Payload.Details.New.VariableValue)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[1].User)
	s.Require().Equal("update variable", listLogsRes.Payload.Logs[1].Act)
	s.Require().Equal("test-experiment-orchestrator-config", listLogsRes.Payload.Logs[1].Name)

	details2, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[1].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details2)
	s.Require().NotNil(details2.Payload)
	s.Require().Equal("test_variable_orchestrator_config", details2.Payload.Details.New.VariableName)
	s.Require().Equal("test_value_orchestrator_config", details2.Payload.Details.New.VariableValue)
	s.Require().Equal("test_variable_orchestrator_config_old", details2.Payload.Details.Old.VariableName)
	s.Require().Equal("test_value_orchestrator_config_old", details2.Payload.Details.Old.VariableValue)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[0].User)
	s.Require().Equal("delete variable", listLogsRes.Payload.Logs[0].Act)
	s.Require().Equal("test-experiment-orchestrator-config", listLogsRes.Payload.Logs[0].Name)

	details3, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[0].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details3)
	s.Require().NotNil(details3.Payload)
	s.Require().Equal("test_variable_orchestrator_config", details3.Payload.Details.Old.VariableName)
	s.Require().Equal("test_value_orchestrator_config", details3.Payload.Details.Old.VariableValue)

}

func (s *StreamflowTestSuite) TestGetSupervisorConfigDataSchemaV2() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-ocf"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	namespaceConfigData := map[string]any{
		"namespace_key": "val",
	}

	namespaceConfigDataBytes, err := json.Marshal(namespaceConfigData)
	s.Require().NoError(err)

	namespaceUpdateRes, err := s.c.Namespace.PutAPIV1Namespace(&namespace2.PutAPIV1NamespaceParams{
		Request: &models2.RequestsUpdateNamespaceRequest{
			ID:     &nsRes.Payload.ID,
			Config: string(namespaceConfigDataBytes),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(namespaceUpdateRes)

	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-orchestrator-config"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	projectConfigData := map[string]any{
		"project_key": "val",
	}

	projectConfigDataBytes, err := json.Marshal(projectConfigData)
	s.Require().NoError(err)

	projectUpdateRes, err := s.c.Project.PutAPIV1Project(&project2.PutAPIV1ProjectParams{
		Request: &models2.RequestsUpdateProjectRequest{
			ID:                &projRes.Payload.ID,
			Config:            string(projectConfigDataBytes),
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projectUpdateRes)
	s.Require().NotNil(projectUpdateRes.Payload)

	dsRes1, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-orchestrator-config-1"),
			ProjectID: &projRes.Payload.ID,
			Params:    `{"param1": "value1"}`,
			Schema:    `{"columns":[{"column_name":"test","type":"string"}]}`,
			Type:      "Queue",
			Public:    false,
			Managed:   true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(dsRes1)
	s.Require().NotNil(dsRes1.Payload)

	dsRes2, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-orchestrator-config-2"),
			ProjectID: &projRes.Payload.ID,
			Params:    `{"param2": "value2"}`,
			Schema:    `{"columns":[{"column_name":"test_list","list":{"column_name":"test_elem","type":"int64"}}]}`,
			Type:      "Queue",
			Public:    false,
			Managed:   false,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(dsRes2)
	s.Require().NotNil(dsRes2.Payload)

	plRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment-orchestrator-config"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(plRes)
	s.Require().NotNil(plRes.Payload)

	addDsRes1, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &dsRes1.Payload.ID,
			Alias:        ptr("test-alias-orchestrator-config-experiment-datasets-1"),
			ExperimentID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes1)
	s.Require().NotNil(addDsRes1.Payload)

	addDsRes2, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models2.RequestsAddDatasetToExperimentRequest{
			DatasetID:    &dsRes2.Payload.ID,
			Alias:        ptr("test-alias-orchestrator-config-experiment-datasets-2"),
			ExperimentID: &plRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes2)
	s.Require().NotNil(addDsRes2.Payload)

	supervisorConfigRes, err := s.c.Experiment.GetAPIV1ExperimentSupervisor(&experiment2.GetAPIV1ExperimentSupervisorParams{
		ExperimentID: plRes.Payload.ID,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(supervisorConfigRes)
	s.Require().NotNil(supervisorConfigRes.Payload)

	jsonConfigExpectedRaw, err := os.ReadFile("../testdata/orch/orchestrator_config_dataset_schema_v2.json")
	s.Require().NoError(err)

	tmpl, err := template.New("supervisor_config").Parse(string(jsonConfigExpectedRaw))
	s.Require().NoError(err)

	var jsonConfigExpected bytes.Buffer
	err = tmpl.Execute(&jsonConfigExpected, map[string]string{
		"ExperimentID": strconv.FormatInt(plRes.Payload.ID, 10),
		"ProjectID":    strconv.FormatInt(projRes.Payload.ID, 10),
		"NamespaceID":  strconv.FormatInt(nsRes.Payload.ID, 10),
	})
	s.Require().NoError(err)

	s.Require().JSONEq(jsonConfigExpected.String(), supervisorConfigRes.Payload.Config)
}
