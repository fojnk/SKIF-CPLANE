package private

import (
	"context"

	"github.com/pkg/errors"
	models "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	experimentSvc "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/experiment"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

// handleApplyExperimentConfigFallback выполняет прямое применение конфига через оркестратор
func handleApplyExperimentConfigFallback(
	ctx context.Context,
	svc *service.Service,
	l *logger.Logger,
	experimentID int32,
	projectID int32,
	username string,
	comment string,
) (any, *responses.ErrorResponse) {
	appliedJSON, err := svc.ApplyExperimentConfig(ctx, experimentID)
	if err != nil {
		l.Error("failed to apply experiment config", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	svc.LogExperimentChange(ctx, projectID, experimentID, username, comment, service.UpdateLogActionApplyExperiment, service.ExperimentUpdateLog{
		New: service.ExperimentUpdateLogEntity{
			Description: "Применена конфигурация супервизора (experiment.apply)",
			Config:      experimentSvc.TruncateForExperimentLog(appliedJSON, experimentSvc.MaxExperimentApplyLogConfigBytes),
		},
	})

	return responses.EmptyResponse{}, nil
}

// ApplyExperimentConfigV2Handler godoc
//
//	@Summary	apply experiment config (v2 — напрямую через оркестратор)
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

	return handleApplyExperimentConfigFallback(ctx, svc, l, r.ExperimentID, experiment.ProjectID, u.Username, r.Comment)
}

// ApplyExperimentConfigV3Handler godoc
//
//	@Summary	apply experiment config (v3 — напрямую через оркестратор; single_stage игнорируется)
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ApplyExperimentConfigRequest	true	"request body. single_stage устарел"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v3/experiment/config/apply [put]
func ApplyExperimentConfigV3Handler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ApplyExperimentConfigRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	return ApplyExperimentConfigV2Handler(ctx, svc, l, r, u)
}
