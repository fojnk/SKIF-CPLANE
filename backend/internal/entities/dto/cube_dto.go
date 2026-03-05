package dto

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/params"

type IOType string

const (
	Static  IOType = "static"
	Dynamic IOType = "dynamic"
)

type IO struct {
	Type      IOType   `json:"type"`
	ListNames []string `json:"list_names,omitempty"`
}

type CubeType string

const (
	Resharder CubeType = "CIT_RESHARDER"
	CubeT     CubeType = "CIT_CUBE"
	Retry     CubeType = "CIT_RETRY"
)

type Cube struct {
	ID          int32    `json:"id"`
	Name        string   `json:"name"`
	Author      string   `json:"author"`
	BaseCube    *Cube    `json:"base_cube"`
	Description string   `json:"description"`
	ParamsName  string   `json:"params_name"`
	Params      string   `json:"cube_params"`
	Type        CubeType `json:"type"`
}

type CubeParams struct {
	Inputs  IO             `json:"inputs"`
	Outputs IO             `json:"outputs"`
	Args    []params.Param `json:"args"`
}
