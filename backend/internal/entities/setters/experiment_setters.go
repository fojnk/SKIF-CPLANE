package setters

import (
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/helpers"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"net/http"
	"strconv"
)

func SetGetExperimentDatasetsRequestParams(r *requests.GetExperimentDatasetsRequest, _, value string) *responses.ErrorResponse {
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

func SetGetExperimentURLsRequestParams(r *requests.GetExperimentURLsRequest, _, value string) *responses.ErrorResponse {
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

func SetGetExperimentGrafanaURLRequestParams(r *requests.GetExperimentGrafanaURLRequest, _, value string) *responses.ErrorResponse {
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

func SetExperimentStatusRequestParams(r *requests.ExperimentStatusRequest, _, value string) *responses.ErrorResponse {
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

func SetExperimentCheckConfigRequestParams(r *requests.ExperimentCheckUpdateRequest, _, value string) *responses.ErrorResponse {
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

func SetListCompleteExperimentsRequestParams(r *requests.ListCompleteExperimentsRequest, _, value string) *responses.ErrorResponse {
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

func SetGetCompleteExperimentRequestParams(r *requests.GetCompleteExperimentRequest, _, value string) *responses.ErrorResponse {
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

func SetGetExperimentDatasetV2RequestParams(r *requests.GetDatasetFromExperimentV2Request, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)

	switch name {
	case "experiment_id":
		val, err := helpers.ParseInt32(name, value)
		if err != nil {
			return err
		}
		r.ExperimentID = val
	case "alias":
		r.Alias = value
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}
