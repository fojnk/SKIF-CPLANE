package setters

import (
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/helpers"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"net/http"
	"strconv"
)

func SetListDatasetsByNamespaceRequestParams(r *requests.ListDatasetsByNamespaceRequest, _, value string) *responses.ErrorResponse {
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

func SetListAllDatasetsRequestParams(r *requests.ListDatasetsRequest, name, value string) *responses.ErrorResponse {
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

func SetGetDatasetLinkedExperimentsRequestParams(r *requests.GetDatasetLinkedExperimentsRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}
	switch name {
	case "limit":
		r.Limit = val
	case "offset":
		r.Offset = &val
	case "dataset_id":
		r.DatasetID = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}

	return nil
}

func SetSearchDatasetsRequestParams(r *requests.SearchDatasetsRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)

	switch name {
	case "search", "cluster", "path", "order_by":
		switch name {
		case "cluster":
			r.Cluster = value
		case "path":
			r.Path = value
		case "search":
			r.Search = value
		case "order_by":
			r.OrderBy = value
		}

	case "public":
		a := true
		b := false
		if value == "true" {
			r.Public = &a
		} else if value == "false" {
			r.Public = &b
		} else {
			r.Public = nil
		}

	case "limit", "offset", "project_id", "namespace_id":
		val, err := helpers.ParseInt32(name, value)
		if err != nil {
			return err
		}
		switch name {
		case "limit":
			r.Limit = val
		case "offset":
			r.Offset = &val
		case "project_id":
			r.ProjectID = val
		case "namespace_id":
			r.NamespaceID = val
		default:
			return &responses.ErrorResponse{
				InternalError:   fmt.Errorf("invalid parameter: %s", name),
				ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}
	}

	return nil
}

func SetListDatasetsByProjectRequestParams(r *requests.ListDatasetsByProjectRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse namespace_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.ProjectID = int32(id)
	return nil
}

func SetGetDatasetRequestParams(r *requests.GetDatasetRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse dataset_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.DatasetID = int32(id)
	return nil
}
