package responses

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients"

type ListJobsResponse struct {
	Jobs  *[]clients.Job `json:"jobs,omitempty"`
	Total *int32         `json:"total,omitempty"`
	Pages int64          `json:"pages"`
}