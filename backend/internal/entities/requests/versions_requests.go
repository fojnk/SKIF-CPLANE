package requests

type ExperimentVersionRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
}

type GetExperimentCurrentVersionRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
}

type GetExperimentVariableCurrentVersionRequest struct {
	VariableID int32 `json:"variable_id" validate:"required"`
}

type GetDatasetCurrentVersionRequest struct {
	DatasetID int32 `json:"dataset_id" validate:"required"`
}

type GetExperimentConfigVersionRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
	VersionID  int32 `json:"version_id" validate:"required"`
}

type GetExperimentVariableVersionRequest struct {
	VersionID int32 `json:"version_id" validate:"required"`
}

type GetDatasetVersionRequest struct {
	VersionID int32 `json:"version_id" validate:"required"`
}

type UpdateExperimentVariableVersionCommentRequest struct {
	ID      int32  `json:"id" validate:"required"`
	Comment string `json:"comment"`
}

type UpdateDatasetVersionCommentRequest struct {
	ID      int32  `json:"id" validate:"required"`
	Comment string `json:"comment"`
}

type UpdateExperimentVersionCommentRequest struct {
	ID      int32  `json:"id" validate:"required"`
	Comment string `json:"comment"`
}

type ListExperimentVersionsRequest struct {
	ProjectID  int32
	ExperimentID int32
	From       *int32 `validate:"required"`
	Limit      int32  `validate:"required,min=1,max=100"`
}

type ListExperimentVariableVersionsRequest struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	VariableID int32  `json:"variable_id"`
	From       *int32 `validate:"required"`
	Limit      int32  `validate:"required,min=1,max=100"`
}

type ListDatasetVersionsRequest struct {
	DatasetID int32  `json:"dataset_id" validate:"required"`
	From         *int32 `validate:"required"`
	Limit        int32  `validate:"required,min=1,max=100"`
}

type ProjectVersionRequest struct {
	ProjectID int32 `json:"project_id" validate:"required"`
}

type UpdateExperimentConfigVersionRequest struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	VersionID  int32  `json:"version_id" validate:"required"`
	Comment    string `json:"comment"`
}

type UpdateExperimentVariableVersionRequest struct {
	VariableID int32  `json:"variable_id" validate:"required"`
	VersionID  int32  `json:"version_id" validate:"required"`
	Comment    string `json:"comment"`
}

type UpdateDatasetVersionRequest struct {
	DatasetID int32  `json:"dataset_id" validate:"required"`
	VersionID    int32  `json:"version_id" validate:"required"`
	Comment      string `json:"comment"`
}
