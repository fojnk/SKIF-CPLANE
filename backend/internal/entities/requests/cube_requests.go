package requests

type CreateCubeRequest struct {
	Name        string `json:"name" validate:"required"`
	ParamsName  string `json:"params_name"`
	Description string `json:"description"`
	Params      string `json:"cube_params"`
	Type        string `json:"type"`
}

type CreateSystemCubesRequest struct {
}

type ListCubesRequest struct {
}

type ListCubesByIDsRequest struct {
	IDs []int32 `json:"ids" validate:"required"`
}

type GetCubeRequest struct {
	CubeID int32 `validate:"required"`
}

type GetCubeByNameRequest struct {
	Name string `validate:"required"`
}

type UpdateCubeRequest struct {
	ID          int32  `json:"id" validate:"required"`
	Name        string `json:"name" validate:"required"`
	ParamsName  string `json:"params_name"`
	Description string `json:"description"`
	Params      string `json:"cube_params"`
	Type        string `json:"type"`
}
