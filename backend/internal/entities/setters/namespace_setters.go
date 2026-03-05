package setters

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"net/http"
	"strconv"
)

func SetListNamespaceConfigsRequestParams(r *requests.ListNamespaceConfigsRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse namespace_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.NamespaceID = int32(id)
	return nil
}

func SetGetNamespaceRequestParams(r *requests.GetNamespaceRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse namespace_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.NamespaceID = int32(id)
	return nil
}

func SetGetNamespaceConfigRequestParams(r *requests.GetNamespaceConfigRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse namespace_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.ConfigID = int32(id)
	return nil
}
