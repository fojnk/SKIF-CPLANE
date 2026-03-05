package public

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	models "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/validation"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

// ExperimentStartHandler godoc
//
//	@Summary	start experiment
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ExperimentStartRequest	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Router		/api/v1/experiment/start [put]
func ExperimentStartHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ExperimentStartRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.ExperimentStateStartAttribute, acl.Edit, r.ExperimentID, u); err != nil {
		return nil, err
	}

	// Get experiment to check quota
	experiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	if res := shared.CheckExperimentQuota(ctx, svc, l, experiment.Config, experiment.ID); res != nil {
		return nil, res
	}

	err = svc.StartExperiment(ctx, r.ExperimentID, u.Username)
	if err != nil {
		l.Error("failed to start experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	projectID, err := svc.GetExperimentProjectID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment project", err)
	} else {
		svc.LogExperimentChange(ctx, projectID, r.ExperimentID, u.Username, r.Comment, update_log.ActionStartExperiment, update_log.ExperimentUpdateLog{})
	}

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
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ExperimentStopRequest	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Router		/api/v1/experiment/stop [put]
func ExperimentStopHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ExperimentStopRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.ExperimentStateStopAttribute, acl.Edit, r.ExperimentID, u); err != nil {
		return nil, err
	}

	if err := svc.StopExperiment(ctx, r.ExperimentID, u.Username); err != nil {
		l.Error("failed to stop experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	lExperiment, err := svc.Repo.DB.SelectExperiment(ctx, r.ExperimentID)
	if err != nil {
		return nil, shared.ConvertServiceError(serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment), shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, lExperiment.ProjectID, r.ExperimentID, u.Username, r.Comment, update_log.ActionStopExperiment, update_log.ExperimentUpdateLog{})

	return responses.EmptyResponse{}, nil
}

// ExperimentStatusHandler godoc
//
//	@Summary	get experiment status
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int	true	"experiment id"
//	@Success	200			{object}	responses.ExperimentStatusResponse
//	@Router		/api/v1/experiment/status [get]
func ExperimentStatusHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ExperimentStatusRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.ExperimentStateAttribute, acl.Read, r.ExperimentID, u); err != nil {
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
//	@Router		/api/v1/experiment/config/apply [put]
func applyExperimentConfigHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ApplyExperimentConfigRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.ExperimentStateApplyAttribute, acl.Edit, r.ExperimentID, u); err != nil {
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

	svc.LogExperimentChange(ctx, experiment.ProjectID, r.ExperimentID, u.Username, r.Comment, update_log.ActionApplyExperiment, update_log.ExperimentUpdateLog{
		New: update_log.Experiment{
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
//	@Router		/api/v2/experiment/config/validate [post]
func validateExperimentConfigHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CompleteExperimentValidateRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if r.ExperimentID != 0 {

		experimentData, err := svc.Repo.DB.CompleteExperimentInfo(ctx, r.ExperimentID)
		if err != nil {
			l.Error("failed to complete experiment info", err)
			return responses.ValidationResponse{
				Success: false,
				Errors:  fmt.Sprintf("Не удалось получить информацию о пайплайне: %v", err),
			}, nil
		}

		experimentData.ExperimentConfig = pgtype.Text{String: r.ExperimentConfig, Valid: true}

		cfg, err := orch.ExperimentInfoToOrchestratorConfig(l, &experimentData)
		if err != nil {
			l.Error("failed to convert experiment info to orchestrator config", err)
			return responses.ValidationResponse{
				Success: false,
				Errors:  fmt.Sprintf("Не удалось преобразовать в конфиг оркестратора: %v", err),
			}, nil
		}

		errResp := shared.VariableExperimentValidation(ctx, svc, l, experimentData.ExperimentConfig.String, r.ExperimentID)
		if errResp != nil {
			l.Error("failed on variable validation", err)
			return responses.ValidationResponse{
				Success: false,
				Errors:  fmt.Sprintf("Ошибка валидации переменных: %v", errResp),
			}, nil
		}

		cfgJSON, err := json.Marshal(cfg)
		if err != nil {
			l.Error("failed to marshal orchestrator config to JSON", err)
			return responses.ValidationResponse{
				Success: false,
				Errors:  fmt.Sprintf("failed to marshal experiment config: %v", err),
			}, nil
		}
		err = validation.ExperimentSyntaxConfigValidation(string(cfgJSON))
		if err != nil {
			return responses.ValidationResponse{
				Success: false,
				Errors:  fmt.Sprintf("Ошибка во время синтаксической валидации конфига: %v", err),
			}, nil
		}

		var cfgMap map[string]interface{}
		err = json.Unmarshal(cfgJSON, &cfgMap)
		if err != nil {
			l.Error("failed to unmarshal orchestrator config to JSON", err)
			return responses.ValidationResponse{
				Success: false,
				Errors:  fmt.Sprintf("failed to unmarshal experiment config: %v", err),
			}, nil
		}
	} else {
		err := validation.ExperimentSyntaxConfigValidation(r.ExperimentConfig)
		if err != nil {
			return responses.ValidationResponse{
				Success: false,
				Errors:  fmt.Sprintf("Ошибка во время синтаксической валидации конфига: %v", err),
			}, nil
		}
	}

	return responses.ValidationResponse{
		Success: true,
	}, nil
}

// createCompleteExperimentHandler godoc
//
//	@Summary	create experiment
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CreateCompleteExperimentRequest	true	"request body"
//	@Success	200		{object}	responses.CreateCompleteExperimentResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	409		{object}	responses.ErrorResponse	"Conflict - resource already exists"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment [post]
func createCompleteExperimentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateCompleteExperimentRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.ExperimentAttribute, acl.Create, r.ProjectID, u); err != nil {
		return nil, err
	}

	experiment, err := svc.CreateExperiment(ctx, r.Name, r.Description, r.ProjectID)
	if err != nil {
		l.Error("failed to create experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, r.ProjectID, experiment.ID, u.Username, r.Comment, update_log.ActionNew, update_log.ExperimentUpdateLog{
		New: update_log.Experiment{
			Name:        r.Name,
			Config:      "{}",
			Description: r.Description,
		},
	})

	return &responses.CreateCompleteExperimentResponse{CompleteExperiment: *experiment}, nil
}

// deleteExperimentHandler godoc
//
//	@Summary	delete experiment
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Param		request	body	requests.DeleteCompleteExperimentRequest	true	"request body"
//	@Success	200
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment [delete]
func deleteCompleteExperimentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteCompleteExperimentRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Delete, r.ID, u); err != nil {
		return nil, err
	}

	// Get experiment info for logging before deletion
	experiment, err := svc.GetExperimentByID(ctx, r.ID)
	if err != nil {
		l.Error("failed to get experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	projectID, err := svc.GetExperimentProjectID(ctx, r.ID)
	if err != nil {
		l.Error("failed to get experiment project", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	if err := svc.DeleteExperiment(ctx, r.ID); err != nil {
		l.Error("failed to delete experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, projectID, r.ID, u.Username, "", update_log.ActionDelete, update_log.ExperimentUpdateLog{
		Old: update_log.Experiment{
			Name:        experiment.Name,
			Config:      experiment.Config,
			Description: experiment.Description,
		},
	})

	return nil, nil
}

// updateCompleteExperimentHandler godoc
//
//	@Summary	update experiment
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Param		request	body		requests.UpdateCompleteExperimentRequest	true	"request body"
//	@Success	200		{object}	responses.UpdateCompleteExperimentResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment [put]
func updateCompleteExperimentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateCompleteExperimentRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Edit, r.ExperimentID, u); err != nil {
		return nil, err
	}

	oldExperiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get old experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	if r.Config != "" && !r.DisableValidation {
		experimentData, err := svc.Repo.DB.CompleteExperimentInfo(ctx, r.ExperimentID)
		if err != nil {
			l.Error("failed to complete experiment info", err)
			return nil, shared.ConvertServiceError(serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment), shared.EntityCompliteExperimentInfo)
		}

		experimentData.ExperimentConfig = pgtype.Text{String: r.Config, Valid: true}

		cfg, err := orch.ExperimentInfoToOrchestratorConfig(l, &experimentData)
		if err != nil {
			l.Error("failed to convert experiment info to orchestrator config", err)
			return nil, &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "Не удалось преобразовать в конфиг оркестратора: " + err.Error(),
				HTTPStatusCode:  http.StatusInternalServerError,
			}
		}

		configJSON, err := json.Marshal(cfg)
		if err != nil {
			l.Error("failed to marshal orchestrator config", err)
			return nil, &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: fmt.Sprintf("Не удалось собрать конфиг оркестратора: %s", err.Error()),
				HTTPStatusCode:  http.StatusInternalServerError,
			}
		}

		errResp := shared.VariableExperimentValidation(ctx, svc, l, r.Config, r.ExperimentID)
		if errResp != nil {
			return nil, errResp
		}

		err = validation.ExperimentSyntaxConfigValidation(string(configJSON))
		if err != nil {
			return nil, &responses.ErrorResponse{
				ExternalMessage: "Ошибка во время синтаксической валидации: " + err.Error(),
				HTTPStatusCode:  http.StatusBadRequest,
				InternalError:   err,
			}
		}
	}

	// Update experiment through service
	updatedExperiment, err := svc.UpdateExperimentWithValidation(ctx, r.ExperimentID, r.Name, r.Description, r.Config, r.Comment, u.Username, r.AdditionalInformation, r.DisableValidation)
	if err != nil {
		l.Error("failed to update experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	// Get project ID for logging
	projectID := oldExperiment.ProjectID
	if projectID == 0 {
		// If projectID is not available, get it from service
		projectID, err = svc.GetExperimentProjectID(ctx, r.ExperimentID)
		if err != nil {
			l.Error("failed to get project id for logging", err)
			// Use updatedExperiment projectID as fallback
			projectID = updatedExperiment.ProjectID
		}
	}

	svc.LogExperimentChange(ctx, oldExperiment.ProjectID, r.ExperimentID, u.Username, r.Comment, update_log.ActionUpdate, update_log.ExperimentUpdateLog{
		New: update_log.Experiment{
			Name:        updatedExperiment.Name,
			Config:      updatedExperiment.Config,
			Description: updatedExperiment.Description,
		},
		Old: update_log.Experiment{
			Name:        oldExperiment.Name,
			Config:      oldExperiment.Config,
			Description: oldExperiment.Description,
		},
	})

	return &responses.UpdateCompleteExperimentResponse{
		CompleteExperiment: *updatedExperiment,
	}, nil
}

// listCompleteExperimentsHandler godoc
//
//	@Summary	list experiments in project
//	@Security	BearerAuth
//	@Tags		experiment
//	@Param		project_id	query	int	true	"project id"
//	@Produce	json
//	@Success	200	{object}	responses.ListCompleteExperimentsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiments [get]
func listCompleteExperimentsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListCompleteExperimentsRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.ExperimentAttribute, acl.Read, r.ProjectID, u); err != nil {
		return nil, err
	}

	// Get experiments from service
	experiments, err := svc.GetExperimentsInProject(ctx, r.ProjectID)
	if err != nil {
		l.Error("failed to get experiments in project", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	if experiments == nil {
		return &responses.ListCompleteExperimentsResponse{
			Experiments: []dto.CompleteExperimentList{},
		}, nil
	}

	var res responses.ListCompleteExperimentsResponse
	for _, experiment := range *experiments {
		res.Experiments = append(res.Experiments, dto.CompleteExperimentList{
			ID:     experiment.ID,
			Name:   experiment.Name,
			Status: experiment.Status,
		})
	}

	return &res, nil
}

// getCompleteExperimentHandler godoc
//
//	@Summary	get experiment info
//	@Security	BearerAuth
//	@Tags		experiment
//	@Param		experiment_id	query	int	true	"experiment_id"
//	@Produce	json
//	@Success	200	{object}	responses.GetCompleteExperimentsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment [get]
func getCompleteExperimentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetCompleteExperimentRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Read, r.ExperimentID, u); err != nil {
		return nil, err
	}

	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user from database", err)
		userID = 0
	}

	completeExperiment, projectName, err := svc.GetCompleteExperiment(ctx, r.ExperimentID, userID)
	if err != nil {
		l.Error("failed to get complete experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	rights, err := svc.GetExperimentRights(ctx, u, r.ExperimentID)
	if err != nil {
		l.Error("failed to get rights of the experiment", err)
		l.Error("failed to get experiment rights", err)
	}

	return &responses.GetCompleteExperimentsResponse{
		CompleteExperiment: dto.CompleteExperiment{
			ID:          completeExperiment.ID,
			Name:        completeExperiment.Name,
			Config:      completeExperiment.Config,
			ProjectID:   completeExperiment.ProjectID,
			ProjectName: projectName,
		},
		Rights: rights,
	}, nil
}
