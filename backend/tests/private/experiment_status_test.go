package private

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	experiment2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

func (s *StreamflowTestSuite) TestExperimentStatus() {
	// Create namespace
	nsResp, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("tst-ns-ps"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsResp)
	s.Require().NotNil(nsResp.Payload)

	s.grantNamespace(nsResp.Payload.ID)

	// Create project
	projResp, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("test-project-experiment-status"),
			NamespaceID:  ptr(nsResp.Payload.ID),
			AbcProductID: ptr("1234"),
		},

		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projResp)
	s.Require().NotNil(projResp.Payload)

	// Create complete experiment
	cpResp, err := s.c.Experiment.PostAPIV1Experiment(&experiment2.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("test-cp-experiment-status"),
			ProjectID: ptr(projResp.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(cpResp)
	s.Require().NotNil(cpResp.Payload)

	// start experiment
	startResp, err := s.c.Experiment.PutAPIV1ExperimentStart(&experiment2.PutAPIV1ExperimentStartParams{
		Request: &models2.RequestsExperimentStartRequest{
			ExperimentID: ptr(cpResp.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(startResp)
	s.Require().NotNil(startResp.Payload)

	// get status
	statusResp, err := s.c.Experiment.GetAPIV1ExperimentStatus(&experiment2.GetAPIV1ExperimentStatusParams{
		ExperimentID: cpResp.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(statusResp)
	s.Require().NotNil(statusResp.Payload)
	s.Require().Equal("OK", statusResp.Payload.Status)

	// stop experiment
	stopResp, err := s.c.Experiment.PutAPIV1ExperimentStop(&experiment2.PutAPIV1ExperimentStopParams{
		Request: &models2.RequestsExperimentStopRequest{
			ExperimentID: ptr(cpResp.Payload.ID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(stopResp)
	s.Require().NotNil(stopResp.Payload)

	// get status
	statusResp, err = s.c.Experiment.GetAPIV1ExperimentStatus(&experiment2.GetAPIV1ExperimentStatusParams{
		ExperimentID: cpResp.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(statusResp)
	s.Require().NotNil(statusResp.Payload)
	s.Require().Equal("OK", statusResp.Payload.Status)
	s.Require().Equal("", statusResp.Payload.Message)
	s.Require().Equal("running", statusResp.Payload.Summary)

	listLogsRes, err := s.c.Experiment.GetAPIV1ExperimentLogs(&experiment2.GetAPIV1ExperimentLogsParams{
		ExperimentID: &cpResp.Payload.ID,
		From:       0,
		Limit:      10,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(listLogsRes)
	s.Require().NotNil(listLogsRes.Payload)
	s.Require().Len(listLogsRes.Payload.Logs, 3)

	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[2].User)
	s.Require().Equal("new", listLogsRes.Payload.Logs[2].Act)

	details2, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[2].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details2)
	s.Require().NotNil(details2.Payload)
	s.Require().Equal("test-cp-experiment-status", details2.Payload.Details.New.Name)
	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[1].User)
	s.Require().Equal("start", listLogsRes.Payload.Logs[1].Act)

	details3, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[1].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details3)
	s.Require().NotNil(details3.Payload)
	s.Require().Equal("noauth-user", listLogsRes.Payload.Logs[0].User)
	s.Require().Equal("stop", listLogsRes.Payload.Logs[0].Act)

	details4, err := s.c.Experiment.GetAPIV1ExperimentLog(&experiment2.GetAPIV1ExperimentLogParams{
		Context: s.ctx,
		LogID:   listLogsRes.Payload.Logs[0].ID,
	})
	s.Require().NoError(err)
	s.Require().NotNil(details4)
	s.Require().NotNil(details4.Payload)
}
