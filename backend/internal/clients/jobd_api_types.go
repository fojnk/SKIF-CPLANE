package clients

// Types kept for JSON / swagger responses after the jobd service was removed.
// Handlers return empty lists or errors; these shapes match the former OpenAPI models.

type Job struct {
	Id     *int64  `json:"id,omitempty"`
	Status *string `json:"status,omitempty"`
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
