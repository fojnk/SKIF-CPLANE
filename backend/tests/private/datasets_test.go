package private

import (
	dataset2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/dataset"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	project2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestDatasetPublic() {

	// add namespace 1
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("test-ns3"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	// PROJECT 1
	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project6"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	// add dataset 1 project 1
	res, err := s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset"),
			Type:      ptr("json"),
			ProjectID: &projRes.Payload.ID,
			Schema:    "{\"paramas\": \"hello1\", \"paramas\": \"hello2\"}",
			Params:    "{\"par\": \"hello1\"}",
			Public:    true,
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)
	s.Require().Equal("test-dataset", res.Payload.Name)

	_, err = s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset"),
			Type:      ptr("json"),
			ProjectID: &projRes.Payload.ID,
			Schema:    "{\"paramas\": \"hello1\", \"paramas\": \"hello2\"}",
			Params:    "{\"par\": \"hello1\"}",
			Public:    true,
		},
		Context: s.ctx,
	})

	s.Require().Error(err)

	_, err = s.c.Project.DeleteAPIV1Project(&project2.DeleteAPIV1ProjectParams{
		Context: s.ctx,
		Request: &models2.RequestsDeleteProjectRequest{
			ID: &projRes.Payload.ID,
		},
	})
	s.Require().Error(err)

	// get dataset 1
	getRes, err := s.c.Dataset.GetAPIV2Dataset(&dataset2.GetAPIV2DatasetParams{
		DatasetID: res.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().NotNil(getRes.Payload)
	s.Require().Equal("test-dataset", getRes.Payload.Name)
	s.Require().Equal("json", getRes.Payload.Type)
	s.Require().Equal(true, getRes.Payload.Public)

	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditConfig)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditName)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditSchema)

	// update dataset 1
	updateRes, err := s.c.Dataset.PutAPIV2Dataset(&dataset2.PutAPIV2DatasetParams{
		Request: &models2.RequestsUpdateDatasetRequestV2{
			ID:                ptr(res.Payload.ID),
			Name:              "updated-dataset",
			Schema:            "{\"paramas\": \"hello2\"}",
			Params:            "{\"paramas\": \"hello\"}",
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().NotNil(updateRes.Payload)
	s.Require().Equal("updated-dataset", updateRes.Payload.Dataset.Name)
	s.Require().Equal(true, updateRes.Payload.Dataset.Public)
}

func (s *StreamflowTestSuite) TestDatasetV2() {

	// add namespace 1
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("test-ns-ds"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	// PROJECT 1
	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	// add namespace 2
	nsRes2, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("copy-ns-ds"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes2)
	s.Require().NotNil(nsRes2.Payload)

	s.grantNamespace(nsRes2.Payload.ID)

	// PROJECT 2
	projRes2, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test2-project"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes2)
	s.Require().NotNil(projRes2.Payload)

	// add dataset 1 project 1
	res, err := s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset"),
			Type:      ptr("json"),
			ProjectID: &projRes.Payload.ID,
			Schema:    "{\"paramas\": \"hello1\", \"paramas\": \"hello2\"}",
			Params:    "{\"par\": \"hello1\"}",
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)
	s.Require().Equal("test-dataset", res.Payload.Name)

	// copy dataset 1 to project 2
	copyRes, err := s.c.Dataset.PostAPIV2DatasetCopy(&dataset2.PostAPIV2DatasetCopyParams{
		Request: &models2.RequestsCopyDatasetRequestV2{
			ProjectID:    projRes2.Payload.ID,
			SrcDatasetID: &res.Payload.ID,
			Name:         ptr("test-dataset-copy"),
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(copyRes)
	s.Require().NotNil(copyRes.Payload)
	s.Require().Equal("test-dataset-copy", copyRes.Payload.Name)
	s.Require().Equal("json", copyRes.Payload.Type)

	validRes, err := s.c.Dataset.PostAPIV2DatasetConfigValidate(&dataset2.PostAPIV2DatasetConfigValidateParams{
		Context: s.ctx,
		Request: &models2.RequestsDatasetValidateRequest{
			DatasetConfig: ptr(copyRes.Payload.Params),
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(validRes)
	s.Require().Equal(validRes.Payload.Success, false)

	listResV2, err := s.c.Project.PostAPIV2Projects(&project2.PostAPIV2ProjectsParams{
		Context: s.ctx,
		Request: &models2.RequestsListProjectsRequestV2{
			Limit:       ptr(int64(10)),
			Offset:      ptr(int64(0)),
			Search:      "",
			NamespaceID: nsRes.Payload.ID,
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(listResV2)
	s.Require().NotNil(listResV2.Payload)
	s.Require().Equal(2, len(listResV2.Payload.Projects))
	s.Require().Equal(listResV2.Payload.Projects[0].NamespaceID, nsRes.Payload.ID)
	s.Require().Equal(listResV2.Payload.Projects[0].NamespaceName, "test-ns-ds")
	s.Require().Equal(int64(0), listResV2.Payload.Projects[0].ExperimentCount)
	s.Require().Equal(int64(1), listResV2.Payload.Projects[0].DatasetCount)
	s.Require().Contains(listResV2.Payload.Projects[0].Rights, models2.ACLRightCreateExperiment)
	s.Require().Contains(listResV2.Payload.Projects[0].Rights, models2.ACLRightEditConfig)
	s.Require().Contains(listResV2.Payload.Projects[0].Rights, models2.ACLRightCreateDataset)

	// copy dataset 1 to project 1 (duplicate with diff name)
	copyRes2, err := s.c.Dataset.PostAPIV2DatasetCopy(&dataset2.PostAPIV2DatasetCopyParams{
		Request: &models2.RequestsCopyDatasetRequestV2{
			SrcDatasetID: &res.Payload.ID,
			Name:         ptr("test-dataset-copy2"),
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(copyRes2)
	s.Require().NotNil(copyRes2.Payload)
	s.Require().Equal("test-dataset-copy2", copyRes2.Payload.Name)
	s.Require().Equal("json", copyRes2.Payload.Type)

	listRes2V2, err := s.c.Project.PostAPIV2Projects(&project2.PostAPIV2ProjectsParams{
		Context: s.ctx,
		Request: &models2.RequestsListProjectsRequestV2{
			Limit:       ptr(int64(10)),
			Offset:      ptr(int64(0)),
			Search:      "",
			NamespaceID: nsRes.Payload.ID,
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes2V2)
	s.Require().NotNil(listRes2V2.Payload)
	s.Require().Equal(2, len(listRes2V2.Payload.Projects))
	s.Require().Equal(listRes2V2.Payload.Projects[0].NamespaceID, nsRes.Payload.ID)
	s.Require().Equal(listRes2V2.Payload.Projects[0].NamespaceName, "test-ns-ds")
	s.Require().Equal(int64(0), listRes2V2.Payload.Projects[0].ExperimentCount)
	s.Require().Equal(int64(2), listRes2V2.Payload.Projects[0].DatasetCount)
	s.Require().Equal(int64(0), listRes2V2.Payload.Projects[1].ExperimentCount)
	s.Require().Equal(int64(1), listRes2V2.Payload.Projects[1].DatasetCount)

	// get datasets from project 1
	listRes, err := s.c.Dataset.GetAPIV2Datasets(&dataset2.GetAPIV2DatasetsParams{
		ProjectID: projRes.Payload.ID,
		Context:   s.ctx,
	})

	// project 1 must contains 2 datasets
	s.Require().NoError(err)
	s.Require().NotNil(listRes)
	s.Require().NotNil(listRes.Payload)
	s.Require().Contains(
		derefSlice(s.T(), listRes.Payload.Datasets),
		models2.DtoDataset{
			ID:     res.Payload.ID,
			Name:   "test-dataset",
			Type:   "json",
			Params: "{\"par\": \"hello1\"}",
			Schema: "{\"paramas\": \"hello1\", \"paramas\": \"hello2\"}",
		},
	)
	s.Require().Contains(
		derefSlice(s.T(), listRes.Payload.Datasets),
		models2.DtoDataset{
			ID:     copyRes2.Payload.ID,
			Name:   "test-dataset-copy2",
			Type:   "json",
			Params: "{}",
			Schema: "{\"paramas\": \"hello1\", \"paramas\": \"hello2\"}",
		},
	)

	dsVersions, err := s.c.Dataset.GetAPIV2DatasetVersions(&dataset2.GetAPIV2DatasetVersionsParams{
		Context:   s.ctx,
		DatasetID: res.Payload.ID,
		From:      0,
		Limit:     10,
	})

	s.Require().NoError(err)
	s.Require().NotNil(dsVersions)
	s.Require().Len(dsVersions.Payload.Versions, 1)

	// project 2 must contains 1 dataset
	listRes2, err := s.c.Dataset.GetAPIV2Datasets(&dataset2.GetAPIV2DatasetsParams{
		ProjectID: projRes2.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes2)
	s.Require().NotNil(listRes2.Payload)
	s.Require().Contains(
		derefSlice(s.T(), listRes2.Payload.Datasets),
		models2.DtoDataset{
			ID:     copyRes.Payload.ID,
			Name:   "test-dataset-copy",
			Type:   "json",
			Params: "{}",
			Schema: "{\"paramas\": \"hello1\", \"paramas\": \"hello2\"}",
		},
	)

	// project 2 must contains 1 dataset

	listResCheck, err := s.c.Dataset.PostAPIV2DatasetsSearch(&dataset2.PostAPIV2DatasetsSearchParams{
		Context: s.ctx,
		Request: &models2.RequestsSearchDatasetsRequest{
			Limit:     ptr(int64(10)),
			Offset:    ptr(int64(0)),
			ProjectID: projRes.Payload.ID,
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(listResCheck)

	s.Require().NotNil(listResCheck.Payload)
	s.Require().Equal(2, len(listResCheck.Payload.Datasets))

	// get dataset 1
	getRes, err := s.c.Dataset.GetAPIV2Dataset(&dataset2.GetAPIV2DatasetParams{
		DatasetID: res.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().NotNil(getRes.Payload)
	s.Require().Equal("test-dataset", getRes.Payload.Name)
	s.Require().Equal("json", getRes.Payload.Type)

	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditConfig)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditName)
	s.Require().Contains(getRes.Payload.Rights, models2.ACLRightEditSchema)

	// update dataset 1
	updateRes, err := s.c.Dataset.PutAPIV2Dataset(&dataset2.PutAPIV2DatasetParams{
		Request: &models2.RequestsUpdateDatasetRequestV2{
			ID:                ptr(res.Payload.ID),
			Name:              "updated-dataset",
			Schema:            "{\"paramas\": \"hello2\"}",
			Params:            "{\"paramas\": \"hello\"}",
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().NotNil(updateRes.Payload)
	s.Require().Equal("updated-dataset", updateRes.Payload.Dataset.Name)

	dsVersions2, err := s.c.Dataset.GetAPIV2DatasetVersions(&dataset2.GetAPIV2DatasetVersionsParams{
		Context:   s.ctx,
		DatasetID: res.Payload.ID,
		From:      0,
		Limit:     10,
	})

	s.Require().NoError(err)
	s.Require().NotNil(dsVersions2)
	s.Require().Len(dsVersions2.Payload.Versions, 2)

	version, err := s.c.Dataset.GetAPIV2DatasetVersion(&dataset2.GetAPIV2DatasetVersionParams{
		Context:   s.ctx,
		VersionID: dsVersions2.Payload.Versions[0].ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(version)
	s.Require().NotNil(version.Payload)
	s.Require().Equal(version.Payload.Schema, updateRes.Payload.Dataset.Schema)
	s.Require().Equal(version.Payload.Params, updateRes.Payload.Dataset.Params)
	s.Require().Equal(version.Payload.Type, updateRes.Payload.Dataset.Type)
	s.Require().Equal(version.Payload.Public, updateRes.Payload.Dataset.Public)

	// delete dataset 1
	resDelete, err := s.c.Dataset.DeleteAPIV1Dataset(&dataset2.DeleteAPIV1DatasetParams{
		Request: &models2.RequestsDeleteDatasetRequest{
			ID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(resDelete)

	// delete copy dataset 1 from project 1
	res2Delete, err := s.c.Dataset.DeleteAPIV1Dataset(&dataset2.DeleteAPIV1DatasetParams{
		Request: &models2.RequestsDeleteDatasetRequest{
			ID: ptr(copyRes2.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res2Delete)

	// project 1 must not contain datasets
	listRes, err = s.c.Dataset.GetAPIV2Datasets(&dataset2.GetAPIV2DatasetsParams{
		ProjectID: projRes.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes)
	s.Require().NotNil(listRes.Payload)
	s.Require().Empty(listRes.Payload.Datasets)

	listLogsRes, err := s.c.Dataset.GetAPIV2DatasetLogs(&dataset2.GetAPIV2DatasetLogsParams{
		ProjectID: &projRes.Payload.ID,
		From:      0,
		Limit:     10,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listLogsRes)
	s.Require().NotNil(listLogsRes.Payload)

	s.Require().Len(listLogsRes.Payload.Logs, 5)
	s.Require().Equal(int64(5), listLogsRes.Payload.Total)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[3].User)
	s.Require().Equal("new", listLogsRes.Payload.Logs[3].Act)
	s.Require().Equal("[deleted]", listLogsRes.Payload.Logs[3].Name)

	details1, err := s.c.Dataset.GetAPIV1DatasetLog(&dataset2.GetAPIV1DatasetLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[4].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details1)
	s.Require().NotNil(details1.Payload)
	s.Require().Equal("test-dataset", details1.Payload.Details.New.Name)
	s.Require().Equal("json", details1.Payload.Details.New.Type)

	s.Require().Equal("{\"par\": \"hello1\"}", details1.Payload.Details.New.Params)
	s.Require().Equal("{\"paramas\": \"hello1\", \"paramas\": \"hello2\"}", details1.Payload.Details.New.Schema)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[2].User)
	s.Require().Equal("update", listLogsRes.Payload.Logs[2].Act)
	s.Require().Equal("[deleted]", listLogsRes.Payload.Logs[2].Name)

	details2, err := s.c.Dataset.GetAPIV1DatasetLog(&dataset2.GetAPIV1DatasetLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[2].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details2)
	s.Require().NotNil(details2.Payload)
	s.Require().Equal("updated-dataset", details2.Payload.Details.New.Name)
	s.Require().Equal("test-dataset", details2.Payload.Details.Old.Name)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[1].User)
	s.Require().Equal("delete", listLogsRes.Payload.Logs[1].Act)
	s.Require().Equal("[deleted]", listLogsRes.Payload.Logs[1].Name)

	res3, err := s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("check"),
			Type:      ptr("json"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(res3)
	s.Require().NotNil(res3.Payload)
	s.Require().Equal("check", res3.Payload.Name)

	details3, err := s.c.Dataset.GetAPIV1DatasetLog(&dataset2.GetAPIV1DatasetLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[1].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details3)
	s.Require().NotNil(details3.Payload)
	s.Require().Equal("updated-dataset", details3.Payload.Details.Old.Name)
}

func (s *StreamflowTestSuite) TestDatasetSearch2() {

	// add namespace 1
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("test-ns-ds"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	// PROJECT 1
	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:        ptr("test-project"),
			NamespaceID: &nsRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	// add dataset 1 project 1
	res, err := s.c.Dataset.PostAPIV2Dataset(&dataset2.PostAPIV2DatasetParams{
		Request: &models2.RequestsCreateDatasetRequestV2{
			Name:      ptr("test-dataset"),
			Type:      ptr("json"),
			ProjectID: &projRes.Payload.ID,
			Schema: `{
						"columns": [
						{
							"name": "$tablet_index",
							"type_v3": "{item=int64;}"
						},
						{
							"name": "$row_index",
							"type_v3": "{item=int64;}"
						},
						{
							"name": "payload",
							"type_v3": "{type_name=optional;item=yson;}"
						}
				  	]
				}`,
			Params: `{	
						"YT": {
    						"Cluster": "miranda.yt.idzn.ru",
    						"Path": "//home/adtech/adtech-profile/users-lists/remarketing_users_lists_mapped_to_hid"
						},
						"SourceType": "ST_EXTERNAL_KEY_VALUE"
					}`,
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)
	s.Require().Equal("test-dataset", res.Payload.Name)

	// copy dataset 1 to project 1 (duplicate with diff name)
	copyRes2, err := s.c.Dataset.PostAPIV2DatasetCopy(&dataset2.PostAPIV2DatasetCopyParams{
		Request: &models2.RequestsCopyDatasetRequestV2{
			SrcDatasetID: &res.Payload.ID,
			Name:         ptr("test-dataset-copy2"),
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(copyRes2)
	s.Require().NotNil(copyRes2.Payload)
	s.Require().Equal("test-dataset-copy2", copyRes2.Payload.Name)
	s.Require().Equal("json", copyRes2.Payload.Type)

	check, err := s.c.Dataset.GetAPIV2Dataset(&dataset2.GetAPIV2DatasetParams{
		Context:   s.ctx,
		DatasetID: copyRes2.Payload.ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(check)
	s.Require().NotNil(check.Payload)
	s.Require().Equal("test-dataset-copy2", check.Payload.Name)
	s.Require().Equal("json", check.Payload.Type)

	// get datasets from project 1
	listRes, err := s.c.Dataset.GetAPIV2Datasets(&dataset2.GetAPIV2DatasetsParams{
		ProjectID: projRes.Payload.ID,
		Context:   s.ctx,
	})

	// project 1 must contains 2 datasets
	s.Require().NoError(err)
	s.Require().NotNil(listRes)
	s.Require().NotNil(listRes.Payload)
	s.Require().Contains(
		derefSlice(s.T(), listRes.Payload.Datasets),
		models2.DtoDataset{
			ID:   res.Payload.ID,
			Name: "test-dataset",
			Type: "json",
			Params: `{	
						"YT": {
    						"Cluster": "miranda.yt.idzn.ru",
    						"Path": "//home/adtech/adtech-profile/users-lists/remarketing_users_lists_mapped_to_hid"
						},
						"SourceType": "ST_EXTERNAL_KEY_VALUE"
					}`,
			Schema: `{
						"columns": [
						{
							"name": "$tablet_index",
							"type_v3": "{item=int64;}"
						},
						{
							"name": "$row_index",
							"type_v3": "{item=int64;}"
						},
						{
							"name": "payload",
							"type_v3": "{type_name=optional;item=yson;}"
						}
				  	]
				}`,
		},
	)
	s.Require().Contains(
		derefSlice(s.T(), listRes.Payload.Datasets),
		models2.DtoDataset{
			ID:     copyRes2.Payload.ID,
			Name:   "test-dataset-copy2",
			Type:   "json",
			Params: `{}`,
			Schema: `{
						"columns": [
						{
							"name": "$tablet_index",
							"type_v3": "{item=int64;}"
						},
						{
							"name": "$row_index",
							"type_v3": "{item=int64;}"
						},
						{
							"name": "payload",
							"type_v3": "{type_name=optional;item=yson;}"
						}
				  	]
				}`,
		},
	)

	// update dataset 1
	_, err = s.c.Dataset.PutAPIV2Dataset(&dataset2.PutAPIV2DatasetParams{
		Request: &models2.RequestsUpdateDatasetRequestV2{
			ID:   ptr(copyRes2.Payload.ID),
			Name: "updated-dataset",
			Params: `{	
						"YT": {
    						"Cluster": "miranda.yt.idzn.ru",
    						"Path": "//home/adtech/adtech-profile/streamflow/ecom-profile/profile_stream_ozon_fsa"
						},
						"SourceType": "ST_EXTERNAL_KEY_VALUE"
					}`,
			Public: ptr(true),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)

	// update dataset 1
	updateRes2, err := s.c.Dataset.PutAPIV2Dataset(&dataset2.PutAPIV2DatasetParams{
		Request: &models2.RequestsUpdateDatasetRequestV2{
			ID:   ptr(copyRes2.Payload.ID),
			Name: "updated-dataset",
			Params: `{	
						"YT": {
    						"Cluster": "mercury-pc.yt.idzn.ru",
    						"Path": "//home/adtech/adtech-profile/streamflow/ecom-profile/profile_stream_ozon"
						},
						"SourceType": "ST_EXTERNAL_KEY_VALUE"
					}`,
			Public: ptr(true),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes2)
	s.Require().NotNil(updateRes2.Payload)
	s.Require().Equal("updated-dataset", updateRes2.Payload.Dataset.Name)

	allDs1, err := s.c.Dataset.PostAPIV2DatasetsSearch(&dataset2.PostAPIV2DatasetsSearchParams{
		Context: s.ctx,
		Request: &models2.RequestsSearchDatasetsRequest{
			Limit:  ptr(int64(10)),
			Offset: ptr(int64(0)),
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(allDs1)
	s.Require().NotNil(allDs1.Payload)
	// Проверяем, что наши созданные datasets присутствуют в результатах поиска
	var foundRes, foundCopyRes2 bool
	for _, ds := range allDs1.Payload.Datasets {
		if ds.ID == res.Payload.ID {
			foundRes = true
		}
		if ds.ID == copyRes2.Payload.ID {
			foundCopyRes2 = true
		}
	}
	s.Require().True(foundRes, "Первый dataset должен быть в результатах поиска")
	s.Require().True(foundCopyRes2, "Второй dataset должен быть в результатах поиска")
	s.Require().GreaterOrEqual(allDs1.Payload.Total, int64(2), "Должно быть хотя бы 2 dataset")

	searchDS, err := s.c.Dataset.PostAPIV2DatasetsSearch(&dataset2.PostAPIV2DatasetsSearchParams{
		Context: s.ctx,
		Request: &models2.RequestsSearchDatasetsRequest{
			Search:      "-dataset",
			NamespaceID: nsRes.Payload.ID,
			Limit:       ptr(int64(10)),
			Offset:      ptr(int64(0)),
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(searchDS)
	s.Require().NotNil(searchDS.Payload)
	s.Require().Len(searchDS.Payload.Datasets, 2)
	s.Require().Equal(int64(2), searchDS.Payload.Total)
	s.Require().Equal(int64(1), searchDS.Payload.Pages)

	searchDSFull1, err := s.c.Dataset.PostAPIV2DatasetsSearch(&dataset2.PostAPIV2DatasetsSearchParams{
		Context: s.ctx,
		Request: &models2.RequestsSearchDatasetsRequest{
			Search:      "-dataset",
			NamespaceID: nsRes.Payload.ID,
			Limit:       ptr(int64(10)),
			Offset:      ptr(int64(0)),
			ExactMatch:  ptr(true),
		},
	})
	s.Require().NoError(err)
	s.Require().NotNil(searchDSFull1)
	s.Require().NotNil(searchDSFull1.Payload)
	s.Require().Len(searchDSFull1.Payload.Datasets, 0)
	s.Require().Equal(int64(0), searchDSFull1.Payload.Total)
	s.Require().Equal(int64(0), searchDSFull1.Payload.Pages)

	searchDSFull2, err := s.c.Dataset.PostAPIV2DatasetsSearch(&dataset2.PostAPIV2DatasetsSearchParams{
		Context: s.ctx,
		Request: &models2.RequestsSearchDatasetsRequest{
			Search:      "test-dataset",
			NamespaceID: nsRes.Payload.ID,
			Limit:       ptr(int64(10)),
			Offset:      ptr(int64(0)),
			ExactMatch:  ptr(true),
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(searchDSFull2)
	s.Require().NotNil(searchDSFull2.Payload)
	s.Require().Len(searchDSFull2.Payload.Datasets, 1)
	s.Require().Equal(int64(1), searchDSFull2.Payload.Total)
	s.Require().Equal(int64(1), searchDSFull2.Payload.Pages)

	allDs2, err := s.c.Dataset.PostAPIV2DatasetsSearch(&dataset2.PostAPIV2DatasetsSearchParams{
		Context: s.ctx,
		Request: &models2.RequestsSearchDatasetsRequest{
			Limit:   ptr(int64(10)),
			Offset:  ptr(int64(0)),
			Cluster: "mercury-pc",
			Search:  "//home/adtech/adtech-profile/",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(allDs2)
	s.Require().NotNil(allDs2.Payload)
	s.Require().Len(allDs2.Payload.Datasets, 1)
	s.Require().Equal(int64(1), allDs2.Payload.Total)
	s.Require().Equal(int64(1), allDs2.Payload.Pages)

	allDs3, err := s.c.Dataset.PostAPIV2DatasetsSearch(&dataset2.PostAPIV2DatasetsSearchParams{
		Context: s.ctx,
		Request: &models2.RequestsSearchDatasetsRequest{
			Limit:   ptr(int64(10)),
			Offset:  ptr(int64(0)),
			Cluster: "mercury-pc",
			Search:  "updated-dataset",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(allDs3)
	s.Require().NotNil(allDs3.Payload)
	s.Require().Len(allDs3.Payload.Datasets, 1)
	s.Require().Equal(int64(1), allDs3.Payload.Total)
	s.Require().Equal(int64(1), allDs3.Payload.Pages)

	clusters, err := s.c.Dataset.GetAPIV2DatasetsClusters(&dataset2.GetAPIV2DatasetsClustersParams{
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(clusters)
	s.Require().Len(clusters.Payload.Clusters, 9)

	res2Delete, err := s.c.Dataset.DeleteAPIV1Dataset(&dataset2.DeleteAPIV1DatasetParams{
		Request: &models2.RequestsDeleteDatasetRequest{
			ID: ptr(copyRes2.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res2Delete)

	res3Delete, err := s.c.Dataset.DeleteAPIV1Dataset(&dataset2.DeleteAPIV1DatasetParams{
		Request: &models2.RequestsDeleteDatasetRequest{
			ID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res3Delete)
}
