package private

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/validation"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

// getAvailableClustersHandler godoc
//
//	@Summary	get dataset clusters
//	@Tags		dataset
//	@Accept		json
//	@Produce	json
//	@Success	200	{object}	responses.GetAvailableDatasetClustersResponse
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/datasets/clusters [get]
func getAvailableClustersHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetAvailableDatasetClustersRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	clusters := svc.GetAvailableClusters()
	return responses.GetAvailableDatasetClustersResponse{
		Clusters: clusters,
	}, nil
}

// validateDatasetConfigHandler godoc
//
//	@Summary	validate dataset config
//	@Tags		dataset
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.DatasetValidateRequest	true	"request body"
//	@Success	200		{object}	responses.ValidationResponse
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset/config/validate [post]
func validateDatasetConfigHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DatasetValidateRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	err := validation.DatasetParamsSyntaxConfigValidation(r.DatasetConfig)
	if err != nil {
		l.Error("failed to validate project config", err)
		return responses.ValidationResponse{
			Success: false,
			Errors:  err.Error(),
		}, nil
	}

	return responses.ValidationResponse{
		Success: true,
	}, nil
}

// createDatasetHandlerV2 godoc
//
//	@Summary	create dataset
//	@Tags		dataset
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CreateDatasetRequestV2	true	"request body"
//	@Success	200		{object}	responses.CreateDatasetResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	409		{object}	responses.ErrorResponse	"Conflict - resource already exists"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset [post]
func createDatasetHandlerV2(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateDatasetRequestV2, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.DatasetAttribute, acl.Create, r.ProjectID, u); err != nil {
		return nil, err
	}

	dataset := &dto.Dataset{
		Name:    r.Name,
		Type:    r.Type,
		Params:  r.Params,
		Schema:  r.Schema,
		Public:  r.Public,
		Managed: r.Managed,
	}

	createdDataset, err := svc.CreateDataset(ctx, dataset, r.ProjectID, r.Comment, u)
	if err != nil {
		l.Error("failed to create dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	l.Info("new dataset created with project: " + strconv.Itoa(int(createdDataset.ProjectID.Int32)))

	svc.LogDatasetChange(ctx, 0, createdDataset.ProjectID, createdDataset.ID, u.Username, r.Comment, update_log.ActionNew, update_log.DatasetUpdateLog{
		New: update_log.Dataset{
			Name:    createdDataset.Name,
			Schema:  createdDataset.Schema,
			Params:  createdDataset.Params,
			Type:    createdDataset.Type,
			Public:  createdDataset.Public,
			Managed: createdDataset.Managed,
		},
	})

	return &responses.CreateDatasetResponse{
		ID:      createdDataset.ID,
		Name:    createdDataset.Name,
		Type:    createdDataset.Type,
		Params:  createdDataset.Params,
		Schema:  createdDataset.Schema,
		Public:  createdDataset.Public,
		Managed: createdDataset.Managed,
	}, nil
}

// copyDatasetHandlerV2 godoc
//
//	@Summary	copy dataset
//	@Tags		dataset
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CopyDatasetRequestV2	true	"request body"
//	@Success	200		{object}	responses.CreateDatasetResponse
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset/copy [post]
func copyDatasetHandlerV2(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CopyDatasetRequestV2, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Dataset, acl.MetaAttribute, acl.Read, r.SrcDatasetID, u); err != nil {
		return nil, err
	}

	dataset, err := svc.GetDataset(ctx, r.SrcDatasetID)
	if err != nil {
		l.Error("failed to get dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	targetProjectID := r.ProjectID
	if targetProjectID == 0 && dataset.ProjectID.Valid {
		targetProjectID = dataset.ProjectID.Int32
	}

	if targetProjectID == 0 {
		return nil, &responses.ErrorResponse{
			ExternalMessage: "Project ID is empty",
			HTTPStatusCode:  http.StatusBadRequest,
			InternalError:   errors.New("project ID is empty"),
		}
	}

	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.DatasetAttribute, acl.Create, targetProjectID, u); err != nil {
		return nil, err
	}

	newDataset, err := svc.CopyDataset(ctx, r.SrcDatasetID, r.Name, targetProjectID, u.Username)
	if err != nil {
		l.Error("failed to copy dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	project := pgtype.Int4{Int32: targetProjectID, Valid: true}

	svc.LogDatasetChange(ctx, 0, project, newDataset.ID, u.Username, "", update_log.ActionNew, update_log.DatasetUpdateLog{
		New: update_log.Dataset{
			Name:    newDataset.Name,
			Schema:  newDataset.Schema,
			Params:  newDataset.Params,
			Type:    newDataset.Type,
			Public:  newDataset.Public,
			Managed: newDataset.Managed,
		},
	})

	return &responses.CopyDatasetResponse{
		ID:      newDataset.ID,
		Name:    newDataset.Name,
		Type:    newDataset.Type,
		Params:  newDataset.Params,
		Schema:  newDataset.Schema,
		Public:  newDataset.Public,
		Managed: newDataset.Managed,
	}, nil
}

// listDatasetsByProjectIdHandler godoc
//
//	@Summary	list datasets in project
//	@Tags		dataset
//	@Param		project_id	query	int	true	"project id"
//	@Produce	json
//	@Success	200	{object}	responses.ListDatasetsResponse
//	@Failure	403	{object}	responses.ErrorResponse				"Forbidden"
//	@Failure	404	{object}	responses.CreateAppBannerResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse				"Internal server error"
//	@Router		/api/v2/datasets [get]
func listDatasetsByProjectIdHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListDatasetsByProjectRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.DatasetAttribute, acl.Read, r.ProjectID, u); err != nil {
		return nil, err
	}

	datasets, err := svc.ListDatasetByProject(ctx, r.ProjectID)
	if err != nil {
		l.Error("failed to get datasets", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	var res responses.ListDatasetsResponse
	if datasets != nil {
		res.Datasets = *datasets
	}

	return &res, nil
}

// updateDatasetHandlerV2 godoc
//
//	@Summary	update dataset
//	@Tags		dataset
//	@Accept		json
//	@Param		request	body		requests.UpdateDatasetRequestV2	true	"request body"
//	@Success	200		{object}	responses.UpdateDatasetResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset [put]
func updateDatasetHandlerV2(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateDatasetRequestV2, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Dataset, acl.MetaAttribute, acl.Edit, r.ID, u); err != nil {
		return nil, err
	}

	dataset, err := svc.GetDataset(ctx, r.ID)
	if err != nil {
		l.Error("failed to get dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	updatedDataset := &dto.Dataset{
		ID:      r.ID,
		Name:    r.Name,
		Type:    r.Type,
		Params:  r.Params,
		Schema:  r.Schema,
		Public:  dataset.Public,
		Managed: dataset.Managed,
	}

	newDataset, err := svc.UpdateDataset(ctx, updatedDataset, r.Public, r.Managed, r.Comment, u.Username)
	if err != nil {
		l.Error("failed to update dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	// Create update log
	svc.LogDatasetChange(ctx, 0, dataset.ProjectID, dataset.ID, u.Username, r.Comment, update_log.ActionUpdate, update_log.DatasetUpdateLog{
		New: update_log.Dataset{
			Name:    newDataset.Name,
			Schema:  newDataset.Schema,
			Params:  newDataset.Params,
			Type:    newDataset.Type,
			Public:  newDataset.Public,
			Managed: newDataset.Managed,
		},
		Old: update_log.Dataset{
			Name:    dataset.Name,
			Schema:  dataset.Schema,
			Params:  dataset.Params,
			Type:    dataset.Type,
			Public:  dataset.Public,
			Managed: dataset.Managed,
		},
	})

	return &responses.UpdateDatasetResponse{
		Dataset: dto.Dataset{
			ID:      newDataset.ID,
			Name:    newDataset.Name,
			Schema:  newDataset.Schema,
			Params:  newDataset.Params,
			Type:    newDataset.Type,
			Public:  newDataset.Public,
			Managed: newDataset.Managed,
		},
	}, nil
}

// searchDatasetsPostHandler godoc
//
//	@Summary	search datasets with filters
//	@Tags		dataset
//	@Param		request	body		requests.SearchDatasetsRequest	true	"request body"
//	@Success	200		{object}	responses.SearchDatasetsResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/datasets/search [post]
func searchDatasetsPostHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.SearchDatasetsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {

	datasets, err := svc.SearchDatasets(ctx, dbcore.SelectDatasetsParams{
		Limit:      r.Limit,
		Offset:     *r.Offset,
		Search:     r.Search,
		Project:    r.ProjectID,
		Namespace:  r.NamespaceID,
		Cluster:    r.Cluster,
		Path:       r.Path,
		Public:     r.Public,
		Managed:    r.Managed,
		OrderBy:    r.OrderBy,
		Type:       r.Type,
		ExactMatch: r.ExactMatch,
	})

	var total int64

	if err != nil {
		l.Error("failed to get datasets", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	var res responses.SearchDatasetsResponse
	for _, ds := range datasets {
		total = ds.Total

		rights, err := svc.GetDatasetRights(ctx, u, ds.ID)
		if err != nil {
			l.Error("failed to get dataset rights", err)
		}

		res.Datasets = append(res.Datasets, dto.DatasetInfo{
			ID:      ds.ID,
			Name:    ds.Name,
			Type:    ds.Type,
			Public:  ds.Public,
			Managed: ds.Managed,
			NamespaceInfo: dto.Namespace{
				ID:   ds.NamespaceID.Int32,
				Name: ds.NamespaceName.String,
			},
			ProjectInfo: dto.ProjectCatalogInfo{
				ID:            ds.ProjectID.Int32,
				Name:          ds.ProjectName.String,
				NamespaceID:   ds.NamespaceID.Int32,
				NamespaceName: ds.NamespaceName.String,
			},
			UpdatedAt:            ds.UpdatedAt.Time,
			CreatedAt:            ds.CreatedAt.Time,
			Rights:               rights,
			LinkedExperimentsCount: ds.LinkedExperimentCount,
		})
	}
	res.Total = total
	res.Pages = shared.GetPages(total, int64(r.Limit))

	return &res, nil
}

// getDatasetLinkedExperimentsHandler godoc
//
//	@Summary	get dataset linked experiments
//	@Tags		dataset
//	@Param		dataset_id	query	int	true	"dataset id"
//	@Param		limit			query	int	true	"limit"
//	@Param		offset			query	int	true	"offset"
//	@Produce	json
//	@Success	200	{object}	responses.DatasetExperimentLinksResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset/links [get]
func getDatasetLinkedExperimentsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetDatasetLinkedExperimentsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Dataset, acl.MetaAttribute, acl.Read, r.DatasetID, u); err != nil {
		return nil, err
	}

	list, total, err := svc.GetDatasetLinkedExperiments(ctx, r.DatasetID, r.Limit, *r.Offset)
	if err != nil {
		l.Error("failed to get linked experiments", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	response := responses.DatasetExperimentLinksResponse{
		Links: list,
		Total: total,
		Pages: shared.GetPages(total, int64(r.Limit)),
	}

	return response, nil
}

// getDatasetV2Handler godoc
//
//	@Summary	get dataset by id
//	@Tags		dataset
//	@Param		dataset_id	query	int	true	"dataset id"
//	@Produce	json
//	@Success	200	{object}	responses.GetDatasetV2Response
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset [get]
func getDatasetV2Handler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetDatasetRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Dataset, acl.MetaAttribute, acl.Read, r.DatasetID, u); err != nil {
		return nil, err
	}

	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user from database", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}

	dataset, projectName, projectID, err := svc.GetDatasetWithProjectInfo(ctx, r.DatasetID, userID)
	if err != nil {
		l.Error("failed to get dataset with project info", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	rights, err := svc.GetDatasetRights(ctx, u, r.DatasetID)
	if err != nil {
		l.Error("failed to get rights of the dataset", err)
	}

	response := responses.GetDatasetV2Response{
		ID:          dataset.ID,
		Name:        dataset.Name,
		Type:        dataset.Type,
		Params:      dataset.Params,
		Schema:      dataset.Schema,
		Public:      dataset.Public,
		Managed:     dataset.Managed,
		ProjectName: projectName,
		ProjectID:   projectID,
		Rights:      rights,
	}

	return response, nil
}

// getDatasetYtURLHandler godoc
//
//	@Summary	get dataset yt link
//	@Tags		dataset
//	@Accept		json
//	@Produce	json
//	@Param		dataset_id	query		int						true	"dataset id"
//	@Failure	400				{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401				{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403				{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404				{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500				{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/dataset/yt [get]
func getDatasetYtURLHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetDatasetYTLinkRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Dataset, acl.MetaAttribute, acl.Read, r.DatasetID, u); err != nil {
		return nil, err
	}

	ytURL, err := svc.GetDatasetYTURL(ctx, r.DatasetID)
	if err != nil {
		l.Error("failed to get dataset YT URL", err)
		return responses.GetDatasetYTLinkResponse{
			YTLink: "https://yt.vk.team",
		}, nil
	}

	return responses.GetDatasetYTLinkResponse{
		YTLink: ytURL,
	}, nil
}

// deleteDatasetHandler godoc
//
//	@Summary	delete dataset
//	@Tags		dataset
//	@Accept		json
//	@Param		request	body	requests.DeleteDatasetRequest	true	"request body"
//	@Success	200
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/dataset [delete]
func deleteDatasetHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteDatasetRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Dataset, acl.NoAttribute, acl.Delete, r.ID, u); err != nil {
		return nil, err
	}

	dataset, err := svc.GetDataset(ctx, r.ID)
	if err != nil {
		l.Error("failed to get dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	err = svc.DeleteDataset(ctx, r.ID)
	if err != nil {
		l.Error("failed to delete dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	// Create update log
	svc.LogDatasetChange(ctx, 0, dataset.ProjectID, dataset.ID, u.Username, "", update_log.ActionDelete, update_log.DatasetUpdateLog{
		Old: update_log.Dataset{
			Name:    dataset.Name,
			Schema:  dataset.Schema,
			Params:  dataset.Params,
			Type:    dataset.Type,
			Public:  dataset.Public,
			Managed: dataset.Managed,
		},
	})

	return nil, nil
}

// applyDatasetHandler godoc
//
//	@Summary	apply dataset (uses jobd)
//	@Tags		dataset
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ApplyDatasetRequest	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Failure	503		{object}	responses.ErrorResponse	"Service Unavailable"
//	@Router		/api/v1/dataset/apply [post]
func applyDatasetHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ApplyDatasetRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Dataset, acl.MetaAttribute, acl.Edit, r.DatasetID, u); err != nil {
		return nil, err
	}

	dataset, err := svc.GetDataset(ctx, r.DatasetID)
	if err != nil {
		l.Error("failed to get dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
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

	jobName := fmt.Sprintf("apply-dataset-%d", r.DatasetID)
	jobConfig := map[string]interface{}{
		"dataset_id": r.DatasetID,
	}

	entity := &clients.LinkedEntity{
		Type: "dataset",
		Id:   int64(r.DatasetID),
	}

	desc := fmt.Sprintf("Apply dataset %d", r.DatasetID)
	execTarget := "orchestrator"
	tags := []string{"dataset", "apply"}

	stepDesc := "Apply dataset configuration"
	stepOrder := int32(0)
	stepConfig := map[string]interface{}{
		"type":          "apply_dataset",
		"dataset_id": fmt.Sprintf("%d", r.DatasetID),
	}
	steps := []clients.CreateStep{
		{
			Name:        "apply_dataset",
			Description: &stepDesc,
			Order:       &stepOrder,
			Config:      &stepConfig,
		},
	}

	createJobReq := clients.CreateJobRequest{
		Name:            jobName,
		Description:     &desc,
		Type:            "dataset_apply",
		ExecutionTarget: &execTarget,
		Config:          &jobConfig,
		Entity:          entity,
		Tags:            &tags,
		Steps:           &steps,
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

	var jobID *int64
	if jobResp.Job != nil && jobResp.Job.Id != nil {
		jobID = jobResp.Job.Id
	}
	if jobID != nil {
		l.Info(fmt.Sprintf("Job created in jobd: job_id=%d, dataset_id=%d", *jobID, r.DatasetID))
	} else {
		l.Info(fmt.Sprintf("Job created in jobd: job_id=<nil>, dataset_id=%d", r.DatasetID))
	}

	svc.LogDatasetChange(ctx, 0, dataset.ProjectID, r.DatasetID, u.Username, r.Comment, update_log.ActionApplyExperiment, update_log.DatasetUpdateLog{
		New: update_log.Dataset{
			Name:  dataset.Name,
			JobID: jobID,
		},
	})

	return responses.EmptyResponse{}, nil
}
