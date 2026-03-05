package public

import (
	"context"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

// listProjectUpdateLogsHandler godoc
//
//	@Summary	list project update logs
//	@Security	BearerAuth
//	@Tags		project
//	@Param		project_id		query	int	false	"project id"
//	@Param		namespace_id	query	int	false	"namespace id"
//	@Param		from			query	int	true	"from"
//	@Param		limit			query	int	true	"limit"
//	@Produce	json
//	@Success	200	{object}	responses.ListProjectUpdateLogsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/project/logs [get]
func listProjectUpdateLogsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListProjectUpdateLogsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if r.ProjectID == 0 {
		if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.NoAttribute, acl.Read, r.NamespaceID, u); err != nil {
			return nil, err
		}
	} else {
		if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.NoAttribute, acl.Read, r.ProjectID, u); err != nil {
			return nil, err
		}
	}

	logs, total, err := svc.ListProjectUpdateLogs(ctx, r.ProjectID, r.NamespaceID, r.Limit, *r.From)
	if err != nil {
		l.Error("failed to list project update logs", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUpdateLog)
	}

	var res responses.ListProjectUpdateLogsResponse
	res.Total = total
	res.Logs = logs
	res.Pages = shared.GetPages(total, int64(r.Limit))

	return &res, nil
}

// getNamespaceLogHandler godoc
//
//	@Summary	get project update log
//	@Security	BearerAuth
//	@Tags		project
//	@Param		log_id	query	int	true	"log id"
//	@Produce	json
//	@Success	200	{object}	responses.GetProjectLogResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/project/log [get]
func getProjectLogHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetProjectLogRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	log, details, projectID, namespaceID, err := svc.GetProjectLog(ctx, r.LogID)
	if err != nil {
		l.Error("failed to get project log", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUpdateLog)
	}

	// if project is deleted, check namespace permission
	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.NoAttribute, acl.Read, projectID, u); err != nil {
		if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.NoAttribute, acl.Read, namespaceID, u); err != nil {
			return nil, err
		}
	}

	var res responses.GetProjectLogResponse
	res.ID = log.ID
	res.CreatedAt = log.CreatedAt
	res.Act = log.Act
	res.User = log.User
	res.Details = details
	res.Comment = log.Comment
	res.Name = log.Name

	return &res, nil
}

// listDatasetUpdateLogsByProjectHandler godoc
//
//	@Summary	list dataset update logs
//	@Security	BearerAuth
//	@Tags		dataset
//	@Param		dataset_id	query	int	false	"dataset id"
//	@Param		project_id		query	int	false	"project id"
//	@Param		from			query	int	true	"from"
//	@Param		limit			query	int	true	"limit"
//	@Produce	json
//	@Success	200	{object}	responses.ListDatasetUpdateLogsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset/logs [get]
func listDatasetUpdateLogsByProjectHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListDatasetUpdateLogsByProjectRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if r.DatasetID == 0 {
		if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.NoAttribute, acl.Read, r.ProjectID, u); err != nil {
			return nil, err
		}
	} else {
		if err := shared.CheckPermission(ctx, l, svc, acl.Dataset, acl.NoAttribute, acl.Read, r.DatasetID, u); err != nil {
			return nil, err
		}
	}

	logs, total, err := svc.ListDatasetUpdateLogsByProject(ctx, r.DatasetID, r.ProjectID, r.Limit, *r.From)
	if err != nil {
		l.Error("failed to list dataset update logs by project", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUpdateLog)
	}

	var res responses.ListDatasetUpdateLogsResponse
	res.Total = total
	res.Logs = logs
	res.Pages = shared.GetPages(total, int64(r.Limit))

	return &res, nil
}

// getDatasetLogHandler godoc
//
//	@Summary	get dataset update log
//	@Security	BearerAuth
//	@Tags		dataset
//	@Param		log_id	query	int	true	"log id"
//	@Produce	json
//	@Success	200	{object}	responses.GetDatasetLogResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/dataset/log [get]
func getDatasetLogHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetDatasetLogRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	log, details, datasetID, namespaceID, err := svc.GetDatasetLog(ctx, r.LogID)
	if err != nil {
		l.Error("failed to get dataset log", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUpdateLog)
	}

	// if dataset is deleted, check namespace permission
	if err := shared.CheckPermission(ctx, l, svc, acl.Dataset, acl.NoAttribute, acl.Read, datasetID, u); err != nil {
		if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.NoAttribute, acl.Read, namespaceID, u); err != nil {
			return nil, err
		}
	}

	var res responses.GetDatasetLogResponse
	res.ID = log.ID
	res.CreatedAt = log.CreatedAt
	res.Act = log.Act
	res.User = log.User
	res.Details = details
	res.Comment = log.Comment
	res.Name = log.Name
	res.JobID = log.JobID

	return &res, nil
}

// listExperimentUpdateLogsHandler godoc
//
//	@Summary	list experiment update logs
//	@Security	BearerAuth
//	@Tags		experiment
//	@Param		experiment_id	query	int	false	"experiment id"
//	@Param		project_id	query	int	false	"project id"
//	@Param		from		query	int	true	"from"
//	@Param		limit		query	int	true	"limit"
//	@Produce	json
//	@Success	200	{object}	responses.ListExperimentUpdateLogsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/logs [get]
func listExperimentUpdateLogsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListExperimentUpdateLogsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if r.ExperimentID == 0 {
		if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.NoAttribute, acl.Read, r.ProjectID, u); err != nil {
			return nil, err
		}
	} else {
		if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, r.ExperimentID, u); err != nil {
			return nil, err
		}
	}

	logs, total, err := svc.ListExperimentUpdateLogs(ctx, r.ExperimentID, r.ProjectID, r.Limit, *r.From)
	if err != nil {
		l.Error("failed to list experiment update logs", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUpdateLog)
	}

	var res responses.ListExperimentUpdateLogsResponse
	res.Total = total
	res.Logs = logs
	res.Pages = shared.GetPages(total, int64(r.Limit))

	return &res, nil
}

// getExperimentLogHandler godoc
//
//	@Summary	get experiment update log
//	@Security	BearerAuth
//	@Tags		experiment
//	@Param		log_id	query	int	true	"log id"
//	@Produce	json
//	@Success	200	{object}	responses.GetExperimentLogResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/log [get]
func getExperimentLogHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentLogRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	log, details, experimentID, projectID, err := svc.GetExperimentLog(ctx, r.LogID)
	if err != nil {
		l.Error("failed to get experiment log", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUpdateLog)
	}

	// if experiment is deleted, check project permission
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, experimentID, u); err != nil {
		if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.NoAttribute, acl.Read, projectID, u); err != nil {
			return nil, err
		}
	}

	var res responses.GetExperimentLogResponse
	res.ID = log.ID
	res.CreatedAt = log.CreatedAt
	res.Act = log.Act
	res.User = log.User
	res.Details = details
	res.Comment = log.Comment
	res.Name = log.Name
	res.JobID = log.JobID

	return &res, nil
}
