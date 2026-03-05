package validation

import (
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
)

func ValidateListDatasetUpdateLogsByProjectRequest(r *requests.ListDatasetUpdateLogsByProjectRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.DatasetID == 0 && r.ProjectID == 0 {
		return fmt.Errorf("dataset_id or namespace_id is required")
	}
	return nil
}

func ValidateListDatasetUpdateLogsByNamespaceRequest(r *requests.ListDatasetUpdateLogsByNamespaceRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.DatasetID == 0 && r.NamespaceID == 0 {
		return fmt.Errorf("dataset_id or namespace_id is required")
	}
	return nil
}

func ValidateListProjectUpdateLogsRequest(r *requests.ListProjectUpdateLogsRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.ProjectID == 0 && r.NamespaceID == 0 {
		return fmt.Errorf("project_id or namespace_id is required")
	}
	return nil
}

func ValidateListExperimentUpdateLogsRequest(r *requests.ListExperimentUpdateLogsRequest) error {
	if err := validate.Struct(r); err != nil {
		return err
	}

	if r.ExperimentID == 0 && r.ProjectID == 0 {
		return fmt.Errorf("experiment_id or project_id is required")
	}
	return nil
}
