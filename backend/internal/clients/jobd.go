package clients

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/jobd"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
)

type userIDContextKey struct{}

func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDContextKey{}, userID)
}

type JobdClientConfig struct {
	BaseURL string `yaml:"base_url"`
	APIKey  string `yaml:"api_key"`
	Timeout int    `yaml:"timeout"`
}

type JobdClient struct {
	client *jobd.ClientWithResponses
	logger *logger.Logger
}

type (
	Job                           = jobd.Job
	CreateJobRequest              = jobd.CreateJobRequest
	CreateJobResponse             = jobd.JobCreated
	ListJobsResponse              = jobd.JobsList
	GetJobResponse                = jobd.JobDetails
	ListEventsResponse            = jobd.EventsList
	ListAllEventsResponse         = jobd.EventsListExtended
	Event                         = jobd.Event
	EventWithJob                  = jobd.EventWithJob
	Task                          = jobd.Task
	ListTasksResponse             = jobd.TasksList
	LinkedEntity                  = jobd.LinkedEntity
	CreateTask                    = jobd.CreateTask
	CreateStep                    = jobd.CreateStep
	ListJobsParams                = jobd.ListJobsParams
	GetEventsParams               = jobd.GetEventsParams
	ListAllEventsParams           = jobd.ListAllEventsParams
	ListJobsParamsStatus          = jobd.ListJobsParamsStatus
	ListJobsParamsSort            = jobd.ListJobsParamsSort
	ListJobsParamsOrder           = jobd.ListJobsParamsOrder
	GetEventsParamsEventType      = jobd.GetEventsParamsEventType
	ListAllEventsParamsEntityType = jobd.ListAllEventsParamsEntityType
	ListAllEventsParamsEventType  = jobd.ListAllEventsParamsEventType
	ListAllEventsParamsSort       = jobd.ListAllEventsParamsSort
	ListAllEventsParamsOrder      = jobd.ListAllEventsParamsOrder
	ListTasksParams               = jobd.ListTasksParams
	ListTasksParamsStatus         = jobd.ListTasksParamsStatus
)

type ListJobsFilters struct {
	EntityType *string
	EntityID   *int64
	Type       *string
	Status     *ListJobsParamsStatus
	CreatedBy  *string
	Limit      *int32
	Offset     *int32
	Sort       *jobd.ListJobsParamsSort
	Order      *jobd.ListJobsParamsOrder
}

type ListAllEventsFilters struct {
	JobID      *int64
	EntityType *ListAllEventsParamsEntityType
	EntityID   *int64
	EventType  *ListAllEventsParamsEventType
	JobType    *string
	Limit      *int32
	Offset     *int32
	Sort       *ListAllEventsParamsSort
	Order      *ListAllEventsParamsOrder
}

func NewJobdClient(cfg JobdClientConfig, l *logger.Logger) (*JobdClient, error) {
	timeout := time.Duration(cfg.Timeout) * time.Second
	if timeout == 0 {
		timeout = 30 * time.Second
	}

	httpClient := &http.Client{
		Timeout: timeout,
	}

	apiKeyProvider := func(ctx context.Context, req *http.Request) error {
		if cfg.APIKey != "" {
			req.Header.Set("X-API-Key", cfg.APIKey)
		}
		if userID, ok := ctx.Value(userIDContextKey{}).(string); ok && userID != "" {
			req.Header.Set("X-User-ID", userID)
		}
		return nil
	}

	generatedClient, err := jobd.NewClientWithResponses(
		cfg.BaseURL,
		jobd.WithHTTPClient(httpClient),
		jobd.WithRequestEditorFn(apiKeyProvider),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create jobd client: %w", err)
	}

	return &JobdClient{
		client: generatedClient,
		logger: l,
	}, nil
}

func (c *JobdClient) CreateJob(ctx context.Context, req CreateJobRequest) (*CreateJobResponse, error) {
	resp, err := c.client.CreateJobWithResponse(ctx, req)
	if err != nil {
		c.logger.Error("failed to create job", err)
		return nil, fmt.Errorf("failed to create job: %w", err)
	}

	if resp.StatusCode() != http.StatusCreated && resp.StatusCode() != http.StatusOK {
		err := fmt.Errorf("jobd API returned status %d: %s", resp.StatusCode(), string(resp.Body))
		c.logger.Error("jobd API returned error", err)
		return nil, err
	}

	if resp.JSON201 == nil {
		err := fmt.Errorf("unexpected response format from jobd API (status %d)", resp.StatusCode())
		c.logger.Error("unexpected response format", err)
		return nil, err
	}

	return resp.JSON201, nil
}

func (c *JobdClient) ListJobs(ctx context.Context, filters ListJobsFilters) (*ListJobsResponse, error) {
	params := c.buildListJobsParams(filters)

	resp, err := c.client.ListJobsWithResponse(ctx, params)
	if err != nil {
		c.logger.Error("failed to list jobs", err)
		return nil, fmt.Errorf("failed to list jobs: %w", err)
	}

	if resp.StatusCode() != http.StatusOK {
		err := fmt.Errorf("jobd API returned status %d: %s", resp.StatusCode(), string(resp.Body))
		c.logger.Error("jobd API returned error", err)
		return nil, err
	}

	if resp.JSON200 == nil {
		err := fmt.Errorf("unexpected response format from jobd API (status %d)", resp.StatusCode())
		c.logger.Error("unexpected response format", err)
		return nil, err
	}

	return resp.JSON200, nil
}

func (c *JobdClient) GetJob(ctx context.Context, jobID int64) (*GetJobResponse, error) {
	c.logger.Info(fmt.Sprintf("Calling jobd GetJob API, job_id=%d", jobID))
	resp, err := c.client.GetJobWithResponse(ctx, jobID)
	if err != nil {
		c.logger.Error(fmt.Sprintf("failed to get job, job_id=%d: %v", jobID, err), err)
		return nil, fmt.Errorf("failed to get job %d: %w", jobID, err)
	}

	contentType := resp.HTTPResponse.Header.Get("Content-Type")
	c.logger.Info(fmt.Sprintf("Received response from jobd, job_id=%d, status_code=%d, content_type=%s", jobID, resp.StatusCode(), contentType))

	if resp.StatusCode() == http.StatusNotFound {
		c.logger.Info(fmt.Sprintf("Job not found in jobd, job_id=%d", jobID))
		return nil, fmt.Errorf("job not found: %d", jobID)
	}

	if resp.StatusCode() != http.StatusOK {
		err := fmt.Errorf("jobd API returned status %d: %s", resp.StatusCode(), string(resp.Body))
		c.logger.Error(fmt.Sprintf("jobd API returned error, job_id=%d, body=%s", jobID, string(resp.Body)), err)
		return nil, err
	}

	var job Job
	if resp.JSON200 != nil && resp.JSON200.Job != nil {
		job = *resp.JSON200.Job
	} else {
		bodyPreview := string(resp.Body)
		if len(bodyPreview) > 200 {
			bodyPreview = bodyPreview[:200]
		}
		c.logger.Info(fmt.Sprintf("JSON200 is nil or Job is nil, attempting manual parse, job_id=%d, body_preview=%s", jobID, bodyPreview))
		
		if err := json.Unmarshal(resp.Body, &job); err != nil {
			var jobDetails GetJobResponse
			if err2 := json.Unmarshal(resp.Body, &jobDetails); err2 == nil && jobDetails.Job != nil {
				job = *jobDetails.Job
				c.logger.Info(fmt.Sprintf("Successfully parsed job response in old format, job_id=%d", jobID))
			} else {
				c.logger.Error(fmt.Sprintf("Failed to parse response body, job_id=%d, body=%s", jobID, string(resp.Body)), err)
				err := fmt.Errorf("unexpected response format from jobd API (status %d, body: %s)", resp.StatusCode(), string(resp.Body))
				c.logger.Error(fmt.Sprintf("unexpected response format, job_id=%d", jobID), err)
				return nil, err
			}
		} else {
			c.logger.Info(fmt.Sprintf("Successfully parsed job response in new format, job_id=%d", jobID))
		}
	}

	if job.Id == nil {
		c.logger.Error(fmt.Sprintf("jobd API returned empty job data, job_id=%d, body=%s", jobID, string(resp.Body)), errors.New("empty job data"))
		err := fmt.Errorf("jobd API returned empty job data (status %d, body: %s)", resp.StatusCode(), string(resp.Body))
		c.logger.Error("jobd API returned empty job", err)
		return nil, err
	}

	c.logger.Info(fmt.Sprintf("Successfully got job from jobd, job_id=%d, response_job_id=%d", jobID, *job.Id))
	return &GetJobResponse{Job: &job}, nil
}

func (c *JobdClient) GetEvents(ctx context.Context, jobID int64, params *GetEventsParams) (*ListEventsResponse, error) {
	resp, err := c.client.GetEventsWithResponse(ctx, jobID, params)
	if err != nil {
		c.logger.Error("failed to get events", err)
		return nil, fmt.Errorf("failed to get events for job %d: %w", jobID, err)
	}

	if resp.StatusCode() == http.StatusNotFound {
		return nil, fmt.Errorf("job not found: %d", jobID)
	}

	if resp.StatusCode() != http.StatusOK {
		err := fmt.Errorf("jobd API returned status %d: %s", resp.StatusCode(), string(resp.Body))
		c.logger.Error("jobd API returned error", err)
		return nil, err
	}

	if resp.JSON200 == nil {
		err := fmt.Errorf("unexpected response format from jobd API (status %d)", resp.StatusCode())
		c.logger.Error("unexpected response format", err)
		return nil, err
	}

	return resp.JSON200, nil
}

func (c *JobdClient) CancelJob(ctx context.Context, jobID int64) (*GetJobResponse, error) {
	resp, err := c.client.CancelJobWithResponse(ctx, jobID)
	if err != nil {
		c.logger.Error("failed to cancel job", err)
		return nil, fmt.Errorf("failed to cancel job %d: %w", jobID, err)
	}

	if resp.StatusCode() == http.StatusNotFound {
		return nil, fmt.Errorf("job not found: %d", jobID)
	}

	if resp.StatusCode() != http.StatusOK {
		err := fmt.Errorf("jobd API returned status %d: %s", resp.StatusCode(), string(resp.Body))
		c.logger.Error("jobd API returned error", err)
		return nil, err
	}

	type CancelJobResponse struct {
		Message string `json:"message"`
		JobID   int64  `json:"job_id"`
	}
	var cancelResp CancelJobResponse
	if err := json.Unmarshal(resp.Body, &cancelResp); err == nil && cancelResp.JobID > 0 {
		c.logger.Info(fmt.Sprintf("Job cancelled successfully, job_id=%d, fetching updated job", cancelResp.JobID))
		return c.GetJob(ctx, cancelResp.JobID)
	}

	if resp.JSON200 != nil && resp.JSON200.Job != nil {
		return resp.JSON200, nil
	}

	c.logger.Info(fmt.Sprintf("Failed to parse CancelJobResponse, fetching job directly, job_id=%d", jobID))
	return c.GetJob(ctx, jobID)
}

func (c *JobdClient) RetryJob(ctx context.Context, jobID int64) (*GetJobResponse, error) {
	resp, err := c.client.RetryJobWithResponse(ctx, jobID)
	if err != nil {
		c.logger.Error("failed to retry job", err)
		return nil, fmt.Errorf("failed to retry job %d: %w", jobID, err)
	}

	if resp.StatusCode() == http.StatusNotFound {
		return nil, fmt.Errorf("job not found: %d", jobID)
	}

	if resp.StatusCode() != http.StatusOK {
		err := fmt.Errorf("jobd API returned status %d: %s", resp.StatusCode(), string(resp.Body))
		c.logger.Error("jobd API returned error", err)
		return nil, err
	}

	var job Job
	if resp.JSON200 != nil && resp.JSON200.Job != nil {
		job = *resp.JSON200.Job
	} else {
		if err := json.Unmarshal(resp.Body, &job); err != nil {
			err := fmt.Errorf("unexpected response format from jobd API (status %d, body: %s)", resp.StatusCode(), string(resp.Body))
			c.logger.Error("unexpected response format", err)
			return nil, err
		}
		c.logger.Info(fmt.Sprintf("Successfully parsed retry job response in new format, job_id=%d", jobID))
	}

	if job.Id == nil {
		err := fmt.Errorf("jobd API returned empty job data (status %d, body: %s)", resp.StatusCode(), string(resp.Body))
		c.logger.Error("jobd API returned empty job", err)
		return nil, err
	}

	return &GetJobResponse{Job: &job}, nil
}

func (c *JobdClient) ListTasks(ctx context.Context, jobID int64, params *jobd.ListTasksParams) (*ListTasksResponse, error) {
	resp, err := c.client.ListTasksWithResponse(ctx, jobID, params)
	if err != nil {
		c.logger.Error("failed to list tasks", err)
		return nil, fmt.Errorf("failed to list tasks for job %d: %w", jobID, err)
	}

	if resp.StatusCode() == http.StatusNotFound {
		return nil, fmt.Errorf("job not found: %d", jobID)
	}

	if resp.StatusCode() != http.StatusOK {
		err := fmt.Errorf("jobd API returned status %d: %s", resp.StatusCode(), string(resp.Body))
		c.logger.Error("jobd API returned error", err)
		return nil, err
	}

	if resp.JSON200 == nil {
		err := fmt.Errorf("unexpected response format from jobd API (status %d)", resp.StatusCode())
		c.logger.Error("unexpected response format", err)
		return nil, err
	}

	return resp.JSON200, nil
}

func (c *JobdClient) ListAllEvents(ctx context.Context, filters ListAllEventsFilters) (*ListAllEventsResponse, error) {
	params := c.buildListAllEventsParams(filters)

	resp, err := c.client.ListAllEventsWithResponse(ctx, params)
	if err != nil {
		c.logger.Error("failed to list all events", err)
		return nil, fmt.Errorf("failed to list all events: %w", err)
	}

	if resp.StatusCode() != http.StatusOK {
		err := fmt.Errorf("jobd API returned status %d: %s", resp.StatusCode(), string(resp.Body))
		c.logger.Error("jobd API returned error", err)
		return nil, err
	}

	if resp.JSON200 == nil {
		err := fmt.Errorf("unexpected response format from jobd API (status %d)", resp.StatusCode())
		c.logger.Error("unexpected response format", err)
		return nil, err
	}

	return resp.JSON200, nil
}

func (c *JobdClient) buildListJobsParams(filters ListJobsFilters) *ListJobsParams {
	params := &ListJobsParams{}

	if filters.EntityType != nil {
		entityType := jobd.ListJobsParamsEntityType(*filters.EntityType)
		params.EntityType = &entityType
	}

	if filters.EntityID != nil {
		params.EntityId = filters.EntityID
	}

	if filters.Type != nil {
		params.Type = filters.Type
	}

	if filters.Status != nil {
		params.Status = filters.Status
	}

	if filters.CreatedBy != nil {
		params.CreatedBy = filters.CreatedBy
	}

	if filters.Limit != nil {
		params.Limit = filters.Limit
	}

	if filters.Offset != nil {
		params.Offset = filters.Offset
	}

	if filters.Sort != nil {
		params.Sort = filters.Sort
	}

	if filters.Order != nil {
		params.Order = filters.Order
	}

	return params
}

func (c *JobdClient) buildListAllEventsParams(filters ListAllEventsFilters) *ListAllEventsParams {
	params := &ListAllEventsParams{}

	if filters.JobID != nil {
		params.JobId = filters.JobID
	}

	if filters.EntityType != nil {
		params.EntityType = filters.EntityType
	}

	if filters.EntityID != nil {
		params.EntityId = filters.EntityID
	}

	if filters.EventType != nil {
		params.EventType = filters.EventType
	}

	if filters.JobType != nil {
		params.JobType = filters.JobType
	}

	if filters.Limit != nil {
		params.Limit = filters.Limit
	}

	if filters.Offset != nil {
		params.Offset = filters.Offset
	}

	if filters.Sort != nil {
		params.Sort = filters.Sort
	}

	if filters.Order != nil {
		params.Order = filters.Order
	}

	return params
}
