package requests

type ListNamespaceUpdateLogsRequest struct {
	NamespaceID int32
	From        *int32 `validate:"required"`
	Limit       int32  `validate:"required,min=1,max=100"`
}

type GetNamespaceLogRequest struct {
	LogID int32
}

type ListProjectUpdateLogsRequest struct {
	ProjectID   int32
	NamespaceID int32
	From        *int32 `validate:"required"`
	Limit       int32  `validate:"required,min=1,max=100"`
}

type GetProjectLogRequest struct {
	LogID int32
}

type ListDatasetUpdateLogsByNamespaceRequest struct {
	DatasetID int32
	NamespaceID  int32
	From         *int32 `validate:"required"`
	Limit        int32  `validate:"required,min=1,max=100"`
}

type ListDatasetUpdateLogsByProjectRequest struct {
	DatasetID int32
	ProjectID    int32
	From         *int32 `validate:"required"`
	Limit        int32  `validate:"required,min=1,max=100"`
}

type GetDatasetLogRequest struct {
	LogID int32
}

type ListExperimentUpdateLogsRequest struct {
	ProjectID  int32
	ExperimentID int32
	From       *int32 `validate:"required"`
	Limit      int32  `validate:"required,min=1,max=100"`
}

type GetExperimentLogRequest struct {
	LogID int32
}

type UpdateExperimentLogCommentRequest struct {
	LogId      int32  `json:"log_id" validate:"required"`
	NewComment string `json:"new_comment" validate:"required"`
}

type UpdateProjectLogCommentRequest struct {
	LogId      int32  `json:"log_id" validate:"required"`
	NewComment string `json:"new_comment" validate:"required"`
}

type UpdateDatasetLogCommentRequest struct {
	LogId      int32  `json:"log_id" validate:"required"`
	NewComment string `json:"new_comment" validate:"required"`
}

type UpdateVariableLogCommentRequest struct {
	LogId      int32  `json:"log_id" validate:"required"`
	NewComment string `json:"new_comment" validate:"required"`
}

type UpdateNamespaceLogCommentRequest struct {
	LogId      int32  `json:"log_id" validate:"required"`
	NewComment string `json:"new_comment" validate:"required"`
}
