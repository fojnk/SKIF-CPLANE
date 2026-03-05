package models

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/libs/models/experiment"
)

type Worker struct {
	GraphConfig GraphConfig `json:"GraphConfig"`
}

type GraphConfig struct {
	Name        string `json:"Name"`
	OutputNames []any  `json:"OutputNames"`
	StateNames  []any  `json:"StateNames"`
	Cubes       []any  `json:"Cubes"`
}

type ExperimentConfig struct {
	Placement     experiment.ExperimentPlacement       `json:"Placement" validate:"required"`
	Resources     experiment.ExperimentResources       `json:"Resources" validate:"required"`
	PublicSources map[string]experiment.PublicSource `json:"PublicSources"`
	Resharder     map[string]any                   `json:"Resharder" validate:"required"`
	Worker        map[string]any                   `json:"Worker" validate:"required"`
	States        []any                            `json:"States"`
}
