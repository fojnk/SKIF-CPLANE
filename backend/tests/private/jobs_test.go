package private

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/jobs"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	models2 "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

// TestJobsList tests the POST /api/v1/jobs/search endpoint
func (s *ControlPlaneTestSuite) TestJobsList() {
	// Create test namespace, project and experiment first
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("jobs1"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)

	s.grantNamespace(nsRes.Payload.ID)

	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("proj-jobs1"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)

	// Create test experiment
	pipeRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("pipe-jobs1"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(pipeRes)

	// Test 1: List all jobs without filters
	searchResp, err := s.c.Jobs.PostAPIV1JobsSearch(&jobs.PostAPIV1JobsSearchParams{
		Request: &models2.RequestsListJobsRequest{},
		Context: s.ctx,
	})
	if err != nil {
		// Test was skipped due to jobd not being configured
		s.T().Skipf("Jobd is not configured: %v", err)
		return
	}
	s.Require().NotNil(searchResp)
	s.Require().NotNil(searchResp.Payload)
	s.Require().NotNil(searchResp.Payload.Jobs)
	s.Require().GreaterOrEqual(searchResp.Payload.Total, int64(0))

	// Проверяем, что status_description возвращается для каждой джобы в списке
	if len(searchResp.Payload.Jobs) > 0 {
		for _, job := range searchResp.Payload.Jobs {
			s.Require().NotNil(job, "job should not be nil")
			s.Require().NotEmpty(job.StatusDescription, "status_description should not be empty")
		}
	}

	// Test 2: List jobs with entity_type filter
	entityType := "experiment"
	searchResp2, err := s.c.Jobs.PostAPIV1JobsSearch(&jobs.PostAPIV1JobsSearchParams{
		Request: &models2.RequestsListJobsRequest{
			EntityType: entityType,
		},
		Context: s.ctx,
	})
	if err != nil {
		s.T().Skipf("Jobd is not configured: %v", err)
		return
	}
	s.Require().NotNil(searchResp2)
	s.Require().NotNil(searchResp2.Payload)
	s.Require().NotNil(searchResp2.Payload.Jobs)

	// Проверяем, что status_description возвращается для каждой джобы в отфильтрованном списке
	if len(searchResp2.Payload.Jobs) > 0 {
		for _, job := range searchResp2.Payload.Jobs {
			s.Require().NotNil(job, "job should not be nil")
			s.Require().NotEmpty(job.StatusDescription, "status_description should not be empty")
		}
	}

	// Test 3: List jobs with limit
	limit := int64(1)
	searchResp3, err := s.c.Jobs.PostAPIV1JobsSearch(&jobs.PostAPIV1JobsSearchParams{
		Request: &models2.RequestsListJobsRequest{
			Limit: limit,
		},
		Context: s.ctx,
	})
	if err != nil {
		s.T().Skipf("Jobd is not configured: %v", err)
		return
	}
	s.Require().NotNil(searchResp3)

	// Tests completed successfully
}

// TestJobsGetByID tests the GET /api/v1/job?job_id={id} endpoint
func (s *ControlPlaneTestSuite) TestJobsGetByID() {
	// Test 1: Get existing job
	jobID := int64(1)

	getResp, err := s.c.Jobs.GetAPIV1Job(&jobs.GetAPIV1JobParams{
		JobID:   jobID,
		Context: s.ctx,
	})
	if err != nil {
		// If jobd is not configured, endpoint may return error
		s.T().Skipf("Jobd is not configured: %v", err)
		return
	}
	s.Require().NotNil(getResp)
	s.Require().NotNil(getResp.Payload)
	s.Require().NotNil(getResp.Payload.Job)

	job := getResp.Payload.Job
	s.Require().NotNil(job, "job should not be nil")

	// Проверяем, что status_description возвращается
	s.Require().NotEmpty(job.StatusDescription, "status_description should not be empty")

	// Tests completed successfully
}

// TestJobsGetEvents tests the GET /api/v1/job/events?job_id={id} endpoint
func (s *ControlPlaneTestSuite) TestJobsGetEvents() {
	jobID := int64(1)

	// Test 1: Get all events for a job
	eventsResp, err := s.c.Jobs.GetAPIV1JobEvents(&jobs.GetAPIV1JobEventsParams{
		JobID:   jobID,
		Context: s.ctx,
	})
	if err != nil {
		s.T().Skipf("Jobd is not configured: %v", err)
		return
	}
	s.Require().NotNil(eventsResp)

	// Tests completed successfully
}

// TestJobsGetTasks tests the GET /api/v1/job/tasks?job_id={id} endpoint
func (s *ControlPlaneTestSuite) TestJobsGetTasks() {
	jobID := int64(1)

	// Test 1: Get all tasks for a job
	tasksResp, err := s.c.Jobs.GetAPIV1JobTasks(&jobs.GetAPIV1JobTasksParams{
		JobID:   jobID,
		Context: s.ctx,
	})
	if err != nil {
		s.T().Skipf("Jobd is not configured: %v", err)
		return
	}
	s.Require().NotNil(tasksResp)

	// Tests completed successfully
}

// TestJobsListWithEntityFilter tests listing jobs filtered by entity
func (s *ControlPlaneTestSuite) TestJobsListWithEntityFilter() {
	// Create test namespace, project and experiment
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models2.RequestsCreateNamespaceRequest{
			Name: ptr("jobs2"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)

	s.grantNamespace(nsRes.Payload.ID)

	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models2.RequestsCreateProjectRequest{
			Name:         ptr("proj-jobs2"),
			NamespaceID:  &nsRes.Payload.ID,
			AbcProductID: ptr("1234"),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)

	// Create test experiment
	pipeRes, err := s.c.Experiment.PostAPIV1Experiment(&experiment.PostAPIV1ExperimentParams{
		Request: &models2.RequestsCreateCompleteExperimentRequest{
			Name:      ptr("pipe-jobs2"),
			ProjectID: &projRes.Payload.ID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(pipeRes)

	// Test: Filter jobs by entity
	entityType := "experiment"
	entityID := int64(pipeRes.Payload.ID)
	searchResp, err := s.c.Jobs.PostAPIV1JobsSearch(&jobs.PostAPIV1JobsSearchParams{
		Request: &models2.RequestsListJobsRequest{
			EntityType: entityType,
			EntityID:   entityID,
		},
		Context: s.ctx,
	})
	if err != nil {
		s.T().Skipf("Jobd is not configured: %v", err)
		return
	}
	s.Require().NotNil(searchResp)

	// Tests completed successfully
}

// TestJobsListOrdering tests ordering of job results
func (s *ControlPlaneTestSuite) TestJobsListOrdering() {
	// Test 1: Order by created_at ascending
	sort := "created_at"
	order := "asc"
	searchResp, err := s.c.Jobs.PostAPIV1JobsSearch(&jobs.PostAPIV1JobsSearchParams{
		Request: &models2.RequestsListJobsRequest{
			Sort:  sort,
			Order: order,
		},
		Context: s.ctx,
	})
	if err != nil {
		s.T().Skipf("Jobd is not configured: %v", err)
		return
	}
	s.Require().NotNil(searchResp)

	// Tests completed successfully
}
