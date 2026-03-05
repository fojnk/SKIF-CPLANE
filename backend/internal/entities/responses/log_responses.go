package responses

import (
	"time"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
)

type ListNamespaceUpdateLogsResponse struct {
	Pages int64                    `json:"pages"`
	Total int64                    `json:"total"`
	Logs  []dto.NamespaceUpdateLog `json:"logs"`
}

type GetNamespaceLogResponse struct {
	ID        int32                         `json:"id"`
	Name      string                        `json:"name"`
	CreatedAt time.Time                     `json:"created_at"`
	Act       string                        `json:"act"`
	User      string                        `json:"user"`
	Details   update_log.NamespaceUpdateLog `json:"details"`
	Comment   string                        `json:"comment"`
}

type ListProjectUpdateLogsResponse struct {
	Pages int64                  `json:"pages"`
	Total int64                  `json:"total"`
	Logs  []dto.ProjectUpdateLog `json:"logs"`
}

type GetProjectLogResponse struct {
	ID        int32                       `json:"id"`
	Name      string                      `json:"name"`
	CreatedAt time.Time                   `json:"created_at"`
	Act       string                      `json:"act"`
	User      string                      `json:"user"`
	Details   update_log.ProjectUpdateLog `json:"details"`
	Comment   string                      `json:"comment"`
}

type ListDatasetUpdateLogsResponse struct {
	Pages int64                     `json:"pages"`
	Total int64                     `json:"total"`
	Logs  []dto.DatasetUpdateLog `json:"logs"`
}

type GetDatasetLogResponse struct {
	ID        int32                          `json:"id"`
	Name      string                         `json:"name"`
	CreatedAt time.Time                      `json:"created_at"`
	Act       string                         `json:"act"`
	User      string                         `json:"user"`
	Details   update_log.DatasetUpdateLog `json:"details"`
	Comment   string                         `json:"comment"`
	JobID     *int64                         `json:"job_id,omitempty"`
}

type ListExperimentUpdateLogsResponse struct {
	Pages int64                   `json:"pages"`
	Total int64                   `json:"total"`
	Logs  []dto.ExperimentUpdateLog `json:"logs"`
}

type GetExperimentLogResponse struct {
	ID        int32                        `json:"id"`
	Name      string                       `json:"name"`
	CreatedAt time.Time                    `json:"created_at"`
	Act       string                       `json:"act"`
	User      string                       `json:"user"`
	Details   update_log.ExperimentUpdateLog `json:"details"`
	Comment   string                       `json:"comment"`
	JobID     *int64                       `json:"job_id,omitempty"`
}
