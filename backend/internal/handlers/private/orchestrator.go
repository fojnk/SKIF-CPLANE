package private

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

// getOrchestratorConfigHandler godoc
//
//	@Summary	get orchestrator config
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int	true	"experiment id"
//	@Success	200			{object}	responses.GetOrchestratorConfigResponse
//	@Failure	400			{object}	responses.ErrorResponse				"Bad Request"
//	@Failure	401			{object}	responses.ErrorResponse				"Unauthorized"
//	@Failure	403			{object}	responses.ErrorResponse				"Forbidden"
//	@Failure	404			{object}	responses.CreateAppBannerResponse	"Not Found"
//	@Failure	500			{object}	responses.ErrorResponse				"Internal server error"
//	@Router		/api/v1/experiment/orchestrator [get]
func getOrchestratorConfigHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetOrchestratorConfigRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Read, r.ExperimentID, u); err != nil {
		return nil, err
	}

	config, err := svc.GetOrchestratorConfig(ctx, r.ExperimentID)
	if err != nil {
		l.Error("Failed to get orchestrator config", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	return responses.GetOrchestratorConfigResponse{
		Config: config,
	}, nil
}
