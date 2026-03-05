package setters

import (
	"fmt"
	"net/http"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/helpers"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

func SetGetDatasetFormRequestParams(r *requests.GetDatasetFormRequest, name, value string) *responses.ErrorResponse {
	switch name {
	case "type":
		r.Type = value
	case "managed":
		res, err := helpers.ParseBool(name, value)
		if err != nil {
			return err
		}
		r.Managed = res
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}

	return nil
}
