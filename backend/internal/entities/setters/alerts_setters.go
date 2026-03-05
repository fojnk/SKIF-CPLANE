package setters

import (
	"fmt"
	"net/http"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/helpers"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

func SetGetProductsParams(r *requests.GetProductsRequest, name, value string) *responses.ErrorResponse {
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

func SetGetAlertsParams(r *requests.GetAlertsRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}
	switch name {
	case "experiment_id":
		r.ExperimentID = val
	case "product_id":
		r.ProductID = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetCreateAlertGroupParams(r *requests.CreateAlertGroupRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}
	switch name {
	case "experiment_id":
		r.ExperimentID = val
	case "product_id":
		r.ProductID = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetDeleteAlertGroupParams(r *requests.DeleteAlertsRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}
	switch name {
	case "experiment_id":
		r.ExperimentID = val
	case "product_id":
		r.ProductID = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetChangeAlertSeveritiesParams(r *requests.ChangeAlertSeveritiesRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}
	switch name {
	case "experiment_id":
		r.ExperimentID = val
	case "product_id":
		r.ProductID = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetChangeAlertParams(r *requests.ChangeAlertRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}
	switch name {
	case "experiment_id":
		r.ExperimentID = val
	case "product_id":
		r.ProductID = val
	default:
		return &responses.ErrorResponse{
			InternalError:   fmt.Errorf("invalid parameter: %s", name),
			ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return nil
}

func SetDefaultDelayValues(rules []alerts.AlertRuleInput) []alerts.AlertRuleInput {
	for i := range rules {
		if rules[i].DelayFiring == "" {
			rules[i].DelayFiring = "0s"
		}
		if rules[i].DelayResolving == "" {
			rules[i].DelayResolving = "0s"
		}
	}
	return rules
}
