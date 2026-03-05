package setters

import (
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/helpers"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"net/http"
)

func SetListNamespaceUpdateLogsRequestParams(r *requests.ListNamespaceUpdateLogsRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "namespace_id":
		r.NamespaceID = val
	case "from":
		r.From = &val
	case "limit":
		r.Limit = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetGetNamespaceLogRequestParams(r *requests.GetNamespaceLogRequest, name, value string) *responses.ErrorResponse {
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	r.LogID = val
	return nil
}

func SetListProjectUpdateLogsRequestParams(r *requests.ListProjectUpdateLogsRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "project_id":
		r.ProjectID = val
	case "namespace_id":
		r.NamespaceID = val
	case "from":
		r.From = &val
	case "limit":
		r.Limit = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetListDatasetUpdateLogsByNamespaceRequestParams(r *requests.ListDatasetUpdateLogsByNamespaceRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "dataset_id":
		r.DatasetID = val
	case "namespace_id":
		r.NamespaceID = val
	case "from":
		r.From = &val
	case "limit":
		r.Limit = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetListDatasetUpdateLogsByProjectRequestParams(r *requests.ListDatasetUpdateLogsByProjectRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "dataset_id":
		r.DatasetID = val
	case "project_id":
		r.ProjectID = val
	case "from":
		r.From = &val
	case "limit":
		r.Limit = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetGetDatasetLogRequestParams(r *requests.GetDatasetLogRequest, name, value string) *responses.ErrorResponse {
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	r.LogID = val
	return nil
}

func SetListExperimentUpdateLogsRequestParams(r *requests.ListExperimentUpdateLogsRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "experiment_id":
		r.ExperimentID = val
	case "project_id":
		r.ProjectID = val
	case "from":
		r.From = &val
	case "limit":
		r.Limit = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetGetExperimentLogRequestParams(r *requests.GetExperimentLogRequest, name, value string) *responses.ErrorResponse {
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	r.LogID = val
	return nil
}

func SetGetProjectLogRequestParams(r *requests.GetProjectLogRequest, name, value string) *responses.ErrorResponse {
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	r.LogID = val
	return nil
}
