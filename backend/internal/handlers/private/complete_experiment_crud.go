package private

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
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

// createCompleteExperimentHandler godoc
//
//	@Summary	create experiment
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CreateCompleteExperimentRequest	true	"request body"
//	@Success	200		{object}	responses.CreateCompleteExperimentResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment [post]
func createCompleteExperimentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateCompleteExperimentRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
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
			Name:   r.Name,
			Config: "{}",
		},
	})

	return &responses.CreateCompleteExperimentResponse{CompleteExperiment: *experiment}, nil
}

// copyCompleteExperimentHandler godoc
//
//	@Summary	copy experiment
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CopyCompleteExperimentRequest	true	"request body"
//	@Success	200		{object}	responses.CopyCompleteExperimentResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/copy [post]
func copyCompleteExperimentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CopyCompleteExperimentRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, r.SrcExperimentID, u); err != nil {
		return nil, err
	}

	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.NoAttribute, acl.Create, r.ProjectID, u); err != nil {
		return nil, err
	}

	// get source experiment to get config for variables
	srcExperiment, err := svc.GetExperimentByID(ctx, r.SrcExperimentID)
	if err != nil {
		l.Error("failed to get source experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	copiedExperiment, err := svc.CopyExperiment(ctx, r.SrcExperimentID, r.ProjectID, r.Name, r.Description, u.Username)
	if err != nil {
		l.Error("failed to copy experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, r.ProjectID, copiedExperiment.ID, u.Username, "", update_log.ActionNew, update_log.ExperimentUpdateLog{
		New: update_log.Experiment{
			Name:   r.Name,
			Config: srcExperiment.Config,
		},
	})

	// get experiment variables and log them
	variables, err := svc.GetExperimentVariables(ctx, copiedExperiment.ID)
	if err != nil {
		l.Error("failed to get experiment variables for logging", err)
	} else {
		for i := range variables {
			variable, err := svc.GetExperimentVariable(ctx, variables[i].ID)
			if err != nil {
				l.Error("failed to get experiment variable details", err)
				continue
			}
			svc.LogExperimentChange(ctx, r.ProjectID, copiedExperiment.ID, u.Username, "", update_log.ActionNewVariable, update_log.ExperimentUpdateLog{
				New: update_log.Experiment{
					VariableName:  variable.Name,
					VariableValue: variable.Value,
					VariableType:  variable.Type,
				},
			})
		}
	}

	return &responses.CopyCompleteExperimentResponse{CompleteExperiment: *copiedExperiment}, nil
}

// deleteExperimentHandler godoc
//
//	@Summary	delete experiment
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
func deleteCompleteExperimentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteCompleteExperimentRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
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
func updateCompleteExperimentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateCompleteExperimentRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Edit, r.ExperimentID, u); err != nil {
		return nil, err
	}

	oldExperiment, err := svc.GetExperimentByID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get old experiment", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	// Perform validation if config is provided and validation is not disabled
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

	svc.LogExperimentChange(ctx, projectID, r.ExperimentID, u.Username, r.Comment, update_log.ActionUpdate, update_log.ExperimentUpdateLog{
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
func listCompleteExperimentsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListCompleteExperimentsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
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
func getCompleteExperimentHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetCompleteExperimentRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
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
	}

	return &responses.GetCompleteExperimentsResponse{
		CompleteExperiment: dto.CompleteExperiment{
			ID:                    completeExperiment.ID,
			Name:                  completeExperiment.Name,
			Description:           completeExperiment.Description,
			Config:                completeExperiment.Config,
			ProjectID:             completeExperiment.ProjectID,
			ProjectName:           projectName,
			AdditionalInformation: completeExperiment.AdditionalInformation,
		},
		Rights: rights,
	}, nil
}
