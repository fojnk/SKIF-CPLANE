package dto

import "time"

type ExperimentUpdateLog struct {
	ID        int32     `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	Act       string    `json:"act"`
	User      string    `json:"user"`
	Comment   string    `json:"comment"`
	JobID     *int64    `json:"job_id,omitempty"`
}

type DatasetUpdateLog struct {
	ID        int32     `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	Act       string    `json:"act"`
	User      string    `json:"user"`
	Comment   string    `json:"comment"`
	JobID     *int64    `json:"job_id,omitempty"`
}

type ProjectUpdateLog struct {
	ID        int32     `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	Act       string    `json:"act"`
	User      string    `json:"user"`
	Comment   string    `json:"comment"`
}

type NamespaceUpdateLog struct {
	ID        int32     `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	Act       string    `json:"act"`
	User      string    `json:"user"`
	Comment   string    `json:"comment"`
}
