package public

import (
	"context"
	"fmt"
	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	models "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	"net/http"
	"github.com/jackc/pgx/v5"
)

// addDatasetToExperimentHandler godoc
//
//	@Summary	add dataset to experiment
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.AddDatasetToExperimentRequest	true	"request body"
//	@Success	200		{object}	responses.AddDatasetToExperimentResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/dataset [post]
func addDatasetToExperimentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.AddDatasetToExperimentRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.DatasetAttribute, acl.Create, r.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on add dataset to experiment")
	}

	linkID, dataset, experimentProjectID, alias, projectName, err := svc.AddDatasetToExperiment(ctx, r.ExperimentID, r.DatasetID, r.Alias)
	if err != nil {
		l.Error("failed to add dataset to experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	// Get experiment project ID for logging
	projectID, err := svc.GetExperimentProjectID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment project for logging", err)
	} else {
		svc.LogExperimentChange(ctx, projectID, r.ExperimentID, u.Username, r.Comment, update_log.ActionNewDatasetLink, update_log.ExperimentUpdateLog{
			New: update_log.Experiment{
				DatasetID:    r.DatasetID,
				DatasetAlias: alias,
			},
		})
	}

	return responses.AddDatasetToExperimentResponse{
		LinkID:       linkID,
		Alias:        alias,
		DatasetID: r.DatasetID,
		Name:         dataset.Name,
		ProjectID:    experimentProjectID,
		ProjectName:  projectName,
	}, nil
}

// removeDatasetFromExperimentHandler godoc
//
//	@Summary	remove dataset from experiment
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.RemoveDatasetFromExperimentRequest	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/dataset [delete]
func removeDatasetFromExperimentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.RemoveDatasetFromExperimentRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.DatasetAttribute, acl.Delete, r.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on remove dataset from experiment")
	}

	dataset, err := svc.RemoveDatasetFromExperiment(ctx, r.ExperimentID, r.LinkID)
	if err != nil {
		l.Error("failed to remove dataset from experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	// Get experiment project ID for logging
	projectID, err := svc.GetExperimentProjectID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment project for logging", err)
	} else {
		svc.LogExperimentChange(ctx, projectID, r.ExperimentID, u.Username, "", update_log.ActionDeleteDatasetLink, update_log.ExperimentUpdateLog{
			Old: update_log.Experiment{
				DatasetID:    dataset.ID,
				DatasetAlias: dataset.Alias,
			},
		})
	}

	return responses.EmptyResponse{}, nil
}

// getExperimentDatasetsHandler godoc
//
//	@Summary	get experiment datasets
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int	true	"experiment id"
//	@Success	200			{object}	responses.GetExperimentDatasetsResponse
//	@Failure	403			{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500			{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/datasets [get]
func getExperimentDatasetsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentDatasetsRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.DatasetAttribute, acl.Read, r.ExperimentID, u); err != nil {
		return nil, err
	}

	datasets, err := svc.GetExperimentDatasets(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get datasets", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	return responses.GetExperimentDatasetsResponse{
		Datasets: datasets,
	}, nil
}

// updateExperimentDatasetHandler godoc
//
//	@Summary	update experiment dataset link
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.UpdateExperimentDatasetRequest	true	"request body"
//	@Success	200		{object}	responses.UpdateExperimentDatasetResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/dataset [put]
func updateExperimentDatasetHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateExperimentDatasetRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.DatasetAttribute, acl.Edit, r.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on update experiment dataset link")
	}

	oldAlias, oldDataset, newDataset, err := svc.UpdateExperimentDataset(ctx, r.ExperimentID, r.LinkID, r.Alias)
	if err != nil {
		l.Error("failed to update experiment dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	// Get experiment project ID for logging
	projectID, err := svc.GetExperimentProjectID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment project for logging", err)
	} else {
		svc.LogExperimentChange(ctx, projectID, r.ExperimentID, u.Username, r.Comment, update_log.ActionUpdateDatasetLink, update_log.ExperimentUpdateLog{
			Old: update_log.Experiment{
				DatasetID:    oldDataset.ID,
				DatasetAlias: oldAlias,
			},
			New: update_log.Experiment{
				DatasetID:    newDataset.ID,
				DatasetAlias: r.Alias,
			},
		})
	}

	return responses.UpdateExperimentDatasetResponse{
		LinkID: r.LinkID,
		Alias:  r.Alias,
	}, nil
}

// removeDatasetFromExperimentV2Handler godoc
//
//	@Summary	remove dataset from experiment v2
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.RemoveDatasetFromExperimentV2Request	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/dataset [delete]
func removeDatasetFromExperimentV2Handler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.RemoveDatasetFromExperimentV2Request, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.DatasetAttribute, acl.Delete, r.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on remove dataset from experiment")
	}

	projectID, err := svc.GetExperimentProjectID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment project", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	l.Info(fmt.Sprintf("Attempting to remove dataset with alias '%s' from experiment %d", r.Alias, r.ExperimentID))
	ds, err := svc.RemoveDatasetFromExperimentByAlias(ctx, r.ExperimentID, r.Alias)
	if err != nil {
		l.Error(fmt.Sprintf("failed to delete experiment dataset (alias='%s', experimentID=%d): %v", r.Alias, r.ExperimentID, err), err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}
	l.Info(fmt.Sprintf("Successfully removed dataset link %d (dataset_id=%d, alias='%s') from experiment %d", ds.LinkID, ds.DatasetID, ds.Alias, r.ExperimentID))

	svc.LogExperimentChange(ctx, projectID, r.ExperimentID, u.Username, "", update_log.ActionDeleteDatasetLink, update_log.ExperimentUpdateLog{
		Old: update_log.Experiment{
			DatasetID:    ds.DatasetID,
			DatasetAlias: ds.Alias,
		},
	})

	return responses.EmptyResponse{}, nil
}

// updateExperimentDatasetV2Handler godoc
//
//	@Summary	update experiment dataset link v2
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.UpdateExperimentDatasetV2Request	true	"request body"
//	@Success	200		{object}	responses.UpdateExperimentDatasetV2Response
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/dataset [put]
func updateExperimentDatasetV2Handler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateExperimentDatasetV2Request, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.DatasetAttribute, acl.Edit, r.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on update experiment dataset link")
	}

	oldDatasetID, oldDatasetAlias, err := svc.GetDatasetFromLinkByAlias(ctx, r.ExperimentID, r.Alias)
	if errors.Is(err, pgx.ErrNoRows) {
		dataset, err := svc.GetDataset(ctx, r.DatasetID)
		if err != nil {
			l.Error("failed to get dataset", err)
			return nil, shared.ConvertServiceError(err, shared.EntityDataset)
		}

		projectID, err := svc.GetExperimentProjectID(ctx, r.ExperimentID)
		if err != nil {
			l.Error("failed to get experiment project", err)
			return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
		}

		if dataset.ProjectID.Valid == false || projectID != dataset.ProjectID.Int32 {
			if dataset.ProjectID.Valid == false {
				return nil, &responses.ErrorResponse{
					InternalError:  errors.New("dataset hasn't got project"),
					HTTPStatusCode: http.StatusForbidden,
					ExternalMessage: "Этот датасорс не был перенесен в проект, приносим свои извинения. " +
						"Создайте новый или обратитесь в StreamFlow Public Support для переноса.",
				}
			}

			if dataset.Public == false {
				return nil, &responses.ErrorResponse{
					InternalError:   errors.New("dataset is not public"),
					HTTPStatusCode:  http.StatusForbidden,
					ExternalMessage: "Это не публичный датасорс из другого проекта, обратитесь к владельцам проекта.",
				}
			}
		}

		_, err = svc.InsertExperimentDatasetLink(ctx, r.ExperimentID, r.DatasetID, r.Alias)
		if err != nil {
			l.Error("failed to add dataset to experiment", err)
			return nil, shared.ConvertServiceError(err, shared.EntityDataset)
		}

		experimentProjectID, err := svc.GetExperimentProjectID(ctx, r.ExperimentID)
		if err != nil {
			l.Error("failed to get experiment project", err)
			return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
		}

		svc.LogExperimentChange(ctx, experimentProjectID, r.ExperimentID, u.Username, r.Comment, update_log.ActionNewDatasetLink, update_log.ExperimentUpdateLog{
			New: update_log.Experiment{
				DatasetID:    r.DatasetID,
				DatasetAlias: r.Alias,
			},
		})

		return responses.UpdateExperimentDatasetV2Response{
			Alias:        r.Alias,
			DatasetID: dataset.ID,
		}, nil

	} else if err != nil {
		l.Error("failed to select dataset for update experiment dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	projectId, err := svc.GetExperimentProjectID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment project", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	ds, err := svc.GetDataset(ctx, r.DatasetID)
	if err != nil {
		l.Error("failed to select ds", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	if ds.ProjectID.Valid == false || projectId != ds.ProjectID.Int32 {
		if ds.ProjectID.Valid == false {
			return nil, &responses.ErrorResponse{
				InternalError:  errors.New("dataset hasn't got project"),
				HTTPStatusCode: http.StatusForbidden,
				ExternalMessage: "Этот датасорс не был перенесен в проект, приносим свои извинения. " +
					"Создайте новый или обратитесь в StreamFlow Public Support для переноса.",
			}
		}

		if ds.Public == false {
			return nil, &responses.ErrorResponse{
				InternalError:   errors.New("dataset is not public"),
				HTTPStatusCode:  http.StatusForbidden,
				ExternalMessage: "Это не публичный датасорс из другого проекта, обратитесь к владельцам проекта.",
			}
		}
	}

	err = svc.UpdateExperimentDatasetLinkID(ctx, oldDatasetID, r.DatasetID, r.ExperimentID)
	if err != nil {
		l.Error("failed to update experiment dataset link", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	projectID, err := svc.GetExperimentProjectID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment project for update experiment dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	newDatasetID, newDatasetAlias, err := svc.GetDatasetFromLinkByAlias(ctx, r.ExperimentID, r.Alias)
	if err != nil {
		l.Error("failed to select dataset for update experiment dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	svc.LogExperimentChange(ctx, projectID, r.ExperimentID, u.Username, r.Comment, update_log.ActionUpdateDatasetLink, update_log.ExperimentUpdateLog{
		Old: update_log.Experiment{
			DatasetID:    oldDatasetID,
			DatasetAlias: oldDatasetAlias,
		},
		New: update_log.Experiment{
			DatasetID:    newDatasetID,
			DatasetAlias: newDatasetAlias,
		},
	})

	return responses.UpdateExperimentDatasetV2Response{
		Alias:        r.Alias,
		DatasetID: newDatasetID,
	}, nil
}

// getExperimentDatasetV2Handler godoc
//
//	@Summary	get experiment datasets
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int		true	"experiment id"
//	@Param		alias		query		string	true	"alias"
//	@Success	200			{object}	dto.ExperimentDataset
//	@Failure	403			{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500			{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/dataset [get]
func getExperimentDatasetV2Handler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetDatasetFromExperimentV2Request, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.DatasetAttribute, acl.Read, r.ExperimentID, u); err != nil {
		return nil, err
	}

	dataset, err := svc.GetExperimentDatasetByLink(ctx, r.ExperimentID, r.Alias)
	if err != nil {
		l.Error("failed to get dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	return *dataset, nil
}

// getExperimentAvailableDatasetsToLinkHandler godoc
//
//	@Summary	get experiment datasets available to link
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.GetExperimentAvailableDatasetsToLinkRequest	true	"request body"
//	@Success	200		{object}	responses.GetExperimentAvailableDatasetsToLinkResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/search/datasets [post]
func getExperimentAvailableDatasetsToLinkHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentAvailableDatasetsToLinkRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.DatasetAttribute, acl.Read, r.ExperimentID, u); err != nil {
		return nil, err
	}

	availableToLink := true

	// Использовать service метод вместо прямого вызова БД  
	list, total, err := svc.GetExperimentAvailableDatasets(ctx, r.ExperimentID, core.SelectDatasetsParams{
		Limit:           r.Limit,
		Offset:          *r.Offset,
		Search:          r.Filters.Search,
		Project:         r.Filters.ProjectID,
		Namespace:       r.Filters.NamespaceID,
		Cluster:         r.Filters.Cluster,
		Path:            r.Filters.Path,
		Public:          r.Filters.Public,
		Managed:         r.Filters.Managed,
		Experiment:        r.ExperimentID,
		AvailableToLink: &availableToLink,
	})
	if err != nil {
		l.Error("failed to get datasets", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	var res responses.GetExperimentAvailableDatasetsToLinkResponse
	res.Total = total
	res.Pages = shared.GetPages(total, int64(r.Limit))
	res.Datasets = list

	return &res, nil
}
