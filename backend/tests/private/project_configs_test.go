package private

import (
	"encoding/json"

	namespace2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	project2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestProjectConfigs() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-pkg"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	res, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project-configs"),
			NamespaceID:  &nsRes.Payload.ID,
			Description:  "some project",
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)
	s.Require().Equal("test-project-configs", res.Payload.Name)

	configData := map[string]interface{}{
		"key1": "value1",
		"key2": 42,
		"key3": true,
	}

	configDataBytes, err := json.Marshal(configData)
	s.Require().NoError(err)

	updateRes, err := s.c.Project.PutAPIV1Project(&project2.PutAPIV1ProjectParams{
		Request: &models2.RequestsUpdateProjectRequest{
			ID:                &res.Payload.ID,
			Config:            string(configDataBytes),
			Description:       "some project2",
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().NotNil(updateRes.Payload)

	var configMap map[string]any
	err = json.Unmarshal([]byte(updateRes.Payload.Project.Config), &configMap)
	s.Require().NoError(err)

	s.Require().Equal(configData["key1"], configMap["key1"])
	s.Require().Equal(float64(42), configMap["key2"])
	s.Require().Equal(configData["key3"], configMap["key3"])

	listConfigsResp, err := s.c.Project.GetAPIV1ProjectConfigs(&project2.GetAPIV1ProjectConfigsParams{
		ProjectID: res.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listConfigsResp)
	s.Require().NotNil(listConfigsResp.Payload)
	s.Require().NotEmpty(listConfigsResp.Payload.Configs)
	s.Require().Equal(2, len(listConfigsResp.Payload.Configs))

	getConfigResp, err := s.c.Project.GetAPIV1ProjectConfig(&project2.GetAPIV1ProjectConfigParams{
		ConfigID: listConfigsResp.Payload.Configs[0].ID,
		Context:  s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getConfigResp)
	s.Require().NotNil(getConfigResp.Payload)
	s.Require().NotNil(getConfigResp.Payload.Config)

	err = json.Unmarshal([]byte(getConfigResp.Payload.Config.Config), &configMap)
	s.Require().NoError(err)

	s.Require().Equal(configData["key1"], configMap["key1"])
	s.Require().Equal(float64(42), configMap["key2"])
	s.Require().Equal(configData["key3"], configMap["key3"])
}

func (s *StreamflowTestSuite) TestProjectConfigVersions() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-pcg"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	res, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project-config-versions"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)

	initialConfig := map[string]any{
		"version": "1.0",
		"enabled": true,
		"count":   10,
	}

	initialConfigBytes, err := json.Marshal(initialConfig)
	s.Require().NoError(err)

	updateRes, err := s.c.Project.PutAPIV1Project(&project2.PutAPIV1ProjectParams{
		Request: &models2.RequestsUpdateProjectRequest{
			ID:                &res.Payload.ID,
			Config:            string(initialConfigBytes),
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().NotNil(updateRes.Payload)

	var configMap map[string]any
	err = json.Unmarshal([]byte(updateRes.Payload.Project.Config), &configMap)
	s.Require().NoError(err)

	s.Require().Equal(initialConfig["version"], configMap["version"])

	updatedConfig := map[string]any{
		"version": "2.0",
		"enabled": false,
		"count":   20,
		"newKey":  "added",
	}

	updatedConfigBytes, err := json.Marshal(updatedConfig)
	s.Require().NoError(err)

	updateRes2, err := s.c.Project.PutAPIV1Project(&project2.PutAPIV1ProjectParams{
		Request: &models2.RequestsUpdateProjectRequest{
			ID:                &res.Payload.ID,
			Config:            string(updatedConfigBytes),
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes2)
	s.Require().NotNil(updateRes2.Payload)

	err = json.Unmarshal([]byte(updateRes2.Payload.Project.Config), &configMap)
	s.Require().NoError(err)

	s.Require().Equal(updatedConfig["version"], configMap["version"])
	s.Require().Equal(updatedConfig["newKey"], configMap["newKey"])

	listConfigsResp, err := s.c.Project.GetAPIV1ProjectConfigs(&project2.GetAPIV1ProjectConfigsParams{
		ProjectID: res.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listConfigsResp)
	s.Require().NotNil(listConfigsResp.Payload)
	s.Require().NotEmpty(listConfigsResp.Payload.Configs)
	s.Require().Equal(3, len(listConfigsResp.Payload.Configs))

	configs := listConfigsResp.Payload.Configs
	if configs[0].ID > configs[1].ID {
		configs[0], configs[1] = configs[1], configs[0]
	}

	getConfigResp1, err := s.c.Project.GetAPIV1ProjectConfig(&project2.GetAPIV1ProjectConfigParams{
		ConfigID: configs[0].ID,
		Context:  s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getConfigResp1)
	s.Require().NotNil(getConfigResp1.Payload)
	s.Require().NotNil(getConfigResp1.Payload.Config)

	err = json.Unmarshal([]byte(getConfigResp1.Payload.Config.Config), &configMap)
	s.Require().NoError(err)

	s.Require().Equal(initialConfig["version"], configMap["version"])
	s.Require().Equal(initialConfig["enabled"], configMap["enabled"])
	s.Require().Equal(float64(10), configMap["count"])

	getConfigResp2, err := s.c.Project.GetAPIV1ProjectConfig(&project2.GetAPIV1ProjectConfigParams{
		ConfigID: configs[1].ID,
		Context:  s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getConfigResp2)
	s.Require().NotNil(getConfigResp2.Payload)
	s.Require().NotNil(getConfigResp2.Payload.Config)

	err = json.Unmarshal([]byte(getConfigResp2.Payload.Config.Config), &configMap)
	s.Require().NoError(err)

	s.Require().Equal(updatedConfig["version"], configMap["version"])
	s.Require().Equal(updatedConfig["enabled"], configMap["enabled"])
	s.Require().Equal(updatedConfig["newKey"], configMap["newKey"])
	s.Require().Equal(float64(20), configMap["count"])

	listLogsRes, err := s.c.Project.GetAPIV1ProjectLogs(&project2.GetAPIV1ProjectLogsParams{
		ProjectID: &res.Payload.ID,
		From:      0,
		Limit:     10,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listLogsRes)
	s.Require().NotNil(listLogsRes.Payload)
	s.Require().Len(listLogsRes.Payload.Logs, 3)
	s.Require().Equal(int64(3), listLogsRes.Payload.Total)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[2].User)
	s.Require().Equal("new", listLogsRes.Payload.Logs[2].Act)
	s.Require().Equal("test-project-config-versions", listLogsRes.Payload.Logs[2].Name)

	details1, err := s.c.Project.GetAPIV1ProjectLog(&project2.GetAPIV1ProjectLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[2].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details1)
	s.Require().NotNil(details1.Payload)
	s.Require().Equal("test-project-config-versions", details1.Payload.Details.New.Name)
	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[1].User)
	s.Require().Equal("update", listLogsRes.Payload.Logs[1].Act)
	s.Require().Equal("test-project-config-versions", listLogsRes.Payload.Logs[1].Name)

	details2, err := s.c.Project.GetAPIV1ProjectLog(&project2.GetAPIV1ProjectLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[1].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details2)
	s.Require().NotNil(details2.Payload)
	s.Require().JSONEq(string(initialConfigBytes), details2.Payload.Details.New.Config)
	s.Require().Equal("{}", details2.Payload.Details.Old.Config)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[0].User)
	s.Require().Equal("update", listLogsRes.Payload.Logs[0].Act)
	s.Require().Equal("test-project-config-versions", listLogsRes.Payload.Logs[0].Name)

	details3, err := s.c.Project.GetAPIV1ProjectLog(&project2.GetAPIV1ProjectLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[0].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details3)
	s.Require().NotNil(details3.Payload)
	s.Require().JSONEq(string(initialConfigBytes), details3.Payload.Details.Old.Config)
	s.Require().JSONEq(string(updatedConfigBytes), details3.Payload.Details.New.Config)

	s.Require().Equal("", details3.Payload.Comment)

	_, err = s.c.Project.PutAPIV1ProjectLog(&project2.PutAPIV1ProjectLogParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateProjectLogCommentRequest{
			LogID:      ptr(listLogsRes.Payload.Logs[0].ID),
			NewComment: ptr("new comment"),
		},
	})

	s.Require().NoError(err)

	details4, err := s.c.Project.GetAPIV1ProjectLog(&project2.GetAPIV1ProjectLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[0].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details4)
	s.Require().NotNil(details4.Payload)
	s.Require().Equal("new comment", details4.Payload.Comment)
}

func (s *StreamflowTestSuite) TestNamespaceConfigVersions() {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace2.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-ncg"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	initialConfig := map[string]any{
		"version": "1.0",
	}

	initialConfigBytes, err := json.Marshal(initialConfig)
	s.Require().NoError(err)

	updateRes, err := s.c.Namespace.PutAPIV1Namespace(&namespace2.PutAPIV1NamespaceParams{
		Request: &models2.RequestsUpdateNamespaceRequest{
			ID:     &nsRes.Payload.ID,
			Config: string(initialConfigBytes),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)

	nsGetRes, err := s.c.Namespace.GetAPIV1Namespace(&namespace2.GetAPIV1NamespaceParams{
		NamespaceID: nsRes.Payload.ID,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsGetRes)
	s.Require().NotNil(nsGetRes.Payload)
	s.Require().JSONEq(string(initialConfigBytes), nsGetRes.Payload.Config)

	listConfigsResp, err := s.c.Namespace.GetAPIV1NamespaceConfigs(&namespace2.GetAPIV1NamespaceConfigsParams{
		NamespaceID: nsRes.Payload.ID,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listConfigsResp)
	s.Require().NotNil(listConfigsResp.Payload)
	s.Require().NotEmpty(listConfigsResp.Payload.Configs)
	s.Require().Equal(2, len(listConfigsResp.Payload.Configs))

	getConfigResp1, err := s.c.Namespace.GetAPIV1NamespaceConfig(&namespace2.GetAPIV1NamespaceConfigParams{
		ConfigID: listConfigsResp.Payload.Configs[0].ID,
		Context:  s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getConfigResp1)
	s.Require().NotNil(getConfigResp1.Payload)
	s.Require().NotNil(getConfigResp1.Payload.Config)

	var configMap map[string]any
	err = json.Unmarshal([]byte(getConfigResp1.Payload.Config.Config), &configMap)
	s.Require().NoError(err)

	s.Require().Equal(initialConfig["version"], configMap["version"])

	updatedConfig := map[string]any{
		"version": "2.0",
	}

	updatedConfigBytes, err := json.Marshal(updatedConfig)
	s.Require().NoError(err)

	updateRes2, err := s.c.Namespace.PutAPIV1Namespace(&namespace2.PutAPIV1NamespaceParams{
		Request: &models2.RequestsUpdateNamespaceRequest{
			ID:     &nsRes.Payload.ID,
			Config: string(updatedConfigBytes),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes2)

	nsGetRes2, err := s.c.Namespace.GetAPIV1Namespace(&namespace2.GetAPIV1NamespaceParams{
		NamespaceID: nsRes.Payload.ID,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsGetRes2)
	s.Require().NotNil(nsGetRes2.Payload)
	s.Require().JSONEq(string(updatedConfigBytes), nsGetRes2.Payload.Config)

	listConfigsResp2, err := s.c.Namespace.GetAPIV1NamespaceConfigs(&namespace2.GetAPIV1NamespaceConfigsParams{
		NamespaceID: nsRes.Payload.ID,
		Context:     s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listConfigsResp2)
	s.Require().NotNil(listConfigsResp2.Payload)
	s.Require().NotEmpty(listConfigsResp2.Payload.Configs)
	s.Require().Equal(3, len(listConfigsResp2.Payload.Configs))

	configs := listConfigsResp2.Payload.Configs
	if configs[0].ID > configs[1].ID {
		configs[0], configs[1] = configs[1], configs[0]
	}

	getConfigResp2, err := s.c.Namespace.GetAPIV1NamespaceConfig(&namespace2.GetAPIV1NamespaceConfigParams{
		ConfigID: configs[1].ID,
		Context:  s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getConfigResp2)
	s.Require().NotNil(getConfigResp2.Payload)
	s.Require().NotNil(getConfigResp2.Payload.Config)

	err = json.Unmarshal([]byte(getConfigResp2.Payload.Config.Config), &configMap)
	s.Require().NoError(err)

	s.Require().Equal(updatedConfig["version"], configMap["version"])
}

func (s *StreamflowTestSuite) TestValidationProjectConfig() {
	res, err := s.c.Project.PostAPIV2ProjectConfigValidate(&project2.PostAPIV2ProjectConfigValidateParams{
		Request: &models2.RequestsProjectValidateRequest{
			ProjectConfig: ptr(`
			{
				"YT": {
					"WorkDir": "//home/some/ytdir",
					"Token": "{{ expscr('scr-askfjasdlkfji13', 'secret-key', v=1) }}"
				}
			}
			`),
		},
		Context: s.ctx,
	},
	)

	s.Require().NoError(err)
	s.Require().True(res.Payload.Success)
	s.Require().Empty(res.Payload.Errors)

	resErr, err := s.c.Project.PostAPIV2ProjectConfigValidate(&project2.PostAPIV2ProjectConfigValidateParams{
		Request: &models2.RequestsProjectValidateRequest{
			ProjectConfig: ptr(`
			{
				"YT": {
					"WorkDir": "//home/some/ytdir"
				}
			}
			`),
		},
		Context: s.ctx,
	},
	)

	s.Require().NoError(err)
	s.Require().False(resErr.Payload.Success)
	s.Require().NotEmpty(resErr.Payload.Errors)
}
