package dto

import "time"

type ExperimentVersion struct {
	ID        int32     `json:"id"`
	VersionID int32     `json:"version_id"`
	Creator   string    `json:"creator"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"created_at"`
}

type ExperimentVariableVersion struct {
	ID           int32     `json:"id"`
	VersionID    int32     `json:"version_id"`
	Creator      string    `json:"creator"`
	Comment      string    `json:"comment"`
	VariableID   int32     `json:"variable_id"`
	VariableName string    `json:"variable_name"`
	VariableType string    `json:"variable_type"`
	CreatedAt    time.Time `json:"created_at"`
	Head         bool      `json:"head"`
}

type DatasetVersion struct {
	ID        int32     `json:"id"`
	VersionID int32     `json:"version_id"`
	Creator   string    `json:"creator"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"created_at"`
}

type ExperimentVariableVersionTemplate struct {
	ID        int32     `json:"id"`
	VersionID int32     `json:"version_id"`
	Type      string    `json:"type"`
	Value     string    `json:"value"`
	Creator   string    `json:"creator"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"created_at"`
}

type DatasetVersionTemplate struct {
	ID        int32     `json:"id"`
	VersionID int32     `json:"version_id"`
	Type      string    `json:"type"`
	Params    string    `json:"params"`
	Schema    string    `json:"schema"`
	Public    bool      `json:"public"`
	Creator   string    `json:"creator"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"created_at"`
}
