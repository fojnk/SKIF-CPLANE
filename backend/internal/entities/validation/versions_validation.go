package validation

import (
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
)

func ValidateListExperimentVersionsRequest(r *requests.ListExperimentVersionsRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.ExperimentID == 0 {
		return fmt.Errorf("experiment_id is required")
	}
	return nil
}

func ValidateListExperimentVariableVersionsRequest(r *requests.ListExperimentVariableVersionsRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.ExperimentID == 0 {
		return fmt.Errorf("variable_id is required")
	}
	return nil
}

func ValidateListDatasetVersionsRequest(r *requests.ListDatasetVersionsRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.DatasetID == 0 {
		return fmt.Errorf("dataset_id is required")
	}
	return nil
}

func ValidateGetExperimentVersionsRequest(r *requests.GetExperimentConfigVersionRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.ExperimentID == 0 {
		return fmt.Errorf("experiment_id is required")
	}
	if r.VersionID == 0 {
		return fmt.Errorf("version_id is required")
	}
	return nil
}

func ValidateGetExperimentVariableVersionsRequest(r *requests.GetExperimentVariableVersionRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.VersionID == 0 {
		return fmt.Errorf("version_id is required")
	}
	return nil
}

func ValidateGetDatasetVersionsRequest(r *requests.GetDatasetVersionRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.VersionID == 0 {
		return fmt.Errorf("version_id is required")
	}
	return nil
}

func ValidateGetExperimentCurrentVersionsRequest(r *requests.GetExperimentCurrentVersionRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.ExperimentID == 0 {
		return fmt.Errorf("experiment_id is required")
	}
	return nil
}

func ValidateGetExperimentVariableCurrentVersionsRequest(r *requests.GetExperimentVariableCurrentVersionRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.VariableID == 0 {
		return fmt.Errorf("variable_id is required")
	}
	return nil
}

func ValidateGetDatasetCurrentVersionsRequest(r *requests.GetDatasetCurrentVersionRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.DatasetID == 0 {
		return fmt.Errorf("dataset_id is required")
	}
	return nil
}
