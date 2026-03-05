package setters

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"net/http"
	"strconv"
)

func SetGetNamespaceVariableRequestParams(r *requests.GetNamespaceVariableRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse variable_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.VariableID = int32(id)
	return nil
}

func SetGetProjectVariablesRequestParams(r *requests.GetProjectVariablesRequest, _, value string) *responses.ErrorResponse {
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

func SetGetProjectVariableRequestParams(r *requests.GetProjectVariableRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse variable_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.VariableID = int32(id)
	return nil
}

func SetGetExperimentVariablesRequestParams(r *requests.GetExperimentVariablesRequest, _, value string) *responses.ErrorResponse {
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

func SetGetExperimentVariableRequestParams(r *requests.GetExperimentVariableRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse variable_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.VariableID = int32(id)
	return nil
}

func SetGetExperimentVariableV2RequestParams(r *requests.GetExperimentVariableV2Request, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	switch name {
	case "experiment_id":
		id, err := strconv.ParseInt(value, 10, 32)
		if err != nil {
			return &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "failed to parse experiment_id",
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}
		r.ExperimentID = int32(id)
	case "name":
		r.Name = value
	}
	return nil
}

func SetGetNamespaceVariablesRequestParams(r *requests.GetNamespaceVariablesRequest, _, value string) *responses.ErrorResponse {
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
