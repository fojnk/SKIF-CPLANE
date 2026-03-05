package dto

import (
	"encoding/json"
	"time"
)

type ExperimentStatus string

type ExperimentURL struct {
	URL  string `json:"url"`
	Name string `json:"name"`
}

type ExperimentDataset struct {
	DatasetID int32  `json:"dataset_id"`
	LinkID       int32  `json:"link_id"`
	Name         string `json:"name"`
	Alias        string `json:"alias"`
	ProjectID    int32  `json:"project_id"`
	ProjectName  string `json:"project_name"`
}

type CompleteExperimentList struct {
	ID     int32          `json:"id"`
	Name   string         `json:"name"`
	Status ExperimentStatus `json:"status"`
}

type CompleteExperiment struct {
	ID                    int32          `json:"id"`
	Name                  string         `json:"name"`
	Description           string         `json:"description"`
	Status                ExperimentStatus `json:"status"`
	Config                string         `json:"config"`
	ProjectID             int32          `json:"project_id"`
	ProjectName           string         `json:"project_name"`
	AdditionalInformation string         `json:"additional_information"`
}

type ExperimentTemplate struct {
	ID              int32     `json:"id"`
	VersionID       int32     `json:"version_id"`
	ParentVersionID int32     `json:"parent_version_id"`
	Config          string    `json:"config"`
	CreatedAt       time.Time `json:"created_at"`
	Comment         string    `json:"comment"`
	Creator         string    `json:"creator"`
}

func (p ExperimentDataset) MarshalJSON() ([]byte, error) {
	type Alias ExperimentDataset
	return json.Marshal(struct {
		Alias
		DatasetID      int32  `json:"dataset_id"`
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
	}{
		Alias:          Alias(p),
		DatasetID:      p.DatasetID,
		ExperimentID:   p.ProjectID,
		ExperimentName: p.ProjectName,
	})
}

func (p CompleteExperimentList) MarshalJSON() ([]byte, error) {
	type Alias CompleteExperimentList
	return json.Marshal(struct {
		Alias
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
		ModelID        int32  `json:"model_id"`
		ModelName      string `json:"model_name"`
	}{
		Alias:          Alias(p),
		ExperimentID:   p.ID,
		ExperimentName: p.Name,
		ModelID:        p.ID,
		ModelName:      p.Name,
	})
}

func (p CompleteExperiment) MarshalJSON() ([]byte, error) {
	type Alias CompleteExperiment
	return json.Marshal(struct {
		Alias
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
		ModelID        int32  `json:"model_id"`
		ModelName      string `json:"model_name"`
	}{
		Alias:          Alias(p),
		ExperimentID:   p.ID,
		ExperimentName: p.Name,
		ModelID:        p.ID,
		ModelName:      p.Name,
	})
}
