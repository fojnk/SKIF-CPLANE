package private

import (
	"context"
	"fmt"
	"net/http"

	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients"
	models "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

// Helper function to create pointer to primitive types
func ptr[T any](v T) *T {
	return &v
}

func applyExperimentDatasetHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ApplyExperimentDatasetRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeExperimentStateApply, service.ACLActionEdit, r.ExperimentID, u); err != nil {
		return nil, err
	}

	isBlocked, err := svc.IsExistsActiveBlockBanners(ctx)
	if err != nil {
		l.Error("Блокировка деплоев: ", err)
		return nil, shared.ConvertServiceError(err, shared.EntityCompliteExperimentInfo)
	}

	if isBlocked {
		blockErr := serviceerrors.NewEntityForbiddenError(serviceerrors.EntityExperiment, "", errors.New(serviceerrors.ErrMsgConfigApplyBlockedByBanner))
		return nil, shared.ConvertServiceError(blockErr, shared.EntityCompliteExperimentInfo)
	}

	experiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment info", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	if svc.Repo.Clients.Jobd == nil {
		err := errors.New("jobd client is not configured")
		l.Error("jobd client is not configured", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Job system is not available",
			HTTPStatusCode:  http.StatusServiceUnavailable,
		}
	}

	jobName := fmt.Sprintf("apply-dataset-experiment-%d", r.ExperimentID)
	jobConfig := map[string]interface{}{
		"experiment_id": r.ExperimentID,
	}
	if r.AgentURL != "" {
		jobConfig["agent_url"] = r.AgentURL
	}

	entity := &clients.LinkedEntity{
		Type: "experiment",
		Id:   int64(r.ExperimentID),
	}

	desc := fmt.Sprintf("Apply datasets for experiment %d", r.ExperimentID)
	execTarget := "orchestrator"
	tags := []string{"experiment", "dataset", "apply"}

	createJobReq := clients.CreateJobRequest{
		Name:            jobName,
		Description:     &desc,
		Type:            "dataset_apply",
		ExecutionTarget: &execTarget,
		Config:          &jobConfig,
		Entity:          entity,
		Tags:            &tags,
	}

	ctxWithUserID := clients.WithUserID(ctx, u.Username)
	jobResp, err := svc.Repo.Clients.Jobd.CreateJob(ctxWithUserID, createJobReq)
	if err != nil {
		l.Error("failed to create dataset apply job in jobd", err)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, "failed to create dataset apply job in jobd"),
			ExternalMessage: fmt.Sprintf("Ошибка создания джобы: %s", err.Error()),
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	svc.LogExperimentChange(ctx, experiment.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionApplyExperiment, service.ExperimentUpdateLog{
		New: service.ExperimentUpdateLogEntity{
			Name:  experiment.Name,
			JobID: jobResp.Job.Id,
		},
	})

	return responses.EmptyResponse{}, nil
}

func cleanExperimentQueueHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CleanExperimentQueueRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeExperimentStateApply, service.ACLActionEdit, r.ExperimentID, u); err != nil {
		return nil, err
	}

	experiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment info", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	if svc.Repo.Clients.Jobd == nil {
		err := errors.New("jobd client is not configured")
		l.Error("jobd client is not configured", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Job system is not available",
			HTTPStatusCode:  http.StatusServiceUnavailable,
		}
	}

	jobName := fmt.Sprintf("clean-queue-experiment-%d", r.ExperimentID)
	jobConfig := map[string]interface{}{
		"experiment_id": r.ExperimentID,
		"operation":   "clean_queue",
	}

	entity := &clients.LinkedEntity{
		Type: "experiment",
		Id:   int64(r.ExperimentID),
	}

	desc := fmt.Sprintf("Clean queue for experiment %d", r.ExperimentID)
	execTarget := "orchestrator"
	tags := []string{"experiment", "queue", "maintenance"}

	createJobReq := clients.CreateJobRequest{
		Name:            jobName,
		Description:     &desc,
		Type:            "experiment_clean_queue",
		ExecutionTarget: &execTarget,
		Config:          &jobConfig,
		Entity:          entity,
		Tags:            &tags,
	}

	ctxWithUserID := clients.WithUserID(ctx, u.Username)
	jobResp, err := svc.Repo.Clients.Jobd.CreateJob(ctxWithUserID, createJobReq)
	if err != nil {
		l.Error("failed to create clean queue job in jobd", err)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, "failed to create clean queue job in jobd"),
			ExternalMessage: fmt.Sprintf("Ошибка создания джобы: %s", err.Error()),
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	svc.LogExperimentChange(ctx, experiment.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionApplyExperiment, service.ExperimentUpdateLog{
		New: service.ExperimentUpdateLogEntity{
			Name:  experiment.Name,
			JobID: jobResp.Job.Id,
		},
	})

	return responses.EmptyResponse{}, nil
}

// listJobsHandler godoc
//
//	@Summary	search and list jobs with filters
//	@Tags		jobs
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ListJobsRequest	true	"search filters (entity_type, entity_id, type, status, created_by, limit, offset, sort, order)"
//	@Success	200		{object}	responses.ListJobsResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Failure	503		{object}	responses.ErrorResponse	"Service Unavailable"
//	@Router		/api/v1/jobs/search [post]
func listJobsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListJobsRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if svc.Repo.Clients.Jobd == nil {
		l.Info("jobd client is not configured, returning empty jobs list")
		// Return empty list for tests/environments where jobd is not configured
		return &responses.ListJobsResponse{
			Jobs:  &[]clients.Job{},
			Total: ptr(int32(0)),
			Pages: 0,
		}, nil
	}

	var entityID *int64
	if r.EntityID != nil {
		id := int64(*r.EntityID)
		entityID = &id
	}

	var limit *int32
	limitValue := int32(20) // default limit
	if r.Limit > 0 {
		limitValue = r.Limit
		limit = &r.Limit
	}

	var status *clients.ListJobsParamsStatus
	if r.Status != nil && *r.Status != "" {
		s := clients.ListJobsParamsStatus(*r.Status)
		status = &s
	}

	var sort *clients.ListJobsParamsSort
	if r.Sort != nil && *r.Sort != "" {
		s := clients.ListJobsParamsSort(*r.Sort)
		sort = &s
	}

	var order *clients.ListJobsParamsOrder
	if r.Order != nil && *r.Order != "" {
		o := clients.ListJobsParamsOrder(*r.Order)
		order = &o
	}

	filters := clients.ListJobsFilters{
		EntityType: r.EntityType,
		EntityID:   entityID,
		Type:       r.Type,
		Status:     status,
		CreatedBy:  r.CreatedBy,
		Limit:      limit,
		Offset:     r.Offset,
		Sort:       sort,
		Order:      order,
	}

	listResp, err := svc.Repo.Clients.Jobd.ListJobs(ctx, filters)
	if err != nil {
		l.Error("failed to list jobs from jobd", err)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, "failed to list jobs from jobd"),
			ExternalMessage: "Не удалось получить список джоб",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	// Calculate pages
	var total int64
	if listResp.Total != nil {
		total = int64(*listResp.Total)
	}
	pages := shared.GetPages(total, int64(limitValue))

	return &responses.ListJobsResponse{
		Jobs:  listResp.Jobs,
		Total: listResp.Total,
		Pages: pages,
	}, nil
}

// getJobHandler godoc
//
//	@Summary	get job by ID
//	@Tags		jobs
//	@Accept		json
//	@Produce	json
//	@Param		job_id	query		int	true	"Job ID"
//	@Success	200		{object}	clients.GetJobResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Failure	503		{object}	responses.ErrorResponse	"Service Unavailable"
//	@Router		/api/v1/job [get]
func getJobHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetJobRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if svc.Repo.Clients.Jobd == nil {
		l.Info("jobd client is not configured")
		return nil, &responses.ErrorResponse{
			InternalError:   errors.New("jobd client is not configured"),
			ExternalMessage: "Job system is not available",
			HTTPStatusCode:  http.StatusNotFound,
		}
	}

	l.Info(fmt.Sprintf("Getting job from jobd, job_id=%d", r.JobID))
	jobResp, err := svc.Repo.Clients.Jobd.GetJob(ctx, r.JobID)
	if err != nil {
		l.Error(fmt.Sprintf("failed to get job from jobd, job_id=%d: %v", r.JobID, err), err)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, "failed to get job from jobd"),
			ExternalMessage: "Не удалось получить информацию о джобе",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	if jobResp == nil {
		l.Error(fmt.Sprintf("jobd returned nil response, job_id=%d", r.JobID), errors.New("nil response"))
		return nil, &responses.ErrorResponse{
			InternalError:   errors.New("jobd returned nil response"),
			ExternalMessage: "Не удалось получить информацию о джобе",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	if jobResp.Job == nil {
		l.Error(fmt.Sprintf("jobd returned response with nil Job field, job_id=%d", r.JobID), errors.New("nil job field"))
		return nil, &responses.ErrorResponse{
			InternalError:   errors.New("jobd returned response with nil Job field"),
			ExternalMessage: "Не удалось получить информацию о джобе",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	statusStr := "unknown"
	if jobResp.Job.Status != nil {
		statusStr = string(*jobResp.Job.Status)
	}
	l.Info(fmt.Sprintf("Successfully got job from jobd, job_id=%d, job_status=%s", r.JobID, statusStr))
	return jobResp, nil
}

// getJobEventsHandler godoc
//
//	@Summary	get events for a specific job
//	@Tags		jobs
//	@Accept		json
//	@Produce	json
//	@Param		job_id		query	int		true	"Job ID"
//	@Param		event_type	query	string	false	"Event type filter"
//	@Param		limit		query	int		false	"Limit"
//	@Param		offset		query	int		false	"Offset"
//	@Success	200			{object}	clients.ListEventsResponse
//	@Failure	400			{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401			{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	404			{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500			{object}	responses.ErrorResponse	"Internal server error"
//	@Failure	503			{object}	responses.ErrorResponse	"Service Unavailable"
//	@Router		/api/v1/job/events [get]
func getJobEventsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetJobEventsRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if svc.Repo.Clients.Jobd == nil {
		l.Info("jobd client is not configured, returning empty events list")
		return &clients.ListEventsResponse{
			Events: &[]clients.Event{},
			Total:  ptr(int32(0)),
		}, nil
	}

	var eventType *clients.GetEventsParamsEventType
	if r.EventType != nil && *r.EventType != "" {
		et := clients.GetEventsParamsEventType(*r.EventType)
		eventType = &et
	}

	params := &clients.GetEventsParams{
		EventType: eventType,
		Limit:     r.Limit,
		Offset:    r.Offset,
	}

	eventsResp, err := svc.Repo.Clients.Jobd.GetEvents(ctx, r.JobID, params)
	if err != nil {
		l.Error("failed to get job events from jobd", err)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, "failed to get job events from jobd"),
			ExternalMessage: "Не удалось получить события джобы",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	return eventsResp, nil
}

// listAllEventsHandler godoc
//
//	@Summary	get events for all jobs with filters
//	@Tags		jobs
//	@Accept		json
//	@Produce	json
//	@Param		job_id		query	int		false	"Filter by Job ID"
//	@Param		entity_type	query	string	false	"Filter by entity type (experiment, dataset, project, namespace)"
//	@Param		entity_id	query	int		false	"Filter by entity ID"
//	@Param		event_type	query	string	false	"Filter by event type"
//	@Param		job_type	query	string	false	"Filter by job type"
//	@Param		limit		query	int		false	"Limit (default 50, max 200)"
//	@Param		offset		query	int		false	"Offset (default 0)"
//	@Param		sort		query	string	false	"Sort field (timestamp, event_type, job_id)"
//	@Param		order		query	string	false	"Sort order (asc, desc)"
//	@Success	200			{object}	clients.ListAllEventsResponse
//	@Failure	400			{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401			{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	500			{object}	responses.ErrorResponse	"Internal server error"
//	@Failure	503			{object}	responses.ErrorResponse	"Service Unavailable"
//	@Router		/api/v1/events [get]
func listAllEventsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListAllEventsRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if svc.Repo.Clients.Jobd == nil {
		l.Info("jobd client is not configured, returning empty events list")
		return &clients.ListAllEventsResponse{
			Events: &[]clients.EventWithJob{},
			Total:  ptr(int32(0)),
		}, nil
	}

	var entityType *clients.ListAllEventsParamsEntityType
	if r.EntityType != nil && *r.EntityType != "" {
		et := clients.ListAllEventsParamsEntityType(*r.EntityType)
		entityType = &et
	}

	var eventType *clients.ListAllEventsParamsEventType
	if r.EventType != nil && *r.EventType != "" {
		et := clients.ListAllEventsParamsEventType(*r.EventType)
		eventType = &et
	}

	var sort *clients.ListAllEventsParamsSort
	if r.Sort != nil && *r.Sort != "" {
		s := clients.ListAllEventsParamsSort(*r.Sort)
		sort = &s
	}

	var order *clients.ListAllEventsParamsOrder
	if r.Order != nil && *r.Order != "" {
		o := clients.ListAllEventsParamsOrder(*r.Order)
		order = &o
	}

	filters := clients.ListAllEventsFilters{
		JobID:      r.JobID,
		EntityType: entityType,
		EntityID:   r.EntityID,
		EventType:  eventType,
		JobType:    r.JobType,
		Limit:      r.Limit,
		Offset:     r.Offset,
		Sort:       sort,
		Order:      order,
	}

	eventsResp, err := svc.Repo.Clients.Jobd.ListAllEvents(ctx, filters)
	if err != nil {
		l.Error("failed to list all events from jobd", err)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, "failed to list all events from jobd"),
			ExternalMessage: "Не удалось получить список событий",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	return eventsResp, nil
}

// cancelJobHandler cancels a running job
func cancelJobHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CancelJobRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if svc.Repo.Clients.Jobd == nil {
		err := errors.New("jobd client is not configured")
		l.Error("jobd client is not configured", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Job system is not available",
			HTTPStatusCode:  http.StatusServiceUnavailable,
		}
	}

	jobResp, err := svc.Repo.Clients.Jobd.CancelJob(ctx, r.JobID)
	if err != nil {
		l.Error("failed to cancel job", err)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, "failed to cancel job"),
			ExternalMessage: "Не удалось отменить джобу",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	return jobResp, nil
}

// retryJobHandler retries a failed job
func retryJobHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.RetryJobRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if svc.Repo.Clients.Jobd == nil {
		err := errors.New("jobd client is not configured")
		l.Error("jobd client is not configured", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Job system is not available",
			HTTPStatusCode:  http.StatusServiceUnavailable,
		}
	}

	jobResp, err := svc.Repo.Clients.Jobd.RetryJob(ctx, r.JobID)
	if err != nil {
		l.Error("failed to retry job", err)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, "failed to retry job"),
			ExternalMessage: "Не удалось перезапустить джобу",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	return jobResp, nil
}

// getJobTasksHandler godoc
//
//	@Summary	get tasks for a specific job
//	@Tags		jobs
//	@Accept		json
//	@Produce	json
//	@Param		job_id	query	int		true	"Job ID"
//	@Param		status	query	string	false	"Task status filter"
//	@Success	200		{object}	clients.ListTasksResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Failure	503		{object}	responses.ErrorResponse	"Service Unavailable"
//	@Router		/api/v1/job/tasks [get]
func getJobTasksHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetJobTasksRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if svc.Repo.Clients.Jobd == nil {
		l.Info("jobd client is not configured, returning empty tasks list")
		return &clients.ListTasksResponse{
			Tasks: &[]clients.Task{},
		}, nil
	}

	var status *clients.ListTasksParamsStatus
	if r.Status != nil && *r.Status != "" {
		s := clients.ListTasksParamsStatus(*r.Status)
		status = &s
	}

	params := &clients.ListTasksParams{
		Status: status,
	}

	tasksResp, err := svc.Repo.Clients.Jobd.ListTasks(ctx, r.JobID, params)
	if err != nil {
		l.Error("failed to get job tasks from jobd", err)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, "failed to get job tasks from jobd"),
			ExternalMessage: "Не удалось получить задачи джобы",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	return tasksResp, nil
}
