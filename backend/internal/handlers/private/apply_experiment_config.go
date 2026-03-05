package private

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	models "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

// handleApplyExperimentConfigFallback выполняет fallback к прямому применению конфига
func handleApplyExperimentConfigFallback(
	ctx context.Context,
	svc *service.Service,
	l *logger.Logger,
	experimentID int32,
	projectID int32,
	username string,
	comment string,
) (any, *responses.ErrorResponse) {
	if _, err := svc.ApplyExperimentConfig(ctx, experimentID); err != nil {
		l.Error("failed to apply experiment config in fallback mode", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, projectID, experimentID, username, comment, service.UpdateLogActionApplyExperiment, service.ExperimentUpdateLog{
		New: service.ExperimentUpdateLogEntity{
			JobID: nil,
		},
	})

	return responses.EmptyResponse{}, nil
}

// createJobRequest создает запрос на создание джобы в зависимости от режима
func createJobRequest(
	experimentID int32,
	cfgMap map[string]interface{},
	useSingleStage bool,
) clients.CreateJobRequest {
	entity := &clients.LinkedEntity{
		Type: "experiment",
		Id:   int64(experimentID),
	}

	execTarget := "orchestrator"
	tags := []string{"experiment", "apply_config"}

	if useSingleStage {
		jobName := fmt.Sprintf("apply-config-experiment-%d", experimentID)
		jobConfig := map[string]interface{}{
			"experiment_id": experimentID,
		}
		desc := fmt.Sprintf("Apply config for experiment %d", experimentID)

		stepDesc := "Apply experiment configuration"
		stepOrder := int32(0)
		stepConfig := map[string]interface{}{
			"type":            "apply_experiment_config",
			"dry_run":         false,
			"experiment_config": cfgMap,
		}
		steps := []clients.CreateStep{
			{
				Name:        "apply_experiment_config",
				Description: &stepDesc,
				Order:       &stepOrder,
				Config:      &stepConfig,
			},
		}

		return clients.CreateJobRequest{
			Name:            jobName,
			Description:     &desc,
			Type:            "experiment_apply_config",
			ExecutionTarget: &execTarget,
			Config:          &jobConfig,
			Entity:          entity,
			Tags:            &tags,
			Steps:           &steps,
		}
	}

	// Phased apply
	jobName := fmt.Sprintf("phased-apply-experiment-%d", experimentID)
	jobConfig := map[string]interface{}{
		"experiment_config": cfgMap,
	}
	desc := fmt.Sprintf("Phased apply config for experiment %d", experimentID)
	tags = append(tags, "phased")

	return clients.CreateJobRequest{
		Name:            jobName,
		Description:     &desc,
		Type:            "experiment_apply_phased",
		ExecutionTarget: &execTarget,
		Config:          &jobConfig,
		Entity:          entity,
		Tags:            &tags,
	}
}

// ApplyExperimentConfigV2Handler godoc
//
//	@Summary	apply experiment config (v2 - uses jobd)
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
//	@Router		/api/v2/experiment/config/apply [put]
func ApplyExperimentConfigV2Handler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ApplyExperimentConfigRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
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

	if svc.Repo.Clients.Jobd == nil {
		l.Info(fmt.Sprintf("jobd client is not configured, falling back to direct ApplyExperimentConfig for experiment_id=%d", r.ExperimentID))

		if _, err := svc.ApplyExperimentConfig(ctx, r.ExperimentID); err != nil {
			l.Error("failed to apply experiment config in fallback mode", err)
			return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
		}

		svc.LogExperimentChange(ctx, experiment.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionApplyExperiment, service.ExperimentUpdateLog{
			New: service.ExperimentUpdateLogEntity{
				JobID: nil,
			},
		})

		return responses.EmptyResponse{}, nil
	}

	experimentData, err := svc.Repo.DB.CompleteExperimentInfo(ctx, r.ExperimentID)
	if err != nil {
		l.Warn(fmt.Sprintf("failed to complete experiment info for jobd, falling back to direct apply: %v", err))

		if _, err := svc.ApplyExperimentConfig(ctx, r.ExperimentID); err != nil {
			l.Error("failed to apply experiment config in fallback mode", err)
			return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
		}

		svc.LogExperimentChange(ctx, experiment.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionApplyExperiment, service.ExperimentUpdateLog{
			New: service.ExperimentUpdateLogEntity{
				JobID: nil,
			},
		})

		return responses.EmptyResponse{}, nil
	}

	cfg, err := orch.ExperimentInfoToOrchestratorConfig(l, &experimentData)
	if err != nil {
		l.Warn(fmt.Sprintf("failed to convert experiment info to orchestrator config, falling back to direct apply: %v", err))

		if _, err := svc.ApplyExperimentConfig(ctx, r.ExperimentID); err != nil {
			l.Error("failed to apply experiment config in fallback mode", err)
			return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
		}

		svc.LogExperimentChange(ctx, experiment.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionApplyExperiment, service.ExperimentUpdateLog{
			New: service.ExperimentUpdateLogEntity{
				JobID: nil,
			},
		})

		return responses.EmptyResponse{}, nil
	}

	cfgJSON, err := json.Marshal(cfg)
	if err != nil {
		l.Error("failed to marshal orchestrator config to JSON", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: fmt.Sprintf("Не удалось собрать конфиг оркестратора: %s", err.Error()),
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	var cfgMap map[string]interface{}
	err = json.Unmarshal(cfgJSON, &cfgMap)
	if err != nil {
		l.Error("failed to unmarshal orchestrator config to JSON", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to unmarshal experiment config",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	jobName := fmt.Sprintf("apply-config-experiment-%d", r.ExperimentID)
	jobConfig := map[string]interface{}{
		"experiment_id": r.ExperimentID,
	}

	entity := &clients.LinkedEntity{
		Type: "experiment",
		Id:   int64(r.ExperimentID),
	}

	desc := fmt.Sprintf("Apply config for experiment %d", r.ExperimentID)
	execTarget := "orchestrator"
	tags := []string{"experiment", "apply_config"}

	stepDesc := "Apply experiment configuration"
	stepOrder := int32(0)
	stepConfig := map[string]interface{}{
		"type":            "apply_experiment_config",
		"dry_run":         false,
		"experiment_config": cfgMap,
	}
	steps := []clients.CreateStep{
		{
			Name:        "apply_experiment_config",
			Description: &stepDesc,
			Order:       &stepOrder,
			Config:      &stepConfig,
		},
	}

	createJobReq := clients.CreateJobRequest{
		Name:            jobName,
		Description:     &desc,
		Type:            "experiment_apply_config",
		ExecutionTarget: &execTarget,
		Config:          &jobConfig,
		Entity:          entity,
		Tags:            &tags,
		Steps:           &steps,
	}

	ctxWithUserID := clients.WithUserID(ctx, u.Username)
	jobResp, err := svc.Repo.Clients.Jobd.CreateJob(ctxWithUserID, createJobReq)
	if err != nil {
		l.Error("failed to create job in jobd", err)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, "failed to create job in jobd"),
			ExternalMessage: fmt.Sprintf("Ошибка создания джобы: %s", err.Error()),
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	var jobID int64
	if jobResp.Job != nil && jobResp.Job.Id != nil {
		jobID = *jobResp.Job.Id
	}
	l.Info(fmt.Sprintf("Job created in jobd: job_id=%d, experiment_id=%d", jobID, r.ExperimentID))
	templateID, err := svc.Repo.DB.BaseTemplateIDByExperimentID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to retrieve template ID for applied version", err)
		return nil, shared.ConvertServiceError(serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment), shared.EntityExperiment)
	}

	if err := svc.Repo.DB.InsertExperimentAppliedVersion(ctx, core.InsertExperimentAppliedVersionParams{
		ExperimentID:     experimentData.ExperimentID,
		CurrentVersion: templateID,
		OrchConfig:     string(cfgJSON),
	}); err != nil {
		l.Error("failed to insert applied experiment version", err)
		return nil, shared.ConvertServiceError(serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment), shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, experimentData.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionApplyExperiment, service.ExperimentUpdateLog{
		New: service.ExperimentUpdateLogEntity{
			JobID: jobResp.Job.Id,
		},
	})

	return responses.EmptyResponse{}, nil
}

// ApplyExperimentConfigV3Handler godoc
//
//	@Summary	apply experiment config (v3 - supports both single stage and phased apply via jobd)
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ApplyExperimentConfigRequest	true	"request body. Set single_stage=true for single stage job, omit or set false for phased apply"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v3/experiment/config/apply [put]
func ApplyExperimentConfigV3Handler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ApplyExperimentConfigRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
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

	useSingleStage := r.SingleStage != nil && *r.SingleStage

	// Проверка jobd и fallback для single stage
	if svc.Repo.Clients.Jobd == nil {
		if useSingleStage {
			l.Info(fmt.Sprintf("jobd client is not configured, falling back to direct ApplyExperimentConfig for experiment_id=%d", r.ExperimentID))
			return handleApplyExperimentConfigFallback(ctx, svc, l, r.ExperimentID, experiment.ProjectID, u.Username, r.Comment)
		}
		l.Error("jobd client is not configured, phased apply requires jobd", nil)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.New("jobd client is not configured"),
			ExternalMessage: "Job system is not available for phased apply",
			HTTPStatusCode:  http.StatusServiceUnavailable,
		}
	}

	// Подготовка конфигурации с fallback для single stage
	experimentData, err := svc.Repo.DB.CompleteExperimentInfo(ctx, r.ExperimentID)
	if err != nil {
		if useSingleStage {
			l.Warn(fmt.Sprintf("failed to complete experiment info for jobd, falling back to direct apply: %v", err))
			return handleApplyExperimentConfigFallback(ctx, svc, l, r.ExperimentID, experiment.ProjectID, u.Username, r.Comment)
		}
		l.Error("failed to complete experiment info for jobd", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	cfg, err := orch.ExperimentInfoToOrchestratorConfig(l, &experimentData)
	if err != nil {
		if useSingleStage {
			l.Warn(fmt.Sprintf("failed to convert experiment info to orchestrator config, falling back to direct apply: %v", err))
			return handleApplyExperimentConfigFallback(ctx, svc, l, r.ExperimentID, experiment.ProjectID, u.Username, r.Comment)
		}
		l.Error("failed to convert experiment info to orchestrator config", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Failed to prepare experiment configuration",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	cfgJSON, err := json.Marshal(cfg)
	if err != nil {
		l.Error("failed to marshal orchestrator config to JSON", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: fmt.Sprintf("Не удалось собрать конфиг оркестратора: %s", err.Error()),
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	var cfgMap map[string]interface{}
	if err = json.Unmarshal(cfgJSON, &cfgMap); err != nil {
		l.Error("failed to unmarshal orchestrator config to JSON", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to unmarshal experiment config",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	// Создание джобы
	createJobReq := createJobRequest(r.ExperimentID, cfgMap, useSingleStage)
	ctxWithUserID := clients.WithUserID(ctx, u.Username)
	jobResp, err := svc.Repo.Clients.Jobd.CreateJob(ctxWithUserID, createJobReq)
	if err != nil {
		jobType := "phased apply"
		if useSingleStage {
			jobType = "apply config"
		}
		l.Error(fmt.Sprintf("failed to create %s job in jobd", jobType), err)
		return nil, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, fmt.Sprintf("failed to create %s job in jobd", jobType)),
			ExternalMessage: fmt.Sprintf("Ошибка создания джобы: %s", err.Error()),
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	var jobID int64
	if jobResp.Job != nil && jobResp.Job.Id != nil {
		jobID = *jobResp.Job.Id
	}
	jobType := "Phased apply"
	if useSingleStage {
		jobType = "Job"
	}
	l.Info(fmt.Sprintf("%s created in jobd: job_id=%d, experiment_id=%d", jobType, jobID, r.ExperimentID))

	// Сохранение версии
	templateID, err := svc.Repo.DB.BaseTemplateIDByExperimentID(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to retrieve template ID for applied version", err)
		return nil, shared.ConvertServiceError(serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment), shared.EntityExperiment)
	}

	if err := svc.Repo.DB.InsertExperimentAppliedVersion(ctx, core.InsertExperimentAppliedVersionParams{
		ExperimentID:     experimentData.ExperimentID,
		CurrentVersion: templateID,
		OrchConfig:     string(cfgJSON),
	}); err != nil {
		l.Error("failed to insert applied experiment version", err)
		return nil, shared.ConvertServiceError(serviceerrors.ConvertPostgresError(err, serviceerrors.EntityExperiment), shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, experimentData.ProjectID, r.ExperimentID, u.Username, r.Comment, service.UpdateLogActionApplyExperiment, service.ExperimentUpdateLog{
		New: service.ExperimentUpdateLogEntity{
			JobID: jobResp.Job.Id,
		},
	})

	return responses.EmptyResponse{}, nil
}
