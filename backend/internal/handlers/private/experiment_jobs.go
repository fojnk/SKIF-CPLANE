package private

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	models "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	responses "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

func ptr[T any](v T) *T {
	return &v
}

func isExperimentRunLogAct(act string) bool {
	switch act {
	case string(update_log.ActionStartExperiment),
		string(update_log.ActionStopExperiment),
		string(update_log.ActionApplyExperiment):
		return true
	default:
		return false
	}
}

func experimentRunLogToJob(log *dto.ExperimentUpdateLog) *clients.Job {
	id := int64(log.ID)
	st := "completed"
	if log.Act == string(update_log.ActionStartExperiment) || log.Act == string(update_log.ActionApplyExperiment) {
		st = "pending"
	}
	created := log.CreatedAt.UTC().Format(time.RFC3339)
	typ := log.Act
	desc := log.Comment
	if desc == "" {
		desc = "Запись из истории эксперимента"
	}
	name := log.Name
	job := &clients.Job{
		Id:                &id,
		Status:            &st,
		Type:              &typ,
		CreatedAt:         &created,
		CreatedBy:         &log.User,
		StatusDescription: &desc,
		Name:              &name,
	}
	return job
}

func mapSupervisorRunToStages(run *responses.SupervisorExperimentRun) *[]clients.JobStage {
	if run == nil {
		return nil
	}

	// Fallback for runtimes where supervisor may return status/progress without per-model jobs.
	if len(run.Jobs) == 0 {
		if run.TotalModels <= 0 {
			return nil
		}
		out := make([]clients.JobStage, 0, run.TotalModels)
		runtimeStatus := strings.ToUpper(strings.TrimSpace(run.Status))
		for i := 1; i <= run.TotalModels; i++ {
			stepID := int64(i)
			name := fmt.Sprintf("stage-%d", i)

			stepStatus := "pending"
			switch runtimeStatus {
			case "COMPLETED":
				stepStatus = "completed"
			case "FAILED":
				if i < run.CurrentOrder {
					stepStatus = "completed"
				} else if i == run.CurrentOrder {
					stepStatus = "failed"
				}
			case "RUNNING":
				if i < run.CurrentOrder {
					stepStatus = "completed"
				} else if i == run.CurrentOrder {
					stepStatus = "running"
				}
			case "QUEUED":
				if i < run.CurrentOrder {
					stepStatus = "completed"
				} else if i == run.CurrentOrder {
					stepStatus = "queued"
				}
			case "CANCELLED":
				if i < run.CurrentOrder {
					stepStatus = "completed"
				} else if i == run.CurrentOrder {
					stepStatus = "cancelled"
				}
			}

			var desc *string
			if i == run.CurrentOrder && strings.TrimSpace(run.Detail) != "" {
				s := strings.TrimSpace(run.Detail)
				desc = &s
			}

			out = append(out, clients.JobStage{
				StepID:      &stepID,
				Name:        &name,
				StepStatus:  &stepStatus,
				Description: desc,
			})
		}
		return &out
	}

	out := make([]clients.JobStage, 0, len(run.Jobs))
	for _, mj := range run.Jobs {
		idx := int64(mj.Index)
		n := mj.ModelName
		ss := strings.ToLower(strings.TrimSpace(mj.Status))
		logParts := make([]string, 0, 4)
		if mj.ErrorMessage != "" {
			logParts = append(logParts, mj.ErrorMessage)
		}
		if mj.StartTime != "" {
			logParts = append(logParts, "start_time: "+mj.StartTime)
		}
		if mj.EndTime != "" {
			logParts = append(logParts, "end_time: "+mj.EndTime)
		}
		if run.CurrentOrder == mj.Index && strings.TrimSpace(run.Detail) != "" {
			logParts = append(logParts, run.Detail)
		}
		var desc *string
		if len(logParts) > 0 {
			s := strings.Join(logParts, "\n")
			desc = &s
		}
		out = append(out, clients.JobStage{
			StepID:      &idx,
			Name:        &n,
			StepStatus:  &ss,
			Description: desc,
		})
	}
	return &out
}

type supervisorConfigForJobStages struct {
	Models []supervisorConfigModelForJobStage `json:"models"`
}

type supervisorConfigModelForJobStage struct {
	Order    int    `json:"order"`
	Name     string `json:"name"`
	Language string `json:"language"`
}

func mapSupervisorConfigToPlannedStages(configJSON string) *[]clients.JobStage {
	if strings.TrimSpace(configJSON) == "" {
		return nil
	}

	var cfg supervisorConfigForJobStages
	if err := json.Unmarshal([]byte(configJSON), &cfg); err != nil {
		return nil
	}
	if len(cfg.Models) == 0 {
		return nil
	}

	out := make([]clients.JobStage, 0, len(cfg.Models))
	for i, m := range cfg.Models {
		order := m.Order
		if order <= 0 {
			order = i + 1
		}
		stepID := int64(order)
		name := strings.TrimSpace(m.Name)
		if name == "" {
			name = fmt.Sprintf("stage-%d", order)
		}
		if lang := strings.TrimSpace(m.Language); lang != "" {
			name = fmt.Sprintf("%s [%s]", name, lang)
		}
		stepStatus := "pending"

		out = append(out, clients.JobStage{
			StepID:     &stepID,
			Name:       &name,
			StepStatus: &stepStatus,
		})
	}

	return &out
}

// applyLiveSupervisorAndQueue подмешивает в строку задачи актуальный статус супервизора и при необходимости — глубину очереди RabbitMQ.
func applyLiveSupervisorAndQueue(ctx context.Context, svc *service.Service, l *logger.Logger, experimentID int32, job *clients.Job) {
	if svc == nil || job == nil {
		return
	}
	if cfgJSON, cfgErr := svc.GetSupervisorConfig(ctx, experimentID); cfgErr == nil {
		if stages := mapSupervisorConfigToPlannedStages(cfgJSON); stages != nil {
			job.Stages = stages
		}
	}

	orchID, err := svc.GetSupervisorExperimentID(ctx, experimentID)
	if err != nil {
		status := "pending"
		desc := strings.TrimSpace("Запуск отправлен. Ожидается присвоение orch_id от супервизора.")
		if job.StatusDescription != nil && strings.TrimSpace(*job.StatusDescription) != "" {
			desc = strings.TrimSpace(*job.StatusDescription) + " · " + desc
		}
		job.Status = &status
		job.StatusDescription = &desc
		return
	}
	st := svc.GetExperimentStatus(ctx, orchID)

	statusStr := ""
	if st.Supervisor != nil && strings.TrimSpace(st.Supervisor.Status) != "" {
		statusStr = strings.ToLower(strings.TrimSpace(st.Supervisor.Status))
	}
	if statusStr == "" {
		switch string(st.Status) {
		case "PENDING":
			statusStr = "pending"
		case "OK":
			statusStr = "completed"
		case "ERROR":
			statusStr = "failed"
		case "WARNING":
			statusStr = "cancelled"
		default:
			statusStr = "unknown"
		}
	}

	baseDesc := ""
	if job.StatusDescription != nil {
		baseDesc = strings.TrimSpace(*job.StatusDescription)
	}
	desc := strings.TrimSpace(st.Message)
	if st.Supervisor != nil {
		if d := strings.TrimSpace(st.Supervisor.Detail); d != "" {
			desc = d
		}
		if stages := mapSupervisorRunToStages(st.Supervisor); stages != nil {
			job.Stages = stages
		}
	}
	if desc == "" {
		desc = baseDesc
	} else if baseDesc != "" && desc != baseDesc {
		desc = baseDesc + " · " + desc
	}

	if svc.Repo != nil && svc.Repo.Clients != nil && svc.Repo.Clients.RabbitMQ != nil {
		n, qerr := svc.Repo.Clients.RabbitMQ.SupervisorQueueMessagesReady(ctx)
		if qerr != nil {
			l.Info(fmt.Sprintf("rabbitmq supervisor queue inspect: %v", qerr))
		} else if n > 0 {
			qnote := fmt.Sprintf("Очередь RabbitMQ (супервизор): %d сообщ. ожидают обработки", n)
			if desc != "" {
				desc = desc + " · " + qnote
			} else {
				desc = qnote
			}
			if statusStr == "unknown" || statusStr == "" {
				statusStr = "queued"
			}
		}
	}
	if (statusStr == "unknown" || statusStr == "") && job.Stages != nil && len(*job.Stages) > 0 {
		statusStr = "pending"
	}

	job.Status = &statusStr
	job.StatusDescription = &desc
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
//	@Summary	search and list jobs with filters (без jobd: история start/stop/apply + живой статус супервизора и очереди RabbitMQ для последнего start/apply)
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
	if r.EntityType == nil || r.EntityID == nil {
		l.Info("list jobs: no entity filter, empty list")
		empty := []clients.Job{}
		z := int32(0)
		return &responses.ListJobsResponse{Jobs: &empty, Total: &z, Pages: 0}, nil
	}

	limit := r.Limit
	if limit <= 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}
	offset := int32(0)
	if r.Offset != nil {
		offset = *r.Offset
	}

	et := strings.ToLower(strings.TrimSpace(*r.EntityType))
	switch et {
	case "experiment":
		if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, *r.EntityID, u); err != nil {
			return nil, err
		}
		logs, total, err := svc.ListExperimentRunLogs(ctx, *r.EntityID, limit, offset)
		if err != nil {
			l.Error("list jobs from experiment logs", err)
			return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
		}
		jobs := make([]clients.Job, 0, len(logs))
		liveApplied := false
		for i := range logs {
			if r.CreatedBy != nil && *r.CreatedBy != "" && logs[i].User != *r.CreatedBy {
				continue
			}
			j := experimentRunLogToJob(&logs[i])
			if !liveApplied && (logs[i].Act == string(update_log.ActionStartExperiment) || logs[i].Act == string(update_log.ActionApplyExperiment)) {
				applyLiveSupervisorAndQueue(ctx, svc, l, *r.EntityID, j)
				liveApplied = true
			}
			jobs = append(jobs, *j)
		}
		t32 := int32(total)
		if int64(t32) != total {
			t32 = int32(2147483647)
		}
		return &responses.ListJobsResponse{
			Jobs:  &jobs,
			Total: &t32,
			Pages: shared.GetPages(total, int64(limit)),
		}, nil
	default:
		l.Info(fmt.Sprintf("list jobs: entity type not supported for log-backed listing: %s", et))
		empty := []clients.Job{}
		z := int32(0)
		return &responses.ListJobsResponse{Jobs: &empty, Total: &z, Pages: 0}, nil
	}
}

// getJobHandler godoc
//
//	@Summary	get job by ID (без jobd: job_id = id строки истории эксперимента из списка задач)
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
	if r.JobID <= 0 || r.JobID > int64(^uint32(0)>>1) {
		return nil, shared.ConvertServiceError(serviceerrors.NewBadRequestError("некорректный job_id", nil), shared.EntityExperiment)
	}
	logRow, _, experimentID, projectID, err := svc.GetExperimentLog(ctx, int32(r.JobID))
	if err != nil {
		l.Info(fmt.Sprintf("get job: not an experiment log: %v", err))
		return nil, jobQueueUnavailable("Получение джобы недоступно (jobd отключён)")
	}
	if !isExperimentRunLogAct(logRow.Act) {
		return nil, jobQueueUnavailable("Получение джобы недоступно (jobd отключён)")
	}
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, experimentID, u); err != nil {
		if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.NoAttribute, acl.Read, projectID, u); err != nil {
			return nil, err
		}
	}
	j := experimentRunLogToJob(logRow)
	if logRow.Act == string(update_log.ActionStartExperiment) || logRow.Act == string(update_log.ActionApplyExperiment) {
		applyLiveSupervisorAndQueue(ctx, svc, l, experimentID, j)
	}
	return &clients.GetJobResponse{Job: j}, nil
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
