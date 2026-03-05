package public

import (
	"context"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

// listExperimentConfigVersionsHandler godoc
//
//	@Summary	list experiment versions
//	@Security	BearerAuth
//	@Tags		experiment
//	@Param		experiment_id	query	int	true	"experiment id"
//	@Param		from		query	int	true	"from"
//	@Param		limit		query	int	true	"limit"
//	@Produce	json
//	@Success	200	{object}	responses.ListExperimentVersionsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/versions [get]
func listExperimentConfigVersionsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListExperimentVersionsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, r.ExperimentID, u); err != nil {
		return nil, err
	}

	versions, total, err := svc.ListExperimentVersions(ctx, r.ExperimentID, r.Limit, *r.From)
	if err != nil {
		l.Error("failed to list experiment versions", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	var res responses.ListExperimentVersionsResponse
	res.Total = total
	res.Versions = versions
	res.Pages = shared.GetPages(total, int64(r.Limit))

	return &res, nil
}

// getExperimentConfigByVersionHandler godoc
//
//	@Summary	get experiment config by version
//	@Security	BearerAuth
//	@Tags		experiment
//	@Param		experiment_id	query	int	true	"experiment id"
//	@Param		version_id	query	int	true	"config version id"
//	@Produce	json
//	@Success	200	{object}	dto.ExperimentTemplate
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/version [get]
func getExperimentConfigByVersionHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentConfigVersionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, r.ExperimentID, u); err != nil {
		return nil, err
	}

	template, err := svc.GetExperimentVersion(ctx, r.VersionID)
	if err != nil {
		l.Error("failed to get experiment version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	return template, nil
}

// getExperimentCurrentConfigVersionHandler godoc
//
//	@Summary	get experiment current config version
//	@Security	BearerAuth
//	@Tags		experiment
//	@Param		experiment_id	query	int	true	"experiment id"
//	@Produce	json
//	@Success	200	{object}	responses.CurrentExperimentVersionResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/version/current [get]
func getExperimentCurrentConfigVersionHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentCurrentVersionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, r.ExperimentID, u); err != nil {
		return nil, err
	}

	templateID, err := svc.GetExperimentCurrentVersion(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment current version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	return &responses.CurrentExperimentVersionResponse{
		VersionID: templateID,
	}, nil
}

// updateExperimentConfigVersionHandler godoc
//
//	@Summary	update version of experiment, you can back to the previous versions
//	@Security	BearerAuth
//	@Tags		experiment
//	@Param		request	body	requests.UpdateExperimentConfigVersionRequest	true	"request body"
//	@Produce	json
//	@Success	200	{object}	responses.CurrentExperimentVersionResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/version/current [put]
func updateExperimentConfigVersionHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateExperimentConfigVersionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, r.ExperimentID, u); err != nil {
		return nil, err
	}

	oldExperiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get old experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	completeExperiment, err := svc.UpdateExperimentVersion(ctx, r.ExperimentID, r.VersionID, r.Comment, u.Username)
	if err != nil {
		l.Error("failed to update experiment version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, oldExperiment.ProjectID, r.ExperimentID, u.Username, r.Comment, update_log.ActionUpdate, update_log.ExperimentUpdateLog{
		New: update_log.Experiment{
			Name:   completeExperiment.Name,
			Config: completeExperiment.Config,
		},
		Old: update_log.Experiment{
			Name:   oldExperiment.Name,
			Config: oldExperiment.Config,
		},
	})

	return &responses.UpdateCompleteExperimentResponse{
		CompleteExperiment: *completeExperiment,
	}, nil
}
