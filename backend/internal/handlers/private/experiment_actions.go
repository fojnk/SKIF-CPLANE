package private

import (
	"context"
	"net/http"

	"github.com/pkg/errors"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	models "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

// ExperimentStartHandler godoc
//
//	@Summary	start experiment
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ExperimentStartRequest	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/start [put]
func ExperimentStartHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ExperimentStartRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeExperimentStateStart, service.ACLActionEdit, r.ExperimentID, u); err != nil {
		return nil, err
	}

	experiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	if res := shared.CheckExperimentQuota(ctx, svc, l, experiment.Config, experiment.ID); res != nil {
		return nil, res
	}

	if err := svc.StartExperiment(ctx, r.ExperimentID, u.Username); err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, experiment.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionStartExperiment, service.ExperimentUpdateLog{})

	return responses.EmptyResponse{}, nil
}

// ExperimentCheckUpdateConfigHandler godoc
//
//	@Summary	start experiment
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int	true	"experiment id"
//	@Success	200			{object}	responses.CheckExperimentUpdateResponse
//	@Failure	400			{object}	responses.ErrorResponse				"Bad Request"
//	@Failure	401			{object}	responses.ErrorResponse				"Unauthorized"
//	@Failure	404			{object}	responses.CreateAppBannerResponse	"Not Found"
//	@Failure	500			{object}	responses.ErrorResponse				"Internal server error"
//	@Router		/api/v1/experiment/updates [get]
func ExperimentCheckUpdateConfigHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ExperimentCheckUpdateRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	changed, appliedConfig, savedConfig, err := svc.CheckExperimentConfigUpdates(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to check experiment config updates", err)
	}

	return &responses.CheckExperimentUpdateResponse{
		HasNotAppliedChanges: changed,
		AppliedConfig:        appliedConfig,
		SavedConfig:          savedConfig,
	}, nil
}

// ExperimentStopHandler godoc
//
//	@Summary	stop experiment
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ExperimentStopRequest	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/stop [put]
func ExperimentStopHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ExperimentStopRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeExperimentStateStop, service.ACLActionEdit, r.ExperimentID, u); err != nil {
		return nil, err
	}

	experiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	if err := svc.StopExperiment(ctx, r.ExperimentID, u.Username); err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, experiment.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionStopExperiment, service.ExperimentUpdateLog{})

	return responses.EmptyResponse{}, nil
}

// ExperimentStatusHandler godoc
//
//	@Summary	get experiment status
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int	true	"experiment id"
//	@Success	200			{object}	responses.ExperimentStatusResponse
//	@Failure	400			{object}	responses.ErrorResponse				"Bad Request"
//	@Failure	401			{object}	responses.ErrorResponse				"Unauthorized"
//	@Failure	403			{object}	responses.ErrorResponse				"Forbidden"
//	@Failure	404			{object}	responses.CreateAppBannerResponse	"Not Found"
//	@Failure	500			{object}	responses.ErrorResponse				"Internal server error"
//	@Router		/api/v1/experiment/status [get]
func ExperimentStatusHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ExperimentStatusRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeExperimentState, service.ACLActionRead, r.ExperimentID, u); err != nil {
		return nil, err
	}

	experiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	orchID, err := svc.GetExperimentOrchID(ctx, experiment.ID)
	if err != nil {
		l.Error("failed to get experiment orchestrator ID", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	return svc.GetExperimentStatus(ctx, orchID), nil
}

// applyExperimentConfigHandler godoc
//
//	@Summary	apply experiment config
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ApplyExperimentConfigRequest	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/config/apply [put]
func applyExperimentConfigHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ApplyExperimentConfigRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
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

	errResp := shared.VariableExperimentValidation(ctx, svc, l, experiment.Config, r.ExperimentID)
	if errResp != nil {
		return nil, errResp
	}

	if _, err := svc.ApplyExperimentConfig(ctx, r.ExperimentID); err != nil {
		l.Error("failed to apply experiment config", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, experiment.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionApplyExperiment, service.ExperimentUpdateLog{
		New: service.ExperimentUpdateLogEntity{
			JobID: nil,
		},
	})

	return responses.EmptyResponse{}, nil
}

// validateExperimentConfigHandler godoc
//
//	@Summary	validate experiment config
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CompleteExperimentValidateRequest	true	"request body"
//	@Success	200		{object}	responses.ValidationResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/config/validate [post]
func validateExperimentConfigHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CompleteExperimentValidateRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := svc.ValidateExperimentConfig(ctx, r.ExperimentConfig, r.ExperimentID); err != nil {
		l.Error("failed to validate experiment config", err)
		message := err.Error()
		if resp := serviceerrors.ToErrorResponse(err); resp != nil {
			message = resp.ExternalMessage
		}
		return responses.ValidationResponse{
			Success: false,
			Errors:  message,
		}, nil
	}

	return responses.ValidationResponse{Success: true}, nil
}

// validateExperimentFastHandler godoc
//
//	@Summary	validate experiment config fast
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ExperimentValidateFastRequest	true	"request body"
//	@Success	200		{object}	dto.ValidationResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/validations/fast [post]
func validateExperimentFastHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ExperimentValidateFastRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if r.ExperimentID != 0 {
		if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeMeta, service.ACLActionRead, r.ExperimentID, u); err != nil {
			return nil, err
		}

		errResp := shared.VariableExperimentValidation(ctx, svc, l, r.ExperimentConfig, r.ExperimentID)
		if errResp != nil {
			return nil, errResp
		}
	}

	config, err := svc.GetExperimentConfigMap(ctx, r.ExperimentID, r.ExperimentConfig)
	if err != nil {
		l.Error("failed to get experiment config", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	result, err := svc.ValidateExperimentFast(ctx, config, true)
	if err != nil {
		l.Error("failed to validate experiment (fast)", err)
		if resp := serviceerrors.ToErrorResponse(err); resp != nil {
			return nil, resp
		}
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Не удалось выполнить валидацию",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	return result, nil
}

// validateExperimentRunHandler godoc
//
//	@Summary	validate experiment config with run
//	@Description	Validates experiment configuration and runs it with provided datasets. Returns validation results with run outputs.
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ExperimentValidateRunRequest	true	"request body"
//	@Success	200		{object}	dto.ValidationResponseWithRun
//	@Failure	400		{object}	dto.ValidationErrorResponse	"Bad Request"
//	@Failure	401		{object}	dto.ValidationErrorResponse	"Unauthorized"
//	@Failure	403		{object}	dto.ValidationErrorResponse	"Forbidden"
//	@Failure	404		{object}	dto.ValidationErrorResponse	"Not Found"
//	@Failure	500		{object}	dto.ValidationErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/validations/run [post]
func validateExperimentRunHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ExperimentValidateRunRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if r.ExperimentID != 0 {
		if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeMeta, service.ACLActionRead, r.ExperimentID, u); err != nil {
			return nil, err
		}

		errResp := shared.VariableExperimentValidation(ctx, svc, l, r.ExperimentConfig, r.ExperimentID)
		if errResp != nil {
			return nil, errResp
		}
	}

	config, err := svc.GetExperimentConfigMap(ctx, r.ExperimentID, r.ExperimentConfig)
	if err != nil {
		l.Error("failed to get experiment config", err)
		if resp := serviceerrors.ToErrorResponse(err); resp != nil {
			return &dto.ValidationResponseWithRun{
				ExperimentIsValid: false,
				Errors:          []string{resp.ExternalMessage},
				Logs:            []string{},
				RunResult:       dto.RunResults{},
			}, nil
		}
		return &dto.ValidationResponseWithRun{
			ExperimentIsValid: false,
			Errors:          []string{"Не удалось получить конфигурацию пайплайна"},
			Logs:            []string{},
			RunResult:       dto.RunResults{},
		}, nil
	}

	dataSets := shared.ConvertDataSetsToDTO(r.DataSets)

	result, err := svc.ValidateExperimentRun(ctx, config, true, dataSets, r.ShouldReadYtSample)
	if err != nil {
		l.Error("failed to validate experiment (run)", err)

		errorMsg := "Не удалось выполнить валидацию"
		if resp := serviceerrors.ToErrorResponse(err); resp != nil {
			errorMsg = resp.ExternalMessage
		}

		return &dto.ValidationResponseWithRun{
			ExperimentIsValid: false,
			Errors:          []string{errorMsg},
			Logs:            []string{},
			RunResult:       dto.RunResults{},
		}, nil
	}

	return result, nil
}

// addDatasetToExperimentHandler godoc
//
//	@Summary	add dataset to experiment
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
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeDataset, service.ACLActionCreate, r.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on add dataset to experiment")
	}

	dataset, err := svc.GetDataset(ctx, r.DatasetID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	projectID, err := svc.GetExperimentProjectID(ctx, r.ExperimentID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	var dsProjectID int32 = 0
	dsProjectName := ""

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

	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user from database", err)
	}

	project, err := svc.GetProjectInfo(ctx, userID, dataset.ProjectID.Int32)
	if err != nil {
		l.Error("failed to select dataset project", err)
	} else {
		dsProjectName = project.Name
		dsProjectID = project.ID
	}

	linkID, err := svc.InsertExperimentDatasetLink(ctx, r.ExperimentID, r.DatasetID, r.Alias)
	if err != nil {
		l.Error("failed to add dataset to experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	lExperiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to select experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, lExperiment.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionNewDatasetLink, service.ExperimentUpdateLog{
		New: service.ExperimentUpdateLogEntity{
			DatasetID:    r.DatasetID,
			DatasetAlias: r.Alias,
		},
	})

	return responses.AddDatasetToExperimentResponse{
		LinkID:       linkID,
		Alias:        r.Alias,
		DatasetID: r.DatasetID,
		Name:         dataset.Name,
		ProjectID:    dsProjectID,
		ProjectName:  dsProjectName,
	}, nil
}

// removeDatasetFromExperimentHandler godoc
//
//	@Summary	remove dataset from experiment
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
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeDataset, service.ACLActionDelete, r.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on remove dataset from experiment")
	}

	lExperiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to select experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	datasetID, datasetAlias, err := svc.GetDatasetFromLink(ctx, r.LinkID)
	if err != nil {
		l.Error("failed to select dataset for log", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	err = svc.DeleteExperimentDatasetByID(ctx, r.LinkID, r.ExperimentID)
	if err != nil {
		l.Error("failed to delete experiment dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	svc.LogExperimentChange(ctx, lExperiment.ProjectID, r.ExperimentID, u.Username, "", service.UpdateLogActionDeleteDatasetLink, service.ExperimentUpdateLog{
		Old: service.ExperimentUpdateLogEntity{
			DatasetID:    datasetID,
			DatasetAlias: datasetAlias,
		},
	})

	return responses.EmptyResponse{}, nil
}

// getExperimentDatasetsHandler godoc
//
//	@Summary	get experiment datasets
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int	true	"experiment id"
//	@Success	200			{object}	responses.GetExperimentDatasetsResponse
//	@Failure	400			{object}	responses.ErrorResponse				"Bad Request"
//	@Failure	401			{object}	responses.ErrorResponse				"Unauthorized"
//	@Failure	403			{object}	responses.ErrorResponse				"Forbidden"
//	@Failure	404			{object}	responses.CreateAppBannerResponse	"Not Found"
//	@Failure	500			{object}	responses.ErrorResponse				"Internal server error"
//	@Router		/api/v1/experiment/datasets [get]
func getExperimentDatasetsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentDatasetsRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeDataset, service.ACLActionRead, r.ExperimentID, u); err != nil {
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

// getExperimentAvailableDatasetsToLinkHandler godoc
//
//	@Summary	get experiment datasets available to link
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
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeDataset, service.ACLActionRead, r.ExperimentID, u); err != nil {
		return nil, err
	}

	availableToLink := true

	projectDatasets, total, err := svc.GetExperimentAvailableDatasets(ctx, r.ExperimentID, dbcore.SelectDatasetsParams{
		Limit:           r.Limit,
		Offset:          *r.Offset,
		Search:          r.Filters.Search,
		Project:         r.Filters.ProjectID,
		Namespace:       r.Filters.NamespaceID,
		Cluster:         r.Filters.Cluster,
		Path:            r.Filters.Path,
		Public:          r.Filters.Public,
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
	res.Datasets = projectDatasets

	return &res, nil
}

// updateExperimentDatasetHandler godoc
//
//	@Summary	update experiment dataset link
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
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeDataset, service.ACLActionEdit, r.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on update experiment dataset link")
	}

	oldDatasetID, oldDatasetAlias, err := svc.GetDatasetFromLink(ctx, r.LinkID)
	if err != nil {
		l.Error("failed to select dataset for update experiment dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	err = svc.UpdateExperimentDatasetAlias(ctx, r.LinkID, r.ExperimentID, r.Alias)
	if err != nil {
		l.Error("failed to update experiment dataset link", err)
		return nil, shared.ConvertServiceError(err, shared.EntityDataset)
	}

	lExperiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to select experiment for update experiment dataset", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	// After update, prepare the new values for logging
	newDatasetID, newDatasetAlias := oldDatasetID, r.Alias

	svc.LogExperimentChange(ctx, lExperiment.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionUpdateDatasetLink, service.ExperimentUpdateLog{
		Old: service.ExperimentUpdateLogEntity{
			DatasetID:    oldDatasetID,
			DatasetAlias: oldDatasetAlias,
		},
		New: service.ExperimentUpdateLogEntity{
			DatasetID:    newDatasetID,
			DatasetAlias: newDatasetAlias,
		},
	})

	return responses.UpdateExperimentDatasetResponse{
		LinkID: r.LinkID,
		Alias:  r.Alias,
	}, nil
}

// getExperimentURLsHandler godoc
//
//	@Summary	get experiment urls
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int	true	"experiment id"
//	@Success	200			{object}	responses.GetExperimentURLsResponse
//	@Failure	400			{object}	responses.ErrorResponse				"Bad Request"
//	@Failure	401			{object}	responses.ErrorResponse				"Unauthorized"
//	@Failure	403			{object}	responses.ErrorResponse				"Forbidden"
//	@Failure	404			{object}	responses.CreateAppBannerResponse	"Not Found"
//	@Failure	500			{object}	responses.ErrorResponse				"Internal server error"
//	@Router		/api/v1/experiment/urls [get]
func getExperimentURLsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentURLsRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeNone, service.ACLActionRead, r.ExperimentID, u); err != nil {
		return nil, err
	}

	urls, err := svc.GetExperimentURLs(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment urls", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	return responses.GetExperimentURLsResponse{URLs: urls}, nil
}

// getExperimentGrafanaURLHandler godoc
//
//	@Summary	get experiment grafana url
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int	true	"experiment id"
//	@Success	200			{object}	dto.ExperimentURL
//	@Failure	400			{object}	responses.ErrorResponse				"Bad Request"
//	@Failure	401			{object}	responses.ErrorResponse				"Unauthorized"
//	@Failure	403			{object}	responses.ErrorResponse				"Forbidden"
//	@Failure	404			{object}	responses.CreateAppBannerResponse	"Not Found"
//	@Failure	500			{object}	responses.ErrorResponse				"Internal server error"
//	@Router		/api/v1/experiment/grafana_url [get]
func getExperimentGrafanaURLHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentGrafanaURLRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeNone, service.ACLActionRead, r.ExperimentID, u); err != nil {
		return nil, err
	}

	grafanaURL, err := svc.GetExperimentGrafanaURL(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment grafana url", err)
		return nil, nil
	}

	if grafanaURL == nil {
		return nil, nil
	}

	return *grafanaURL, nil
}

// updateExperimentVariableHandler godoc
//
//	@Summary	update experiment variable
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.UpdateExperimentVariableRequest	true	"request body"
//	@Success	200		{object}	responses.UpdateExperimentVariableResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/variable [put]
func updateExperimentVariableHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateExperimentVariableRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	variable, err := svc.GetExperimentVariable(ctx, r.Variable.ID)
	if err != nil {
		l.Error("failed to select variable variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeMeta, service.ACLActionEdit, variable.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on update experiment variables")
	}

	if variable.Name != r.Variable.Name {
		err = svc.UpdateExperimentVariableName(ctx, r.Variable.ID, r.Variable.Name)

		if err != nil {
			l.Error("failed to update variable variable", err)
			return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
		}
	}

	if variable.Type != r.Variable.Type || variable.Value != r.Variable.Value {

		value := variable.Value
		if r.Variable.Value != "" {
			value = r.Variable.Value
		}

		typeVal := variable.Type
		if r.Variable.Type != "" {
			typeVal = r.Variable.Type
		}

		err = svc.InsertExperimentVariableVersionAndSetCurrentWithMeta(ctx, variable.ID, value, typeVal, r.Comment, u.Username)
		if err != nil {
			l.Error("failed to insert variable version", err)
			return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
		}
	}

	newVariable, err := svc.GetExperimentVariable(ctx, r.Variable.ID)
	if err != nil {
		l.Error("failed to select variable variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	experiment, err := svc.GetExperimentByID(ctx, variable.ExperimentID)
	if err != nil {
		l.Error("failed to select variable experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, experiment.ProjectID, variable.ExperimentID, u.Username, r.Comment, service.UpdateLogActionUpdateVariable, service.ExperimentUpdateLog{
		Old: service.ExperimentUpdateLogEntity{
			VariableName:  variable.Name,
			VariableValue: variable.Value,
			VariableType:  variable.Type,
		},
		New: service.ExperimentUpdateLogEntity{
			VariableName:  newVariable.Name,
			VariableValue: newVariable.Value,
			VariableType:  newVariable.Type,
		},
	})

	return responses.UpdateExperimentVariableResponse{
		Variable: dto.ExperimentVariable{
			ID:            newVariable.ID,
			Name:          newVariable.Name,
			Value:         newVariable.Value,
			Type:          newVariable.Type,
			VersionID:     newVariable.VersionID,
			VersionIDName: newVariable.VersionIDName,
		},
	}, nil
}

// getExperimentVariablesHandler godoc
//
//	@Summary	get experiment variables
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int	true	"experiment id"
//	@Success	200			{object}	responses.GetExperimentVariablesResponse
//	@Failure	400			{object}	responses.ErrorResponse				"Bad Request"
//	@Failure	401			{object}	responses.ErrorResponse				"Unauthorized"
//	@Failure	403			{object}	responses.ErrorResponse				"Forbidden"
//	@Failure	404			{object}	responses.CreateAppBannerResponse	"Not Found"
//	@Failure	500			{object}	responses.ErrorResponse				"Internal server error"
//	@Router		/api/v1/experiment/variables [get]
func getExperimentVariablesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentVariablesRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeNone, service.ACLActionRead, r.ExperimentID, u); err != nil {
		return nil, err
	}

	variables, err := svc.GetExperimentVariables(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment variables", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	return responses.GetExperimentVariablesResponse{
		Variables: variables,
	}, nil
}

// getAvailableExperimentVariableTypesHandler godoc
//
//	@Summary	get available experiment variable types
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Success	200	{object}	responses.GetAvailableExperimentVariableTypesResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/variables/types [get]
func getAvailableExperimentVariableTypesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetAvailableExperimentVariableTypesRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	return responses.GetAvailableExperimentVariableTypesResponse{
		Types: []service.ExperimentVariableType{
			service.ExperimentVariableTypeString,
			service.ExperimentVariableTypeInt,
			service.ExperimentVariableTypeJSON,
			service.ExperimentVariableTypeYQL,
			service.ExperimentVariableTypePython,
		},
	}, nil
}

// getExperimentVariableHandler godoc
//
//	@Summary	get experiment variable
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		variable_id	query		int	true	"variable id"
//	@Success	200			{object}	responses.GetExperimentVariableResponse
//	@Failure	400			{object}	responses.ErrorResponse				"Bad Request"
//	@Failure	401			{object}	responses.ErrorResponse				"Unauthorized"
//	@Failure	403			{object}	responses.ErrorResponse				"Forbidden"
//	@Failure	404			{object}	responses.CreateAppBannerResponse	"Not Found"
//	@Failure	500			{object}	responses.ErrorResponse				"Internal server error"
//	@Router		/api/v1/experiment/variable [get]
func getExperimentVariableHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentVariableRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	variable, err := svc.GetExperimentVariable(ctx, r.VariableID)
	if err != nil {
		l.Error("failed to select variable variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeNone, service.ACLActionRead, variable.ExperimentID, u); err != nil {
		return nil, err
	}

	return responses.GetExperimentVariableResponse{
		Variable: dto.ExperimentVariable{
			ID:            variable.ID,
			Name:          variable.Name,
			Value:         variable.Value,
			Type:          variable.Type,
			VersionID:     variable.VersionID,
			VersionIDName: variable.VersionIDName,
		},
	}, nil
}

// createExperimentVariableHandler godoc
//
//	@Summary	create experiment variable
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CreateExperimentVariableRequest	true	"request body"
//	@Success	200		{object}	responses.CreateExperimentVariableResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/variable [post]
func createExperimentVariableHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateExperimentVariableRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeMeta, service.ACLActionEdit, r.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on update experiment variables")
	}

	createdVariable, projectID, err := svc.CreateExperimentVariable(ctx, r.ExperimentID, r.Variable.Name, r.Variable.Value, r.Variable.Type, r.Comment, u.Username)
	if err != nil {
		l.Error("failed to create variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	svc.LogExperimentChange(ctx, projectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionNewVariable, service.ExperimentUpdateLog{
		New: service.ExperimentUpdateLogEntity{
			VariableName:  r.Variable.Name,
			VariableValue: r.Variable.Value,
			VariableType:  r.Variable.Type,
		},
	})

	return responses.CreateExperimentVariableResponse{
		Variable: *createdVariable,
	}, nil
}

// deleteExperimentVariableHandler godoc
//
//	@Summary	delete experiment variable
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.DeleteExperimentVariableRequest	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/variable [delete]
func deleteExperimentVariableHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteExperimentVariableRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	variable, err := svc.GetExperimentVariable(ctx, r.VariableID)
	if err != nil {
		l.Error("failed to select variable variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProjectVariables)
	}

	if err := shared.CheckPermission(ctx, l, svc, service.ACLObjectExperiment, service.ACLAttributeMeta, service.ACLActionEdit, variable.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on update experiment variables")
	}

	err = svc.DeleteExperimentVariableByID(ctx, r.VariableID)

	if err != nil {
		l.Error("failed to delete variable variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	experiment, err := svc.GetExperimentByID(ctx, variable.ExperimentID)
	if err != nil {
		l.Error("failed to select variable experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProjectVariables)
	}

	svc.LogExperimentChange(ctx, experiment.ProjectID, variable.ExperimentID, u.Username, "", service.UpdateLogActionDeleteVariable, service.ExperimentUpdateLog{
		Old: service.ExperimentUpdateLogEntity{
			VariableName:  variable.Name,
			VariableValue: variable.Value,
			VariableType:  variable.Type,
		},
	})

	return responses.EmptyResponse{}, nil
}
