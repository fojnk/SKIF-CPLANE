package setters

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/helpers"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

func SetGetAppUpdateRequestParams(r *requests.GetAppUpdateRequest, name, value string) *responses.ErrorResponse {
	if name != "update_id" {
		return &responses.ErrorResponse{
			ExternalMessage: "unknown parameter: " + name,
			HTTPStatusCode:  400,
		}
	}

	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	r.Id = val
	return nil
}

func SetListAppUpdatesRequestParams(r *requests.ListAppUpdatesRequest, name, value string) *responses.ErrorResponse {
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "limit":
		r.Limit = &val
	case "offset":
		r.Offset = &val
	default:
		return &responses.ErrorResponse{}
	}
	return nil
}
