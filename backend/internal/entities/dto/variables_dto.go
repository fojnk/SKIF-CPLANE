package dto

import "time"

type ExperimentVariableForUpdate struct {
	ID    int32  `json:"id" validate:"required"`
	Name  string `json:"name" validate:"required"`
	Value string `json:"value" validate:"required"`
	Type  string `json:"type" validate:"required,oneof=string int json yql python"`
}

type ExperimentVariableForCreate struct {
	Name  string `json:"name" validate:"required"`
	Value string `json:"value" validate:"required"`
	Type  string `json:"type" validate:"required,oneof=string int json yql python"`
}

type ExperimentVariable struct {
	ID            int32  `json:"id" validate:"required"`
	Name          string `json:"name" validate:"required"`
	Value         string `json:"value" validate:"required"`
	Type          string `json:"type" validate:"required,oneof=string int json yql python"`
	VersionID     int32  `json:"version_id"`
	VersionIDName int32  `json:"version_id_name"`
	ExperimentID    int32  `json:"-"` // Internal field, not exposed in API
}

type ExperimentVariableShort struct {
	ID            int32     `json:"id" validate:"required"`
	Name          string    `json:"name" validate:"required"`
	Type          string    `json:"type" validate:"required,oneof=string int json yql python"`
	VersionID     int32     `json:"version_id"`
	VersionIDName int32     `json:"version_id_name"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type ExperimentVariableV2 struct {
	Name      string `json:"name" validate:"required"`
	Value     string `json:"value" validate:"required"`
	Type      string `json:"type" validate:"required,oneof=string int json yql python"`
	VersionID int32  `json:"version_id"`
}

type ExperimentVariableShortV2 struct {
	Name string `json:"name" validate:"required"`
	Type string `json:"type" validate:"required,oneof=string int json yql python"`
}
