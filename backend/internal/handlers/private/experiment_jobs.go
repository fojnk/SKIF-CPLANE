package private

import (
	"context"
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

func ptr[T any](v T) *T {
	return &v
}

func jobQueueUnavailable(external string) *responses.ErrorResponse {
	return &responses.ErrorResponse{
		InternalError:   errors.New("job queue disabled"),
		ExternalMessage: external,
		HTTPStatusCode:  http.StatusServiceUnavailable,
	}
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

	_, err = svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment info", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	l.Info("apply experiment dataset: job queue removed")
	return nil, jobQueueUnavailable("Применение датасетов через очередь задач недоступно (jobd отключён)")
}

func cleanExperimentQueueHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CleanExperimentQueueRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeExperimentStateApply, service.ACLActionEdit, r.ExperimentID, u); err != nil {
		return nil, err
	}

	_, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment info", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	l.Info("clean experiment queue: job queue removed")
	return nil, jobQueueUnavailable("Очистка очереди через jobd недоступна")
}

// listJobsHandler godoc
//
//	@Summary	search and list jobs with filters (job queue disabled — always empty)
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
	_ = svc
	_ = r
	_ = u
	l.Info("list jobs: job queue removed, empty list")
	return &responses.ListJobsResponse{
		Jobs:  &[]clients.Job{},
		Total: ptr(int32(0)),
		Pages: 0,
	}, nil
}

// getJobHandler godoc
//
//	@Summary	get job by ID (job queue disabled)
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
	_ = ctx
	_ = svc
	_ = u
	l.Info("get job: job queue removed")
	return nil, jobQueueUnavailable("Получение джобы недоступно (jobd отключён)")
}

// getJobEventsHandler godoc
//
//	@Summary	get events for a specific job (job queue disabled — empty)
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
	_ = svc
	_ = r
	_ = u
	l.Info("get job events: job queue removed, empty list")
	return &clients.ListEventsResponse{
		Events: &[]clients.Event{},
		Total:  ptr(int32(0)),
	}, nil
}

// listAllEventsHandler godoc
//
//	@Summary	get events for all jobs with filters (job queue disabled — empty)
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
	_ = svc
	_ = r
	_ = u
	l.Info("list all events: job queue removed, empty list")
	return &clients.ListAllEventsResponse{
		Events: &[]clients.EventWithJob{},
		Total:  ptr(int32(0)),
	}, nil
}

// cancelJobHandler cancels a running job
func cancelJobHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CancelJobRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	_ = ctx
	_ = svc
	_ = r
	_ = u
	l.Info("cancel job: job queue removed")
	return nil, jobQueueUnavailable("Отмена джобы недоступна (jobd отключён)")
}

// retryJobHandler retries a failed job
func retryJobHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.RetryJobRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	_ = ctx
	_ = svc
	_ = r
	_ = u
	l.Info("retry job: job queue removed")
	return nil, jobQueueUnavailable("Повтор джобы недоступен (jobd отключён)")
}

// getJobTasksHandler godoc
//
//	@Summary	get tasks for a specific job (job queue disabled — empty)
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
	_ = svc
	_ = r
	_ = u
	l.Info("get job tasks: job queue removed, empty list")
	return &clients.ListTasksResponse{
		Tasks: &[]clients.Task{},
	}, nil
}
