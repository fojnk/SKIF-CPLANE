package public

import (
	"bytes"
	"encoding/json"
	"github.com/go-openapi/runtime/client"
	namespace2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	experiment1 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/client/dataset"
	experiment2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/client/experiment"
	project2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/client/project"
	models1 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/public/models"
	"os"
	"strconv"
	"text/template"
)

func (s *StreamflowTestSuite) TestGetOrchestratorConfig() {
	nsRes, err := s.privateC.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-ocf"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID, s.RobotID)
	s.grantNamespace(nsRes.Payload.ID, s.userID)

	namespaceConfigData := map[string]any{
		"namespace_key": "val",
	}

	namespaceConfigDataBytes, err := json.Marshal(namespaceConfigData)
	s.Require().NoError(err)

	namespaceUpdateRes, err := s.privateC.Namespace.PutAPIV1Namespace(&namespace2.PutAPIV1NamespaceParams{
		Request: &models2.RequestsUpdateNamespaceRequest{
			ID:     &nsRes.Payload.ID,
			Config: string(namespaceConfigDataBytes),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(namespaceUpdateRes)

	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models1.RequestsCreateProjectRequest{
			Name:         ptr("test-project-orchestrator-config"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	projectConfigData := map[string]any{
		"project_key": "val",
	}

	projectConfigDataBytes, err := json.Marshal(projectConfigData)
	s.Require().NoError(err)

	projectUpdateRes, err := s.c.Project.PutAPIV1Project(&project2.PutAPIV1ProjectParams{
		Request: &models1.RequestsUpdateProjectRequest{
			ID:                &projRes.Payload.ID,
			Config:            string(projectConfigDataBytes),
			DisableValidation: true,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(projectUpdateRes)
	s.Require().NotNil(projectUpdateRes.Payload)

	dsRes1, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models1.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-orchestrator-config-1"),
			ProjectID: &projRes.Payload.ID,
			Params:    `{"param1": "value1"}`,
			Schema:    `{"type": "object", "properties": {"param1": {"type": "string"}}}`,
			Type:      "Queue",
			Public:    false,
			Managed:   true,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(dsRes1)
	s.Require().NotNil(dsRes1.Payload)

	dsRes2, err := s.c.Dataset.PostAPIV2Dataset(&dataset.PostAPIV2DatasetParams{
		Request: &models1.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset-orchestrator-config-2"),
			ProjectID: &projRes.Payload.ID,
			Params:    `{"param2": "value2"}`,
			Schema:    `{"type": "object", "properties": {"param2": {"type": "string"}}}`,
			Type:      "Queue",
			Public:    false,
			Managed:   false,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(dsRes2)
	s.Require().NotNil(dsRes2.Payload)

	plRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models1.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-experiment-orchestrator-config"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(plRes)
	s.Require().NotNil(plRes.Payload)

	experimentUpdateRes, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
		Request: &models1.RequestsUpdateCompleteExperimentRequest{
			ExperimentID:        &plRes.Payload.ID,
			Config:            `{"experiment_key": "val", "experiment_variable": "${test_variable_orchestrator_config}"}`,
			DisableValidation: true,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(experimentUpdateRes)
	s.Require().NotNil(experimentUpdateRes.Payload)

	addDsRes1, err := s.c.Experiment.PostAPIV1ExperimentDataset(&experiment2.PostAPIV1ExperimentDatasetParams{
		Request: &models1.RequestsAddDatasetToExperimentRequest{
			DatasetID: &dsRes1.Payload.ID,
			Alias:        ptr("test-alias-orchestrator-config-experiment-datasets-1"),
			ExperimentID:   &plRes.Payload.ID,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes1)
	s.Require().NotNil(addDsRes1.Payload)

	addDsRes2, err := s.c.Experiment.PutAPIV2ExperimentDataset(&experiment2.PutAPIV2ExperimentDatasetParams{
		Request: &models1.RequestsUpdateExperimentDatasetV2Request{
			DatasetID: &dsRes2.Payload.ID,
			Alias:        ptr("test-alias-orchestrator-config-experiment-datasets-2"),
			ExperimentID:   &plRes.Payload.ID,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(addDsRes2)
	s.Require().NotNil(addDsRes2.Payload)

	insVarRes, err := s.c.Experiment.PutAPIV2ExperimentVariable(&experiment2.PutAPIV2ExperimentVariableParams{
		Request: &models1.RequestsUpdateExperimentVariableV2Request{
			ExperimentID: &plRes.Payload.ID,
			Name:       ptr("test_variable_orchestrator_config"),
			Value:      ptr("test_value_orchestrator_config"),
			Type:       ptr("string"),
		},
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(insVarRes)
	s.Require().NotNil(insVarRes.Payload)
	s.Require().Equal("test_variable_orchestrator_config", *insVarRes.Payload.Name)
	s.Require().Equal("test_value_orchestrator_config", *insVarRes.Payload.Value)

	updRes, err := s.c.Experiment.PutAPIV2ExperimentVariable(&experiment2.PutAPIV2ExperimentVariableParams{
		Request: &models1.RequestsUpdateExperimentVariableV2Request{
			ExperimentID: &plRes.Payload.ID,
			Name:       ptr("test_variable_orchestrator_config"),
			Value:      ptr("{\n  \"OnecloudDatacenters\": [\n    \"pc\"\n  ],\n  \"OnecloudQueue\": \"prod.streamflow.prod\"\n}"),
			Type:       ptr("json"),
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(updRes)
	s.Require().NotNil(updRes.Payload)
	s.Require().Equal("test_variable_orchestrator_config", *updRes.Payload.Name)
	s.Require().Equal("{\n  \"OnecloudDatacenters\": [\n    \"pc\"\n  ],\n  \"OnecloudQueue\": \"prod.streamflow.prod\"\n}", *updRes.Payload.Value)

	getvarsRes, err := s.c.Experiment.GetAPIV1ExperimentVariables(&experiment2.GetAPIV1ExperimentVariablesParams{
		ExperimentID: plRes.Payload.ID,
		Context:    s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(getvarsRes)
	s.Require().NotNil(getvarsRes.Payload)
	s.Require().Equal(1, len(getvarsRes.Payload.Variables))
	s.Require().Equal("test_variable_orchestrator_config", *getvarsRes.Payload.Variables[0].Name)
	s.Require().Equal("json", *getvarsRes.Payload.Variables[0].Type)

	getVarRes, err := s.c.Experiment.GetAPIV2ExperimentVariable(&experiment2.GetAPIV2ExperimentVariableParams{
		ExperimentID: plRes.Payload.ID,
		Name:       "test_variable_orchestrator_config",
		Context:    s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(getVarRes)
	s.Require().NotNil(getVarRes.Payload)
	s.Require().Equal("test_variable_orchestrator_config", *getVarRes.Payload.Name)
	s.Require().Equal("{\n  \"OnecloudDatacenters\": [\n    \"pc\"\n  ],\n  \"OnecloudQueue\": \"prod.streamflow.prod\"\n}", *getVarRes.Payload.Value)
	s.Require().Equal("json", *getVarRes.Payload.Type)

	orchestratorConfigRes, err := s.privateC.Experiment.GetAPIV1ExperimentOrchestrator(&experiment1.GetAPIV1ExperimentOrchestratorParams{
		ExperimentID: plRes.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(orchestratorConfigRes)
	s.Require().NotNil(orchestratorConfigRes.Payload)

	jsonConfigExpectedRaw, err := os.ReadFile("../testdata/orch/orchestrator_config1.json")
	s.Require().NoError(err)

	tmpl, err := template.New("orchestrator_config").Parse(string(jsonConfigExpectedRaw))
	s.Require().NoError(err)

	var jsonConfigExpected bytes.Buffer
	err = tmpl.Execute(&jsonConfigExpected, map[string]string{
		"ExperimentID":  strconv.FormatInt(plRes.Payload.ID, 10),
		"ProjectID":   strconv.FormatInt(projRes.Payload.ID, 10),
		"NamespaceID": strconv.FormatInt(nsRes.Payload.ID, 10),
	})
	s.Require().NoError(err)

	s.Require().JSONEq(jsonConfigExpected.String(), orchestratorConfigRes.Payload.Config)

	deleteVarRes, err := s.c.Experiment.DeleteAPIV2ExperimentVariable(&experiment2.DeleteAPIV2ExperimentVariableParams{
		Request: &models1.RequestsDeleteExperimentVariableV2Request{
			ExperimentID: ptr(plRes.Payload.ID),
			Name:       insVarRes.Payload.Name,
		},
		Context: s.ctx,
	}, client.BearerToken(s.token))
	s.Require().NoError(err)
	s.Require().NotNil(deleteVarRes)
	s.Require().NotNil(deleteVarRes.Payload)
}
