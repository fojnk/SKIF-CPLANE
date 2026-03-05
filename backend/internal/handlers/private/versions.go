package private

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5/pgtype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	"net/http"
)

// listExperimentConfigVersionsHandler godoc
//
//	@Summary	list experiment versions
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

// updateExperimentVersionCommentHandler godoc
//
//	@Summary	update experiment version comment
//	@Tags		experiment
//	@Param		request	body	requests.UpdateExperimentVersionCommentRequest	true	"request body"
//	@Produce	json
//	@Success	200	{object}	dto.ExperimentTemplate
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/version [put]
func updateExperimentVersionCommentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateExperimentVersionCommentRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	tmp, err := svc.GetExperimentVersion(ctx, r.ID)
	if err != nil {
		l.Error("failed to get experiment version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	if u.Username != tmp.Creator {
		l.Info("forbidden")
		return nil, &responses.ErrorResponse{
			ExternalMessage: "you can't edit this version",
			InternalError:   errors.New("forbidden"),
			HTTPStatusCode:  http.StatusForbidden,
		}
	}

	template, err := svc.UpdateExperimentVersionComment(ctx, r.ID, r.Comment, u.Username)
	if err != nil {
		l.Error("failed to update experiment version comment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	return template, nil
}

// getExperimentCurrentConfigVersionHandler godoc
//
//	@Summary	get experiment current config version
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

// listExperimentVariableVersionsHandler godoc
//
//	@Summary	list experiment variable versions
//	@Tags		experiment
//	@Param		variable_id	query	int	false	"variable id"
//	@Param		experiment_id	query	int	true	"experiment id"
//	@Param		from		query	int	true	"from"
//	@Param		limit		query	int	true	"limit"
//	@Produce	json
//	@Success	200	{object}	responses.ListExperimentVariableVersionsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/variable/versions [get]
func listExperimentVariableVersionsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListExperimentVariableVersionsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	versions, total, err := svc.ListExperimentVariableVersions(ctx, r.VariableID, r.ExperimentID, r.Limit, *r.From)
	if err != nil {
		l.Error("failed to list experiment variable versions", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	var res responses.ListExperimentVariableVersionsResponse
	res.Total = total
	res.Versions = versions
	res.Pages = shared.GetPages(total, int64(r.Limit))

	return &res, nil
}

// getExperimentVariableCurrentVersionHandler godoc
//
//	@Summary	get experiment variable current version
//	@Tags		experiment
//	@Param		variable_id	query	int	true	"variable id"
//	@Produce	json
//	@Success	200	{object}	responses.CurrentExperimentVersionResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/variable/version/current [get]
func getExperimentVariableCurrentVersionHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentVariableCurrentVersionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	versionID, err := svc.GetExperimentVariableCurrentVersion(ctx, r.VariableID)
	if err != nil {
		l.Error("failed to get experiment variable current version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	return &responses.CurrentExperimentVariableVersionResponse{
		VersionID: versionID,
	}, nil
}

// getExperimentVariableVersionHandler godoc
//
//	@Summary	get experiment config by version
//	@Tags		experiment
//	@Param		version_id	query	int	true	"version id"
//	@Produce	json
//	@Success	200	{object}	dto.ExperimentVariableVersionTemplate
//	@Router		/api/v2/experiment/variable/version [get]
func getExperimentVariableVersionHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentVariableVersionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	template, err := svc.GetExperimentVariableVersion(ctx, r.VersionID)
	if err != nil {
		l.Error("failed to get experiment variable version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	return template, nil
}

// updateExperimentVariableVersionCommentHandler godoc
//
//	@Summary	update experiment version comment
//	@Tags		experiment
//	@Param		request	body	requests.UpdateExperimentVariableVersionCommentRequest	true	"request body"
//	@Produce	json
//	@Success	200	{object}	dto.ExperimentVariableVersionTemplate
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/variable/version [put]
func updateExperimentVariableVersionCommentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateExperimentVariableVersionCommentRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	tmp, err := svc.GetExperimentVariableVersion(ctx, r.ID)
	if err != nil {
		l.Error("failed to get experiment variable version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	if u.Username != tmp.Creator {
		l.Info("forbidden")
		return nil, &responses.ErrorResponse{
			ExternalMessage: "you can't edit this version",
			InternalError:   errors.New("forbidden"),
			HTTPStatusCode:  http.StatusForbidden,
		}
	}

	template, err := svc.UpdateExperimentVariableVersionComment(ctx, r.ID, r.Comment, u.Username)
	if err != nil {
		l.Error("failed to update experiment variable version comment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	return template, nil
}

// updateExperimentVariableVersionHandler godoc
//
//	@Summary	update version of experiment, you can back to the previous versions
//	@Tags		experiment
//	@Param		request	body	requests.UpdateExperimentVariableVersionRequest	true	"request body"
//	@Produce	json
//	@Success	200	{object}	responses.CurrentExperimentVersionResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/variable/version/current [put]
func updateExperimentVariableVersionHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateExperimentVariableVersionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	oldVariable, newVariable, projectID, err := svc.UpdateExperimentVariableVersion(ctx, r.VariableID, r.VersionID, r.Comment, u.Username)
	if err != nil {
		l.Error("failed to update experiment variable version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	// Get experiment ID from variable
	variable, err := svc.GetExperimentVariable(ctx, r.VariableID)
	if err != nil {
		l.Error("failed to get variable for logging", err)
	} else {
		svc.LogExperimentChange(ctx, projectID, variable.ExperimentID, u.Username, "", update_log.ActionUpdateVariable, update_log.ExperimentUpdateLog{
			Old: update_log.Experiment{
				VariableName:  newVariable.Name,
				VariableValue: oldVariable.Value,
				VariableType:  oldVariable.Type,
			},
			New: update_log.Experiment{
				VariableValue: newVariable.Value,
				VariableType:  newVariable.Type,
				VariableName:  newVariable.Name,
			},
		})
	}

	return &responses.UpdateExperimentVariableResponse{
		Variable: *newVariable,
	}, nil
}

// listDatasetVersionsHandler godoc
//
//	@Summary	list dataset versions
//	@Tags		dataset
//	@Param		dataset_id	query	int	true	"dataset id"
//	@Param		from			query	int	true	"from"
//	@Param		limit			query	int	true	"limit"
//	@Produce	json
//	@Success	200	{object}	responses.ListDatasetVersionsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset/versions [get]
func listDatasetVersionsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListDatasetVersionsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	versions, total, err := svc.ListDatasetVersions(ctx, r.DatasetID, r.Limit, *r.From)
	if err != nil {
		l.Error("failed to list dataset versions", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	var res responses.ListDatasetVersionsResponse
	res.Total = total
	res.Versions = versions
	res.Pages = shared.GetPages(total, int64(r.Limit))

	return &res, nil
}

// getDatasetCurrentVersionHandler godoc
//
//	@Summary	get dataset current version
//	@Tags		dataset
//	@Param		dataset_id	query	int	true	"dataset id"
//	@Produce	json
//	@Success	200	{object}	responses.CurrentDatasetVersionResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset/version/current [get]
func getDatasetCurrentVersionHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetDatasetCurrentVersionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	datasetVersion, err := svc.GetDatasetCurrentVersion(ctx, r.DatasetID)
	if err != nil {
		l.Error("failed to get dataset current version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	return &responses.CurrentDatasetVersionResponse{
		VersionID: datasetVersion,
	}, nil
}

// getDatasetVersionHandler godoc
//
//	@Summary	get dataset version
//	@Tags		dataset
//	@Param		version_id	query	int	true	"version id"
//	@Produce	json
//	@Success	200	{object}	dto.DatasetVersionTemplate
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset/version [get]
func getDatasetVersionHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetDatasetVersionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	template, err := svc.GetDatasetVersion(ctx, r.VersionID)
	if err != nil {
		l.Error("failed to get dataset version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	return template, nil
}

// updateDatasetVersionCommentHandler godoc
//
//	@Summary	update dataset version comment
//	@Tags		dataset
//	@Param		request	body	requests.UpdateDatasetVersionCommentRequest	true	"request body"
//	@Produce	json
//	@Success	200	{object}	dto.DatasetVersionTemplate
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset/version [put]
func updateDatasetVersionCommentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateDatasetVersionCommentRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	tmp, err := svc.GetDatasetVersion(ctx, r.ID)
	if err != nil {
		l.Error("failed to get dataset version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	if u.Username != tmp.Creator {
		l.Info("forbidden")
		return nil, &responses.ErrorResponse{
			ExternalMessage: "you can't edit this version",
			InternalError:   errors.New("forbidden"),
			HTTPStatusCode:  http.StatusForbidden,
		}
	}

	template, err := svc.UpdateDatasetVersionComment(ctx, r.ID, r.Comment, u.Username)
	if err != nil {
		l.Error("failed to update dataset version comment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	return template, nil
}

// updateDatasetVersionHandler godoc
//
//	@Summary	update version of dataset, you can back to the previous versions
//	@Tags		dataset
//	@Param		request	body	requests.UpdateDatasetVersionRequest	true	"request body"
//	@Produce	json
//	@Success	200	{object}	responses.UpdateDatasetResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset/version/current [put]
func updateDatasetVersionHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateDatasetVersionRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	dataset, err := svc.UpdateDatasetVersion(ctx, r.DatasetID, r.VersionID, r.Comment, u.Username)
	if err != nil {
		l.Error("failed to update dataset version", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	// Log the change
	svc.LogDatasetChange(ctx, 0, pgtype.Int4{Int32: dataset.ID, Valid: true}, dataset.ID, u.Username, "", update_log.ActionUpdateVariable, update_log.DatasetUpdateLog{
		Old: update_log.Dataset{
			Schema:  dataset.Schema,
			Params:  dataset.Params,
			Public:  dataset.Public,
			Managed: dataset.Managed,
			Name:    dataset.Name,
			Type:    dataset.Type,
		},
		New: update_log.Dataset{
			Schema:  dataset.Schema,
			Params:  dataset.Params,
			Public:  dataset.Public,
			Managed: dataset.Managed,
			Name:    dataset.Name,
			Type:    dataset.Type,
		},
	})

	return &responses.UpdateDatasetResponse{
		Dataset: *dataset,
	}, nil
}
