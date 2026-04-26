package clients

// Types kept for JSON / swagger responses after the jobd service was removed.
// Handlers return empty lists or errors; these shapes match the former OpenAPI models.

// JobStage этап пайплайна (супервизор / бывший jobd stages).
type JobStage struct {
	StepID       *int64  `json:"step_id,omitempty"`
	Name         *string `json:"name,omitempty"`
	Description  *string `json:"description,omitempty"`
	StepStatus   *string `json:"step_status,omitempty"`
}

type Job struct {
	Id                *int64      `json:"id,omitempty"`
	Status            *string     `json:"status,omitempty"`
	Type              *string     `json:"type,omitempty"`
	CreatedAt         *string     `json:"created_at,omitempty"`
	CreatedBy         *string     `json:"created_by,omitempty"`
	StatusDescription *string     `json:"status_description,omitempty"`
	Name              *string     `json:"name,omitempty"`
	Stages            *[]JobStage `json:"stages,omitempty"`
}

type Event struct{}

type EventWithJob struct{}

type Task struct{}

type GetJobResponse struct {
	Job *Job `json:"job,omitempty"`
}

type ListEventsResponse struct {
	Events *[]Event `json:"events,omitempty"`
	Total  *int32   `json:"total,omitempty"`
}

type ListAllEventsResponse struct {
	Events *[]EventWithJob `json:"events,omitempty"`
	Total  *int32          `json:"total,omitempty"`
}

type ListTasksResponse struct {
	Tasks *[]Task `json:"tasks,omitempty"`
}
