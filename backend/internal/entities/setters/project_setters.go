package setters

import (
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/helpers"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"net/http"
	"strconv"
)

func SetGetProjectRequestParams(r *requests.GetProjectRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse project_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.ProjectID = int32(id)
	return nil
}

func SetListAllProjectsRequestParams(r *requests.ListProjectsRequestV2, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	if name != "search" {
		val, err := helpers.ParseInt32(name, value)
		if err != nil {
			return err
		}
		switch name {
		case "limit":
			r.Limit = val
		case "offset":
			r.Offset = &val
		case "namespace_id":
			r.NamespaceID = val
		case "order_by":
			r.OrderBy = value
		default:
			return &responses.ErrorResponse{
				InternalError:   fmt.Errorf("invalid parameter: %s", name),
				ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}
	} else {
		r.Search = value
	}

	return nil
}

func SetListProjectConfigsRequestParams(r *requests.ListProjectConfigsRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse project_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.ProjectID = int32(id)
	return nil
}

func SetGetProjectConfigRequestParams(r *requests.GetProjectConfigRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse project_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.ConfigID = int32(id)
	return nil
}

func SetListProjectRequestParams(r *requests.ListProjectsRequest, _, value string) *responses.ErrorResponse {
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

func SetGetProjectURLsRequestParams(r *requests.GetProjectLinksRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse project_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.ProjectID = int32(id)
	return nil
}
