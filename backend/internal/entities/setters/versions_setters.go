package setters

import (
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/helpers"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"net/http"
)

func SetListExperimentVersionsRequestParams(r *requests.ListExperimentVersionsRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "experiment_id":
		r.ExperimentID = val
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

func SetListExperimentVariableVersionsRequestParams(r *requests.ListExperimentVariableVersionsRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "variable_id":
		r.VariableID = val
	case "experiment_id":
		r.ExperimentID = val
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

func SetListDatasetVersionsRequestParams(r *requests.ListDatasetVersionsRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "dataset_id":
		r.DatasetID = val
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

func SetGetExperimentConfigVersionRequestParams(r *requests.GetExperimentConfigVersionRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "experiment_id":
		r.ExperimentID = val
	case "version_id":
		r.VersionID = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetGetExperimentVariableVersionRequestParams(r *requests.GetExperimentVariableVersionRequest, name, value string) *responses.ErrorResponse {
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "version_id":
		r.VersionID = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetGetDatasetVersionRequestParams(r *requests.GetDatasetVersionRequest, name, value string) *responses.ErrorResponse {
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "version_id":
		r.VersionID = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetGetExperimentCurrentVersionRequestParams(r *requests.GetExperimentCurrentVersionRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "experiment_id":
		r.ExperimentID = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetGetExperimentVariableCurrentVersionRequestParams(r *requests.GetExperimentVariableCurrentVersionRequest, name, value string) *responses.ErrorResponse {
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
	case "variable_id":
		r.VariableID = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetGetDatasetCurrentVersionRequestParams(r *requests.GetDatasetCurrentVersionRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	switch name {
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
