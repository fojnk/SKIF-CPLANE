package requests

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
)

type GetProjectVariableRequest struct {
	VariableID int32 `json:"variable_id" validate:"required"`
}

type GetProjectVariablesRequest struct {
	ProjectID int32 `json:"project_id" validate:"required"`
}

type UpdateProjectVariableRequest struct {
	ID      int32  `json:"id" validate:"required"`
	Name    string `json:"name" validate:"required"`
	Value   string `json:"value" validate:"required"`
	Type    string `json:"type" validate:"required,oneof=string int json yql python"`
	Comment string `json:"comment"`
}

type CreateProjectVariableRequest struct {
	ProjectID int32                         `json:"project_id" validate:"required"`
	Variable  dto.ExperimentVariableForCreate `json:"variable" validate:"required"`
	Comment   string                        `json:"comment"`
}

type DeleteProjectVariableRequest struct {
	VariableID int32 `json:"variable_id" validate:"required"`
}

type UpdateNamespaceVariableRequest struct {
	ID      int32  `json:"id" validate:"required"`
	Name    string `json:"name" validate:"required"`
	Value   string `json:"value" validate:"required"`
	Type    string `json:"type" validate:"required,oneof=string int json yql python"`
	Comment string `json:"comment"`
}

type GetNamespaceVariablesRequest struct {
	NamespaceID int32 `json:"namespace_id" validate:"required"`
}

type GetNamespaceVariableRequest struct {
	VariableID int32 `json:"variable_id" validate:"required"`
}

type CreateNamespaceVariableRequest struct {
	NamespaceID int32                         `json:"namespace_id" validate:"required"`
	Variable    dto.ExperimentVariableForCreate `json:"variable" validate:"required"`
	Comment     string                        `json:"comment"`
}

type DeleteNamespaceVariableRequest struct {
	VariableID int32 `json:"variable_id" validate:"required"`
}

type DeleteExperimentVariableRequest struct {
	VariableID int32 `json:"variable_id" validate:"required"`
}

type DeleteExperimentVariableV2Request struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	Name       string `json:"name" validate:"required"`
}

type CreateExperimentVariableRequest struct {
	ExperimentID int32                         `json:"experiment_id" validate:"required"`
	Variable   dto.ExperimentVariableForCreate `json:"variable" validate:"required"`
	Comment    string                        `json:"comment"`
}

type GetExperimentVariableRequest struct {
	VariableID int32 `json:"variable_id" validate:"required"`
}

type GetExperimentVariableV2Request struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	Name       string `json:"name" validate:"required"`
}

type GetAvailableExperimentVariableTypesRequest struct {
}

type GetExperimentVariablesRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
}

type UpdateExperimentVariableRequest struct {
	Variable dto.ExperimentVariableForUpdate `json:"variable" validate:"required"`
	Comment  string                        `json:"comment"`
}

type UpdateExperimentVariableV2Request struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	Name       string `json:"name" validate:"required"`
	Value      string `json:"value" validate:"required"`
	Type       string `json:"type" validate:"required,oneof=string int json yql python"`
	Comment    string `json:"comment"`
}

type CreateExperimentVariableV2Request struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	Value      string `json:"value" validate:"required"`
	Type       string `json:"type" validate:"required,oneof=string int json yql python"`
}
