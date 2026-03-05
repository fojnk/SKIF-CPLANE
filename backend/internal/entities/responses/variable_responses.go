package responses

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
)

type UpdateProjectVariableResponse struct {
	ID    int32  `json:"id" validate:"required"`
	Name  string `json:"name" validate:"required"`
	Value string `json:"value" validate:"required"`
	Type  string `json:"type" validate:"required,oneof=string int json yql python"`
}

type GetProjectVariablesResponse struct {
	Variables []GetProjectVariablesResponseSingle `json:"variables"`
}

type GetProjectVariablesResponseSingle struct {
	ID   int32  `json:"id" validate:"required"`
	Name string `json:"name" validate:"required"`
	Type string `json:"type" validate:"required,oneof=string int json yql python"`
}

type GetProjectVariableResponse struct {
	ID    int32  `json:"id" validate:"required"`
	Name  string `json:"name" validate:"required"`
	Type  string `json:"type" validate:"required,oneof=string int json yql python"`
	Value string `json:"value" validate:"required"`
}

type CreateProjectVariableResponse struct {
	ID    int32  `json:"id"`
	Name  string `json:"name"`
	Type  string `json:"type" validate:"oneof=string int json yql python"`
	Value string `json:"value"`
}

type CreateNamespaceVariableResponse struct {
	ID    int32  `json:"id"`
	Name  string `json:"name"`
	Type  string `json:"type" validate:"oneof=string int json yql python"`
	Value string `json:"value"`
}

type GetNamespaceVariableResponse struct {
	ID    int32  `json:"id" validate:"required"`
	Name  string `json:"name" validate:"required"`
	Type  string `json:"type" validate:"required,oneof=string int json yql python"`
	Value string `json:"value" validate:"required"`
}

type GetNamespaceVariablesResponse struct {
	Variables []GetNamespaceVariablesResponseSingle `json:"variables"`
}

type GetNamespaceVariablesResponseSingle struct {
	ID   int32  `json:"id" validate:"required"`
	Name string `json:"name" validate:"required"`
	Type string `json:"type" validate:"required,oneof=string int json yql python"`
}

type UpdateNamespaceVariableResponse struct {
	ID    int32  `json:"id" validate:"required"`
	Name  string `json:"name" validate:"required"`
	Value string `json:"value" validate:"required"`
	Type  string `json:"type" validate:"required,oneof=string int json yql python"`
}

type UpdateExperimentVariableResponse struct {
	Variable dto.ExperimentVariable `json:"variable"`
}

type UpdateExperimentVariableV2Response struct {
	Name  string `json:"name" validate:"required"`
	Value string `json:"value" validate:"required"`
	Type  string `json:"type" validate:"required,oneof=string int json yql python"`
}

type GetExperimentVariablesResponse struct {
	Variables []dto.ExperimentVariableShort `json:"variables"`
}

type GetExperimentVariablesV2Response struct {
	Variables []dto.ExperimentVariableShortV2 `json:"variables"`
}

type GetAvailableExperimentVariableTypesResponse struct {
	Types []orch.ExperimentVariableType `json:"types"`
}

type GetExperimentVariableResponse struct {
	Variable dto.ExperimentVariable `json:"variable"`
}

type GetExperimentVariableV2Response struct {
	Name  string `json:"name" validate:"required"`
	Value string `json:"value" validate:"required"`
	Type  string `json:"type" validate:"required,oneof=string int json yql python"`
}

type CreateExperimentVariableResponse struct {
	Variable dto.ExperimentVariable `json:"variable"`
}
