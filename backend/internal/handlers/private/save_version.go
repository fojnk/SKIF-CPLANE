package private

import (
	"context"
	"encoding/json"
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	models "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/supervisor"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/supervisorenrich"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

// saveAppliedVersionForExperiments godoc
//
//	@Summary	save applied version for configs
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		x-superuser-token	header		string											false	"superuser token"
//	@Param		request				body		requests.SaveAppliedVersionForExperimentsRequest	true	"request body"
//	@Success	200					{object}	responses.SaveAppliedConfigResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/config/apply/save [post]
func saveAppliedVersionForExperiments(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.SaveAppliedVersionForExperimentsRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.ProjectAttribute, acl.Edit, 0, u); err != nil {
		return nil, err
	}

	var counter int64 = 0

	// This handler deals with orchestrator-specific logic
	// Uses Repo for direct DB access as service doesn't have this specific method yet
	for _, experimentID := range r.ExperimentIDs {
		experimentData, err := svc.Repo.DB.CompleteExperimentInfo(ctx, experimentID)
		if err != nil {
			l.Error("failed to complete experiment info", err)
			continue
		}

		var cfgJSON []byte
		if experimentData.ExperimentConfig.Valid &&
			supervisor.IsSupervisorExperimentLayout([]byte(experimentData.ExperimentConfig.String)) {
			req, err := supervisor.RequestFromCompleteInfo(l, &experimentData)
			if err != nil {
				l.Error("failed to build skif supervisor experiment request", err)
				continue
			}
			if err := supervisorenrich.ApplyExperimentVariables(req, experimentData.Variables); err != nil {
				l.Error("failed to enrich supervisor request", err)
				continue
			}
			cfgJSON, err = json.Marshal(req)
			if err != nil {
				l.Error("failed to marshal supervisor experiment request", err)
				continue
			}
		} else {
			cfg, err := orch.ExperimentInfoToSupervisorPipelineConfig(&experimentData)
			if err != nil {
				l.Error("failed to convert experiment info to orchestrator config", err)
				continue
			}
			l.Info(fmt.Sprintf("check orch conf, %v", cfg))

			cfgJSON, err = json.Marshal(cfg)
			if err != nil {
				l.Error("failed to marshal orchestrator config to JSON", err)
				continue
			}
		}

		templateID, err := svc.Repo.DB.BaseTemplateIDByExperimentID(ctx, experimentID)
		if err != nil {
			l.Error("failed to retrieve template ID from orchestrator", err)
			continue
		}

		err = svc.Repo.DB.InsertExperimentAppliedVersion(ctx, core.InsertExperimentAppliedVersionParams{
			ExperimentID:     experimentData.ExperimentID,
			CurrentVersion: templateID,
			OrchConfig:     string(cfgJSON),
		})
		if err != nil {
			l.Error("failed to apply experiment version", err)
			continue
		}
		counter++
	}

	return responses.SaveAppliedConfigResponse{Saved: counter}, nil
}
