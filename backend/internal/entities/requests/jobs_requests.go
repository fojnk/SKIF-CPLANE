package requests

type ListJobsRequest struct {
	EntityType *string `json:"entity_type,omitempty"`
	EntityID   *int32  `json:"entity_id,omitempty"`
	Type       *string `json:"type,omitempty"`
	Status     *string `json:"status,omitempty"`
	CreatedBy  *string `json:"created_by,omitempty"`
	Limit      int32   `json:"limit" validate:"omitempty,min=1,max=100"`
	Offset     *int32  `json:"offset,omitempty"`
	Sort       *string `json:"sort,omitempty"`
	Order      *string `json:"order,omitempty"`
}

type GetJobRequest struct {
	JobID int64 `json:"job_id" validate:"required,min=1"`
}

type GetJobEventsRequest struct {
	JobID     int64   `json:"job_id" validate:"required,min=1"`
	EventType *string `json:"event_type,omitempty"`
	Limit     *int32  `json:"limit,omitempty" validate:"omitempty,min=1,max=200"`
	Offset    *int32  `json:"offset,omitempty"`
}

type ListAllEventsRequest struct {
	JobID      *int64  `json:"job_id,omitempty"`
	EntityType *string `json:"entity_type,omitempty"`
	EntityID   *int64  `json:"entity_id,omitempty"`
	EventType  *string `json:"event_type,omitempty"`
	JobType    *string `json:"job_type,omitempty"`
	Limit      *int32  `json:"limit,omitempty" validate:"omitempty,min=1,max=200"`
	Offset     *int32  `json:"offset,omitempty"`
	Sort       *string `json:"sort,omitempty"`
	Order      *string `json:"order,omitempty"`
}

type CancelJobRequest struct {
	JobID int64 `json:"job_id" validate:"required,min=1"`
}

type RetryJobRequest struct {
	JobID int64 `json:"job_id" validate:"required,min=1"`
}

type GetJobTasksRequest struct {
	JobID  int64   `json:"job_id" validate:"required,min=1"`
	Status *string `json:"status,omitempty"`
}
