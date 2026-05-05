package responses

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
)

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
