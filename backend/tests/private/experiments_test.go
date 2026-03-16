package private

import (
	"cmp"
	"encoding/json"
	"fmt"
	"slices"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/cube"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	experiment2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	project2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestExperimentBasic() {
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

	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project-experiment"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	res, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:        ptr("test-experiment"),
			Description: ptr("test-experiment-description"),
			ProjectID:   &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)
	s.Require().Equal(res.Payload.Description, "test-experiment-description")

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
	s.Require().Equal(1, len(listRes2V2.Payload.Projects))
	s.Require().Equal(listRes2V2.Payload.Projects[0].NamespaceID, nsRes.Payload.ID)
	s.Require().Equal(listRes2V2.Payload.Projects[0].NamespaceName, "tst-ns-pl")
	s.Require().Equal(int64(1), listRes2V2.Payload.Projects[0].ExperimentCount)
	s.Require().Equal(int64(0), listRes2V2.Payload.Projects[0].DatasetCount)

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
		Context:    s.ctx,
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
			ExperimentID:        ptr(res.Payload.ID),
			Name:              "updated-experiment",
			Description:       ptr("updated-experiment-description"),
			Config:            "{\"hello\": \"world\"}",
			Comment:           "add some things",
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().Equal("updated-experiment", updateRes.Payload.Name)
	s.Require().Equal("updated-experiment-description", updateRes.Payload.Description)

	getRes, err = s.c.Experiment.GetAPIV1Experiment(&experiment2.GetAPIV1ExperimentParams{
		ExperimentID: res.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().NotNil(getRes.Payload)
	s.Require().Equal("updated-experiment", getRes.Payload.Name)

	orchestratorConfigRes1, err := s.c.Experiment.GetAPIV1ExperimentOrchestrator(&experiment2.GetAPIV1ExperimentOrchestratorParams{
		ExperimentID: getRes.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(orchestratorConfigRes1)
	s.Require().NotNil(orchestratorConfigRes1.Payload)

	expectedUrls := []string{
		fmt.Sprintf("https://github.com/jamirhan/%d", res.Payload.ID),
		fmt.Sprintf("https://goc.vk.team/d/feln8ykbjqs5ce/experiment-for-ui?var-sf_experiment_id=%d&var-workdir=/%d", res.Payload.ID, res.Payload.ID),
		"https://cloud.vk.team/cloud/KC,PC/ns/infra/service/sf-dev-wrkr-pl-0.proj-0",
		"https://cloud.vk.team/cloud/KC,PC/ns/infra/service/sf-dev-rsdr-pl-0.proj-0",
		fmt.Sprintf("https://goc.vk.team/d/cel5goiq5mbcwd/bigrt-metrics?orgId=1&refresh=1m&var-cloud_service=sf-rsdr-pl-%d.proj-%d", res.Payload.ID, projRes.Payload.ID),
		fmt.Sprintf("https://goc.vk.team/d/cel5goiq5mbcwd/bigrt-metrics?orgId=1&refresh=1m&var-cloud_service=sf-wrkr-pl-%d.proj-%d", res.Payload.ID, projRes.Payload.ID),
	}

	expectedUrlNames := []string{
		"FileLoader",
		"experiment dashboard",
		"worker",
		"resharder",
		"resharder (bigrt)",
		"worker (bigrt)",
	}

	urlsRes, err := s.c.Experiment.GetAPIV1ExperimentUrls(&experiment2.GetAPIV1ExperimentUrlsParams{
		ExperimentID: res.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(urlsRes)
	s.Require().NotNil(urlsRes.Payload)
	s.Require().Len(urlsRes.Payload.Urls, 6)
	for _, url := range urlsRes.Payload.Urls {
		s.Require().Contains(expectedUrlNames, url.Name)
		s.Require().Contains(expectedUrls, url.URL)
	}

	url, err := s.c.Experiment.GetAPIV1ExperimentGrafanaURL(&experiment2.GetAPIV1ExperimentGrafanaURLParams{
		ExperimentID: res.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(url)
	s.Require().NotNil(url.Payload)
	s.Require().Equal(url.Payload.Name, "experiment dashboard")
	s.Require().Equal(url.Payload.URL, fmt.Sprintf("https://goc.vk.team/d/feln8ykbjqs5ce/experiment-for-ui?var-sf_experiment_id=%d&var-workdir=/%d", res.Payload.ID, res.Payload.ID))

	updates, err := s.c.Experiment.GetAPIV1ExperimentUpdates(&experiment2.GetAPIV1ExperimentUpdatesParams{
		Context:    s.ctx,
		ExperimentID: res.Payload.ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(updates)
	s.Require().NotNil(updates.Payload)
	s.Require().Equal(updates.Payload.HasNotAppliedChanges, true)
	s.Require().Equal(updates.Payload.AppliedConfig, "")
	s.Require().Equal(updates.Payload.SavedConfig, orchestratorConfigRes1.Payload.Config)

	resDelete, err := s.c.Experiment.DeleteAPIV1Experiment(&experiment2.DeleteAPIV1ExperimentParams{
		Request: &models2.RequestsDeleteCompleteExperimentRequest{
			ID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(resDelete)

	listRes, err = s.c.Experiment.GetAPIV1Experiments(&experiment2.GetAPIV1ExperimentsParams{
		ProjectID: projRes.Payload.ID,
		Context:   s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listRes)
	s.Require().NotNil(listRes.Payload)
	s.Require().Empty(listRes.Payload.Experiments)

	listLogsRes, err := s.c.Experiment.GetAPIV1ExperimentLogs(&experiment2.GetAPIV1ExperimentLogsParams{
		ProjectID: &projRes.Payload.ID,
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
	s.Require().Equal("[deleted]", listLogsRes.Payload.Logs[2].Name)

	details1, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[2].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details1)
	s.Require().NotNil(details1.Payload)
	s.Require().Equal("test-experiment", details1.Payload.Details.New.Name)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[1].User)
	s.Require().Equal("update", listLogsRes.Payload.Logs[1].Act)
	s.Require().Equal("add some things", listLogsRes.Payload.Logs[1].Comment)
	s.Require().Equal("[deleted]", listLogsRes.Payload.Logs[1].Name)

	details2, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[1].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details2)
	s.Require().NotNil(details2.Payload)
	s.Require().Equal("updated-experiment", details2.Payload.Details.New.Name)
	s.Require().Equal("test-experiment", details2.Payload.Details.Old.Name)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[0].User)
	s.Require().Equal("delete", listLogsRes.Payload.Logs[0].Act)
	s.Require().Equal("[deleted]", listLogsRes.Payload.Logs[0].Name)

	details3, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[0].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details3)
	s.Require().NotNil(details3.Payload)
	s.Require().Equal("updated-experiment", details3.Payload.Details.Old.Name)
	s.Require().Equal("", details3.Payload.Comment)

	_, err = s.c.Experiment.PutAPIV1ExperimentLog(&experiment2.PutAPIV1ExperimentLogParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateExperimentLogCommentRequest{
			LogID:      ptr(listLogsRes.Payload.Logs[0].ID),
			NewComment: ptr("new comment"),
		},
	})

	s.Require().NoError(err)

	details4, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[0].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details4)
	s.Require().NotNil(details4.Payload)
	s.Require().Equal("updated-experiment", details4.Payload.Details.Old.Name)
	s.Require().Equal("new comment", details4.Payload.Comment)
}

func (s *StreamflowTestSuite) TestExperimentApply() {
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

	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project-experiment"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
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
		Context:    s.ctx,
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
			ExperimentID:        ptr(res.Payload.ID),
			Name:              "updated-experiment",
			Config:            "{\"hello\": \"world\"}",
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes)
	s.Require().Equal("updated-experiment", updateRes.Payload.Name)

	getRes, err = s.c.Experiment.GetAPIV1Experiment(&experiment2.GetAPIV1ExperimentParams{
		ExperimentID: res.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes)
	s.Require().NotNil(getRes.Payload)
	s.Require().Equal("updated-experiment", getRes.Payload.Name)

	orchestratorConfigRes1, err := s.c.Experiment.GetAPIV1ExperimentOrchestrator(&experiment2.GetAPIV1ExperimentOrchestratorParams{
		ExperimentID: getRes.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(orchestratorConfigRes1)
	s.Require().NotNil(orchestratorConfigRes1.Payload)

	applyRes, err := s.c.Experiment.PutAPIV1ExperimentConfigApply(&experiment2.PutAPIV1ExperimentConfigApplyParams{
		Request: &models2.RequestsApplyExperimentConfigRequest{
			ExperimentID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(applyRes)
	s.Require().NotNil(applyRes.Payload)

	applyRes2, err := s.c.Experiment.PutAPIV1ExperimentConfigApply(&experiment2.PutAPIV1ExperimentConfigApplyParams{
		Request: &models2.RequestsApplyExperimentConfigRequest{
			ExperimentID: ptr(res.Payload.ID),
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(applyRes2)
	s.Require().NotNil(applyRes2.Payload)

	updateRes2, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
		Request: &models2.RequestsUpdateCompleteExperimentRequest{
			ExperimentID:        ptr(res.Payload.ID),
			Name:              "updated-experiment2",
			Config:            "{\"hello\": \"world2\"}",
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes2)
	s.Require().Equal("updated-experiment2", updateRes2.Payload.Name)

	orchestratorConfigRes2, err := s.c.Experiment.GetAPIV1ExperimentOrchestrator(&experiment2.GetAPIV1ExperimentOrchestratorParams{
		ExperimentID: getRes.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(orchestratorConfigRes2)
	s.Require().NotNil(orchestratorConfigRes2.Payload)

	updateLogs, err := s.c.Experiment.GetAPIV1ExperimentLogs(&experiment2.GetAPIV1ExperimentLogsParams{
		ExperimentID: &res.Payload.ID,
		Context:    s.ctx,
		Limit:      10,
		From:       0,
		ProjectID:  &projRes.Payload.ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(updateLogs)
	s.Require().NotNil(updateLogs.Payload)

	updates, err := s.c.Experiment.GetAPIV1ExperimentUpdates(&experiment2.GetAPIV1ExperimentUpdatesParams{
		Context:    s.ctx,
		ExperimentID: res.Payload.ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(updates)
	s.Require().NotNil(updates.Payload)

	s.Require().Equal(updates.Payload.HasNotAppliedChanges, true)
	s.Require().Equal(updates.Payload.AppliedConfig, orchestratorConfigRes1.Payload.Config)
	s.Require().Equal(updates.Payload.SavedConfig, orchestratorConfigRes2.Payload.Config)
}

func (s *StreamflowTestSuite) TestEmptyUpdates() {
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

	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project-experiment"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
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
		Context:    s.ctx,
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

	updateRes2, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
		Request: &models2.RequestsUpdateCompleteExperimentRequest{
			ExperimentID: ptr(res.Payload.ID),
			Name:       "updated-experiment2",
			Config: `
{
	"Placement": {
		"OnecloudDatacenters": [
			"pc",
			"kc",
			"hc"
		]
	},
	"Resources": {
		"Resharder": {
			"ReplicasInDc": 6,
			"CpuCores": 4,
			"RamMB": 16384,
			"NetworkInMbit": 1024,
			"NetworkOutMbit": 1024
		},
		"Worker": {
			"ReplicasInDc": 10,
			"CpuCores": 8,
			"RamMB": 32768,
			"NetworkInMbit": 1024,
			"NetworkOutMbit": 1024
		}
	},
	"InternalSources": {},
	"Resharder": {
		"InputSources": []
	},
	"States": [],
	"Worker": {
		"GraphConfig": {
			"Name": "adtech_events_processor",
			"OutputNames": [],
			"StateNames": [],
			"Cubes": []
		}
	}
}`,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes2)
	s.Require().Equal("updated-experiment2", updateRes2.Payload.Name)

	updateRes3, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
		Request: &models2.RequestsUpdateCompleteExperimentRequest{
			ExperimentID: ptr(res.Payload.ID),
			Config: `
{
	"Placement": {
		"OnecloudDatacenters": [
			"pc",
			"kc",
			"hc"
		]
	},
	"Resources": {
		"Resharder": {
			"ReplicasInDc": 6,
			"CpuCores": 5,
			"RamMB": 16384,
			"NetworkInMbit": 1024,
			"NetworkOutMbit": 1024
		},
	"Worker": {
			"ReplicasInDc": 10,
			"CpuCores": 8,
			"RamMB": 32768,
			"NetworkInMbit": 1024,
			"NetworkOutMbit": 1024
		}
	},
	"InternalSources": {},
	"Resharder": {
		"InputSources": []
	},
	"States": [],
	"Worker": {
		"GraphConfig": {
			"Name": "adtech_events_processor",
			"OutputNames": [],
			"StateNames": [],
			"Cubes": []
		}
	}
}`,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes3)
	s.Require().Equal("updated-experiment2", updateRes3.Payload.Name)

	updateLogs, err := s.c.Experiment.GetAPIV1ExperimentLogs(&experiment2.GetAPIV1ExperimentLogsParams{
		ExperimentID: &res.Payload.ID,
		Context:    s.ctx,
		Limit:      10,
		From:       0,
		ProjectID:  &projRes.Payload.ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(updateLogs)
	s.Require().NotNil(updateLogs.Payload)

	orchestratorConfigRes1, err := s.c.Experiment.GetAPIV1ExperimentOrchestrator(&experiment2.GetAPIV1ExperimentOrchestratorParams{
		ExperimentID: updateRes3.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(orchestratorConfigRes1)
	s.Require().NotNil(orchestratorConfigRes1.Payload)

	updates, err := s.c.Experiment.GetAPIV1ExperimentUpdates(&experiment2.GetAPIV1ExperimentUpdatesParams{
		Context:    s.ctx,
		ExperimentID: res.Payload.ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(updates)
	s.Require().NotNil(updates.Payload)

	s.Require().Equal(updates.Payload.HasNotAppliedChanges, true)
	s.Require().Equal(updates.Payload.AppliedConfig, "")
	s.Require().Equal(updates.Payload.SavedConfig, orchestratorConfigRes1.Payload.Config)

	versions, err := s.c.Experiment.GetAPIV1ExperimentVersions(&experiment2.GetAPIV1ExperimentVersionsParams{
		ExperimentID: updateRes3.Payload.ID,
		Limit:      10,
		From:       0,
		Context:    s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(versions)
	s.Require().NotNil(versions.Payload)
	s.Require().Len(versions.Payload.Versions, 3)

	versionDetails, err := s.c.Experiment.GetAPIV1ExperimentVersion(&experiment2.GetAPIV1ExperimentVersionParams{
		ExperimentID: res.Payload.ID,
		VersionID:  versions.Payload.Versions[0].ID,
		Context:    s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(versionDetails)
	s.Require().NotNil(versionDetails.Payload)
	s.Require().Equal(versionDetails.Payload.Config, updateRes3.Payload.Config)

	update, err := s.c.Experiment.PutAPIV2ExperimentVersion(&experiment2.PutAPIV2ExperimentVersionParams{
		Request: &models2.RequestsUpdateExperimentVersionCommentRequest{
			ID:      ptr(versions.Payload.Versions[0].ID),
			Comment: "updated version",
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(update)
	s.Require().NotNil(update.Payload)
	s.Require().Equal(update.Payload.Comment, "updated version")

	versionDetails2, err := s.c.Experiment.GetAPIV1ExperimentVersion(&experiment2.GetAPIV1ExperimentVersionParams{
		ExperimentID: res.Payload.ID,
		VersionID:  versions.Payload.Versions[1].ID,
		Context:    s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(versionDetails2)
	s.Require().NotNil(versionDetails2.Payload)
	s.Require().Equal(versionDetails2.Payload.Config, updateRes2.Payload.Config)

	versionDetails3, err := s.c.Experiment.GetAPIV1ExperimentVersion(&experiment2.GetAPIV1ExperimentVersionParams{
		ExperimentID: res.Payload.ID,
		VersionID:  versions.Payload.Versions[2].ID,
		Context:    s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(versionDetails3)
	s.Require().NotNil(versionDetails3.Payload)
	s.Require().Equal(versionDetails3.Payload.Config, getRes.Payload.Config)

	currentVersion1, err := s.c.Experiment.GetAPIV1ExperimentVersionCurrent(&experiment2.GetAPIV1ExperimentVersionCurrentParams{
		ExperimentID: res.Payload.ID,
	})

	s.Require().NoError(err)
	s.Require().NotNil(currentVersion1)
	s.Require().Equal(currentVersion1.Payload.VersionID, versions.Payload.Versions[0].ID)

	_, err = s.c.Experiment.PutAPIV1ExperimentVersionCurrent(&experiment2.PutAPIV1ExperimentVersionCurrentParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateExperimentConfigVersionRequest{
			ExperimentID: ptr(res.Payload.ID),
			VersionID:  ptr(versions.Payload.Versions[0].ID),
		},
	})

	s.Require().Error(err)

	_, err = s.c.Experiment.PutAPIV1ExperimentVersionCurrent(&experiment2.PutAPIV1ExperimentVersionCurrentParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateExperimentConfigVersionRequest{
			ExperimentID: ptr(res.Payload.ID),
			VersionID:  ptr(versions.Payload.Versions[1].ID),
		},
	})

	s.Require().NoError(err)

	getRes2, err := s.c.Experiment.GetAPIV1Experiment(&experiment2.GetAPIV1ExperimentParams{
		ExperimentID: res.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes2)
	s.Require().NotNil(getRes2.Payload)
	s.Require().Equal("updated-experiment2", getRes2.Payload.Name)
	s.Require().JSONEq(`
{
	"Placement": {
		"OnecloudDatacenters": [
			"pc",
			"kc",
			"hc"
		]
	},
	"Resources": {
		"Resharder": {
			"ReplicasInDc": 6,
			"CpuCores": 4,
			"RamMB": 16384,
			"NetworkInMbit": 1024,
			"NetworkOutMbit": 1024
		},
		"Worker": {
			"ReplicasInDc": 10,
			"CpuCores": 8,
			"RamMB": 32768,
			"NetworkInMbit": 1024,
			"NetworkOutMbit": 1024
		}
	},
	"InternalSources": {},
	"Resharder": {
		"InputSources": []
	},
	"States": [],
	"Worker": {
		"GraphConfig": {
			"Name": "adtech_events_processor",
			"OutputNames": [],
			"StateNames": [],
			"Cubes": []
		}
	}
}
	`, getRes2.Payload.Config)
	s.Require().JSONEq(`{"Cubes":[]}`, getRes2.Payload.AdditionalInformation)

	s.Require().Contains(getRes2.Payload.Rights, models2.ACLRightEditConfig)
	s.Require().Contains(getRes2.Payload.Rights, models2.ACLRightEditName)
	s.Require().Contains(getRes2.Payload.Rights, models2.ACLRightDeleteExperiment)
	s.Require().Contains(getRes2.Payload.Rights, models2.ACLRightCreateDataset)
	s.Require().Contains(getRes2.Payload.Rights, models2.ACLRightApplyExperiment)
	s.Require().Contains(getRes2.Payload.Rights, models2.ACLRightStartExperiment)
	s.Require().Contains(getRes2.Payload.Rights, models2.ACLRightStopExperiment)
	s.Require().Contains(getRes2.Payload.Rights, models2.ACLRightDeleteDataset)

	_, err = s.c.Experiment.PutAPIV1ExperimentVersionCurrent(&experiment2.PutAPIV1ExperimentVersionCurrentParams{
		Context: s.ctx,
		Request: &models2.RequestsUpdateExperimentConfigVersionRequest{
			ExperimentID: ptr(res.Payload.ID),
			VersionID:  ptr(versions.Payload.Versions[0].ID),
		},
	})

	s.Require().NoError(err)

	getRes3, err := s.c.Experiment.GetAPIV1Experiment(&experiment2.GetAPIV1ExperimentParams{
		ExperimentID: res.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(getRes3)
	s.Require().NotNil(getRes3.Payload)
	s.Require().Equal("updated-experiment2", getRes3.Payload.Name)
	s.Require().JSONEq(`
{
	"Placement": {
		"OnecloudDatacenters": [
			"pc",
			"kc",
			"hc"
		]
	},
	"Resources": {
		"Resharder": {
			"ReplicasInDc": 6,
			"CpuCores": 5,
			"RamMB": 16384,
			"NetworkInMbit": 1024,
			"NetworkOutMbit": 1024
		},
		"Worker": {
			"ReplicasInDc": 10,
			"CpuCores": 8,
			"RamMB": 32768,
			"NetworkInMbit": 1024,
			"NetworkOutMbit": 1024
		}
	},
	"InternalSources": {},
	"Resharder": {
		"InputSources": []
	},
	"States": [],
	"Worker": {
		"GraphConfig": {
			"Name": "adtech_events_processor",
			"OutputNames": [],
			"StateNames": [],
			"Cubes": []
		}
	}
}
	`, getRes3.Payload.Config)
	s.Require().JSONEq(`{"Cubes":[]}`, getRes2.Payload.AdditionalInformation)

	s.Require().Contains(getRes3.Payload.Rights, models2.ACLRightEditConfig)
	s.Require().Contains(getRes3.Payload.Rights, models2.ACLRightEditName)
	s.Require().Contains(getRes3.Payload.Rights, models2.ACLRightDeleteExperiment)
	s.Require().Contains(getRes3.Payload.Rights, models2.ACLRightCreateDataset)
	s.Require().Contains(getRes3.Payload.Rights, models2.ACLRightApplyExperiment)
	s.Require().Contains(getRes3.Payload.Rights, models2.ACLRightStartExperiment)
	s.Require().Contains(getRes3.Payload.Rights, models2.ACLRightStopExperiment)
	s.Require().Contains(getRes3.Payload.Rights, models2.ACLRightDeleteDataset)

	s.Require().Equal(getRes3.Payload.ProjectID, projRes.Payload.ID)
	s.Require().Equal(getRes3.Payload.ProjectName, projRes.Payload.Name)
}

func correctExperimentAddInfo(j string) (string, error) {
	addInfoData := map[string]any{}
	err := json.Unmarshal([]byte(j), &addInfoData)
	if err != nil {
		return "", err
	}

	cubes, _ := addInfoData["Cubes"].([]any)
	slices.SortFunc(cubes, func(lhs, rhs any) int {
		lhsD, _ := lhs.(map[string]any)
		rhsD, _ := rhs.(map[string]any)

		lhsName, _ := lhsD["Name"].(string)
		rhsName, _ := rhsD["Name"].(string)

		return cmp.Compare(lhsName, rhsName)
	})

	addInfoData["Cubes"] = cubes
	res, err := json.Marshal(addInfoData)
	return string(res), err
}

func (s *StreamflowTestSuite) TestExperimentUpdatesWithAddInfo() {
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
	s.grantCubeSystem()

	projRes, err := s.c.Project.PostAPIV1Project(&project2.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project-experiment"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	createPPRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:        ptr("test-experiment"),
			Description: ptr("test-experiment-description"),
			ProjectID:   &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(createPPRes)
	s.Require().NotNil(createPPRes.Payload)
	s.Require().Equal(createPPRes.Payload.Description, "test-experiment-description")

	updateRes2, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
		Request: &models2.RequestsUpdateCompleteExperimentRequest{
			ExperimentID: ptr(createPPRes.Payload.ID),
			Name:       "updated-experiment1",
			Config: `
{
	"Worker": {
		"GraphConfig": {
			"Name": "test_pipe",
			"OutputNames": [],
			"StateNames": [],
			"Cubes": []
		}
	}
}
			`,
			DisableValidation: true,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes2)
	s.Require().Equal("updated-experiment1", updateRes2.Payload.Name)

	// create system cube1
	createCubeRes, err := s.c.Cube.PostAPIV1CubeSystem(&cube.PostAPIV1CubeSystemParams{
		Request: &models2.RequestsCreateCubeRequest{
			Name:       ptr("TestCube1"),
			ParamsName: "TestCube1Options",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(createCubeRes)
	s.Require().NotNil(createCubeRes.Payload)
	s.Require().Equal("TestCube1", createCubeRes.Payload.Name)
	s.Require().Equal("TestCube1Options", createCubeRes.Payload.ParamsName)

	// create system cube
	createCubeRes2, err := s.c.Cube.PostAPIV1CubeSystem(&cube.PostAPIV1CubeSystemParams{
		Request: &models2.RequestsCreateCubeRequest{
			Name:       ptr("TestCube2"),
			ParamsName: "TestCube2Options",
		},
	})

	s.Require().NoError(err)
	s.Require().NotNil(createCubeRes2)
	s.Require().NotNil(createCubeRes2.Payload)
	s.Require().Equal("TestCube2", createCubeRes2.Payload.Name)
	s.Require().Equal("TestCube2Options", createCubeRes2.Payload.ParamsName)

	ppConfig := `
{
	"Placement": {
		"OnecloudDatacenters": ["pc","kc","hc"]
	},
	"Resources": {
		"Resharder": {
			"ReplicasInDc": 6,
			"CpuCores": 5,
			"RamMB": 16384,
			"NetworkInMbit": 1024,
			"NetworkOutMbit": 1024
		},
		"Worker": {
				"ReplicasInDc": 10,
				"CpuCores": 8,
				"RamMB": 32768,
				"NetworkInMbit": 1024,
				"NetworkOutMbit": 1024
			}
	},
	"InternalSources": {},
	"Resharder": {
		"InputSources": []
	},
	"States": [],
	"Worker": {
		"GraphConfig": {
			"Name": "test_pipe",
			"OutputNames": [],
			"StateNames": [],
			"Cubes": [
				{
					"Name": "Node1",
					"InputsMapping": {
					},
					"TestCube2Options": {
					}
				},
				{
					"Name": "Node2",
					"InputsMapping": {
					},
					"TestCube1Options": {
					}
				},
				{
					"Name": "Node3",
					"InputsMapping": {
					},
					"TestCube1Options": {
					}
				}
			]
		}			
	}
}
	`
	updateRes3, err := s.c.Experiment.PutAPIV1Experiment(&experiment2.PutAPIV1ExperimentParams{
		Request: &models2.RequestsUpdateCompleteExperimentRequest{
			ExperimentID: ptr(createPPRes.Payload.ID),
			Name:       "updated-experiment1",
			Config:     ppConfig,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateRes3)
	s.Require().Equal("updated-experiment1", updateRes3.Payload.Name)
	s.Require().JSONEq(ppConfig, updateRes3.Payload.Config)
	addInfoWant, err := correctExperimentAddInfo(
		fmt.Sprintf(`
		{
			"Cubes": [
				{ "Name": "Node1", "CubeTypeID": %d },
				{ "Name": "Node2", "CubeTypeID": %d },
				{ "Name": "Node3", "CubeTypeID": %d }
			] 
		}`, createCubeRes2.Payload.ID,
			createCubeRes.Payload.ID,
			createCubeRes.Payload.ID),
	)
	s.Require().NoError(err)
	addInfoRes, err := correctExperimentAddInfo(updateRes3.Payload.AdditionalInformation)
	s.Require().NoError(err)
	s.Require().JSONEq(addInfoWant, addInfoRes)

	getPPRes, err := s.c.Experiment.GetAPIV1Experiment(&experiment2.GetAPIV1ExperimentParams{
		ExperimentID: createPPRes.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().Equal(getPPRes.Payload.Name, updateRes3.Payload.Name)
	s.Require().Equal(getPPRes.Payload.Description, updateRes3.Payload.Description)
	s.Require().JSONEq(getPPRes.Payload.Config, updateRes3.Payload.Config)
	getInfoRes, err := correctExperimentAddInfo(getPPRes.Payload.AdditionalInformation)
	s.Require().NoError(err)
	s.Require().Equal(addInfoRes, getInfoRes)
}
