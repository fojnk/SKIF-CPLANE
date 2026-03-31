package private

import (
	"bytes"
	"os"
	"text/template"

	experiment2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestExperimentValidation() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-pl"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-experiment"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

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

	getRes, err := s.c.Experiment.GetAPIV1Experiment(&experiment2.GetAPIV1ExperimentParams{
		ExperimentID: res.Payload.ID,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().NotNil(getRes.Payload)
	s.Require().Equal("test-experiment", getRes.Payload.Name)

	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditConfig)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditName)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightDeleteExperiment)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightCreateDataset)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightApplyExperiment)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightStartExperiment)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightStopExperiment)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightDeleteDataset)

	updateRes, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
		Request: &models2.RequestsUpdateCompleteExperimentRequest{
			ExperimentID:      ptr(res.Payload.ID),
			Name:              "updated-experiment",
			Config:            "{\"hello\": \"world\"}",
			Comment:           "add some things",
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().Equal("updated-experiment", updateRes.Payload.Name)

	_, err = s.c.Experiment.PostAPIV1ExperimentVariable(&experiment2.PostAPIV1ExperimentVariableParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateExperimentVariableRequest{
			ExperimentID: ptr(res.Payload.ID),
			Variable: &models2.DtoExperimentVariableForCreate{
				Name:  ptr("proto_events_mapper"),
				Type:  ptr("yql"),
				Value: ptr("{\"hello\": \"world\"}"),
			},
		},
	})

	_, err = s.c.Experiment.PostAPIV1ExperimentVariable(&experiment2.PostAPIV1ExperimentVariableParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateExperimentVariableRequest{
			ExperimentID: ptr(res.Payload.ID),
			Variable: &models2.DtoExperimentVariableForCreate{
				Name:  ptr("proto_vk_mapper"),
				Type:  ptr("yql"),
				Value: ptr("{\"hello\": \"world\"}"),
			},
		},
	})

	_, err = s.c.Experiment.PostAPIV1ExperimentVariable(&experiment2.PostAPIV1ExperimentVariableParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateExperimentVariableRequest{
			ExperimentID: ptr(res.Payload.ID),
			Variable: &models2.DtoExperimentVariableForCreate{
				Name:  ptr("proto_output_serializer"),
				Type:  ptr("yql"),
				Value: ptr("{\"hello\": \"world\"}"),
			},
		},
	})

	goodConfigs := []string{
		"../testdata/experiment/good/experiment_config_empty_cubes.json",
		"../testdata/experiment/good/experiment_profile_stream_event.json",
		"../testdata/experiment/good/experiment_empty_base_sctructure.json"}

	for _, goodConfig := range goodConfigs {
		jsonConfigExpectedRaw, err := os.ReadFile(goodConfig)
		s.Require().NoError(err)

		tmpl, err := template.New("experiment_config").Parse(string(jsonConfigExpectedRaw))
		s.Require().NoError(err)

		var jsonConfigExpected bytes.Buffer
		err = tmpl.Execute(&jsonConfigExpected, map[string]string{})
		s.Require().NoError(err)

		updateRes2, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
			Request: &models2.RequestsUpdateCompleteExperimentRequest{
				ExperimentID: ptr(res.Payload.ID),
				Name:         "updated-experiment",
				Config:       jsonConfigExpected.String(),
				Comment:      "add some things",
			},
			Context: s.ctx,
		})
		s.Require().NoError(err)
		s.Require().NotNil(updateRes2)
		s.Require().Equal("updated-experiment", updateRes2.Payload.Name)

		respVal, err := s.c.Experiment.PostAPIV2ExperimentConfigValidate(&experiment2.PostAPIV2ExperimentConfigValidateParams{
			Context: s.ctx,
			Request: &models2.RequestsCompleteExperimentValidateRequest{
				ExperimentConfig: ptr(updateRes2.Payload.Config),
			},
		})

		s.Require().NoError(err)
		s.Require().NotNil(respVal)
		s.Require().Equal(true, respVal.Payload.Success)
	}

	wrongConfigs := []string{
		"../testdata/experiment/wrong/empty_config.json",
		"../testdata/experiment/wrong/empty_placement.json",
		"../testdata/experiment/wrong/empty_resources.json"}

	for _, wrongConfig := range wrongConfigs {
		jsonConfigExpectedRaw, err := os.ReadFile(wrongConfig)
		s.Require().NoError(err)

		tmpl, err := template.New("experiment_config").Parse(string(jsonConfigExpectedRaw))
		s.Require().NoError(err)

		var jsonConfigExpected bytes.Buffer
		err = tmpl.Execute(&jsonConfigExpected, map[string]string{})
		s.Require().NoError(err)

		updateRes2, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
			Request: &models2.RequestsUpdateCompleteExperimentRequest{
				ExperimentID:      ptr(res.Payload.ID),
				Name:              "updated-experiment",
				Config:            jsonConfigExpected.String(),
				Comment:           "add some things",
				DisableValidation: true,
			},
			Context: s.ctx,
		})
		s.Require().NoError(err)
		s.Require().NotNil(updateRes2)
		s.Require().Equal("updated-experiment", updateRes2.Payload.Name)

		respVal, err := s.c.Experiment.PostAPIV2ExperimentConfigValidate(&experiment2.PostAPIV2ExperimentConfigValidateParams{
			Context: s.ctx,
			Request: &models2.RequestsCompleteExperimentValidateRequest{
				ExperimentConfig: ptr(updateRes2.Payload.Config),
			},
		})

		s.Require().NoError(err)
		s.Require().NotNil(respVal)
		s.Require().Equal(false, respVal.Payload.Success)
	}
}

func (s *StreamflowTestSuite) TestExperimentQuota() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-pl"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-experiment"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

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

	getRes, err := s.c.Experiment.GetAPIV1Experiment(&experiment2.GetAPIV1ExperimentParams{
		ExperimentID: res.Payload.ID,
		Context:      s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().NotNil(getRes.Payload)
	s.Require().Equal("test-experiment", getRes.Payload.Name)

	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditConfig)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditName)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightDeleteExperiment)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightCreateDataset)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightApplyExperiment)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightStartExperiment)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightStopExperiment)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightDeleteDataset)

	_, err = s.c.Experiment.PostAPIV1ExperimentVariable(&experiment2.PostAPIV1ExperimentVariableParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateExperimentVariableRequest{
			ExperimentID: ptr(res.Payload.ID),
			Variable: &models2.DtoExperimentVariableForCreate{
				Name:  ptr("proto_events_mapper"),
				Type:  ptr("yql"),
				Value: ptr("{\"hello\": \"world\"}"),
			},
		},
	})

	_, err = s.c.Experiment.PostAPIV1ExperimentVariable(&experiment2.PostAPIV1ExperimentVariableParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateExperimentVariableRequest{
			ExperimentID: ptr(res.Payload.ID),
			Variable: &models2.DtoExperimentVariableForCreate{
				Name:  ptr("proto_vk_mapper"),
				Type:  ptr("yql"),
				Value: ptr("{\"hello\": \"world\"}"),
			},
		},
	})

	_, err = s.c.Experiment.PostAPIV1ExperimentVariable(&experiment2.PostAPIV1ExperimentVariableParams{
		Context: s.ctx,
		Request: &models2.RequestsCreateExperimentVariableRequest{
			ExperimentID: ptr(res.Payload.ID),
			Variable: &models2.DtoExperimentVariableForCreate{
				Name:  ptr("proto_output_serializer"),
				Type:  ptr("yql"),
				Value: ptr("{\"hello\": \"world\"}"),
			},
		},
	})

	jsonConfigExpectedRaw, err := os.ReadFile("../testdata/experiment/good/experiment_profile_stream_event.json")
	s.Require().NoError(err)

	tmpl, err := template.New("experiment_config").Parse(string(jsonConfigExpectedRaw))
	s.Require().NoError(err)

	var jsonConfigExpected bytes.Buffer
	err = tmpl.Execute(&jsonConfigExpected, map[string]string{})
	s.Require().NoError(err)

	updateRes2, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
		Request: &models2.RequestsUpdateCompleteExperimentRequest{
			ExperimentID: ptr(res.Payload.ID),
			Name:         "updated-experiment",
			Config:       jsonConfigExpected.String(),
			Comment:      "add some things",
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes2)
	s.Require().Equal("updated-experiment", updateRes2.Payload.Name)

	respVal2, err := s.c.Experiment.PostAPIV2ExperimentConfigValidate(&experiment2.PostAPIV2ExperimentConfigValidateParams{
		Context: s.ctx,
		Request: &models2.RequestsCompleteExperimentValidateRequest{
			ExperimentConfig: ptr(updateRes2.Payload.Config),
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(respVal2)
	s.Require().Equal(true, respVal2.Payload.Success)

	_, err = s.c.Experiment.PutAPIV1ExperimentConfigApply(&experiment2.PutAPIV1ExperimentConfigApplyParams{
		Request: &models2.RequestsApplyExperimentConfigRequest{
			ExperimentID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)

	//--------------------------------

	jsonConfigExpectedRaw1, err := os.ReadFile("../testdata/experiment/good/experiment_quota_apply.json")
	s.Require().NoError(err)

	tmpl1, err := template.New("experiment_config").Parse(string(jsonConfigExpectedRaw1))
	s.Require().NoError(err)

	var jsonConfigExpected1 bytes.Buffer
	err = tmpl1.Execute(&jsonConfigExpected1, map[string]string{})
	s.Require().NoError(err)

	updateRes1, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
		Request: &models2.RequestsUpdateCompleteExperimentRequest{
			ExperimentID: ptr(res.Payload.ID),
			Name:         "updated-experiment",
			Config:       jsonConfigExpected1.String(),
			Comment:      "add some things",
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes1)
	s.Require().Equal("updated-experiment", updateRes1.Payload.Name)

	respVal3, err := s.c.Experiment.PostAPIV2ExperimentConfigValidate(&experiment2.PostAPIV2ExperimentConfigValidateParams{
		Context: s.ctx,
		Request: &models2.RequestsCompleteExperimentValidateRequest{
			ExperimentConfig: ptr(updateRes1.Payload.Config),
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(respVal3)
	s.Require().Equal(true, respVal3.Payload.Success)

	applyRes1, err := s.c.Experiment.PutAPIV1ExperimentConfigApply(&experiment2.PutAPIV1ExperimentConfigApplyParams{
		Request: &models2.RequestsApplyExperimentConfigRequest{
			ExperimentID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(applyRes1)
	s.Require().NotNil(applyRes1.Payload)
}

func (s *StreamflowTestSuite) TestExperimentValidationRun() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			// Namespace name must be <= 10 chars (see Max Length tag and namespaceRegExp)
			Name: ptr("tstvalrun"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project-val-run"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	jsonConfigExpectedRaw, err := os.ReadFile("../testdata/experiment/good/experiment_profile_stream_event.json")
	s.Require().NoError(err)

	tmpl, err := template.New("experiment_config").Parse(string(jsonConfigExpectedRaw))
	s.Require().NoError(err)

	var jsonConfigExpected bytes.Buffer
	err = tmpl.Execute(&jsonConfigExpected, map[string]string{})
	s.Require().NoError(err)

	configStr := jsonConfigExpected.String()
	validationRes, err := s.c.Experiment.PostAPIV1ExperimentValidationsRun(&experiment2.PostAPIV1ExperimentValidationsRunParams{
		Request: &models2.RequestsExperimentValidateRunRequest{
			Config: &configStr,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(validationRes)
	s.Require().NotNil(validationRes.Payload)
	s.Require().NotNil(validationRes.Payload.ExperimentIsValid)
	s.Require().NotNil(validationRes.Payload.Summary)
	s.Require().NotNil(validationRes.Payload.Errors)
	s.Require().NotNil(validationRes.Payload.Logs)
	s.Require().NotNil(validationRes.Payload.RunResult)
}
