package setters

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"net/http"
	"strconv"
)

func SetGetOrchestratorConfigRequestParams(r *requests.GetOrchestratorConfigRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse experiment_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.ExperimentID = int32(id)
	return nil
}
