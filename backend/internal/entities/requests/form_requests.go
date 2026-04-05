package requests

type GetDatasetFormRequest struct {
	Type string `json:"type" validate:"required"`
}

type GetProjectFormRequest struct {
}

type GetExperimentFormsRequest struct {
}
