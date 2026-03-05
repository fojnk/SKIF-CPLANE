package validation

import (
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
)

func ValidateGetProductsRequest(r *requests.GetProductsRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}
	if r.ExperimentID == 0 {
		return fmt.Errorf("experiment_id is required")
	}
	return nil
}

func ValidateGetAlertsRequest(r *requests.GetAlertsRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.ExperimentID == 0 {
		return fmt.Errorf("experiment_id is required")
	}

	if r.ProductID == 0 {
		return fmt.Errorf("product_id is required")
	}
	return nil
}