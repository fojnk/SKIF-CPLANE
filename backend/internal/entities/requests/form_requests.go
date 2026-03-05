package requests

type GetDatasetFormRequest struct {
	Type    string `json:"type" validate:"required,oneof=Queue KeyValue StaticTableDir Kafka"`
	Managed bool   `json:"managed"`
}

type GetProjectFormRequest struct {
}

type GetExperimentFormsRequest struct {
}
