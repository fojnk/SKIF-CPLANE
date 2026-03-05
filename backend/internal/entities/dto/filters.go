package dto

import "encoding/json"

type DatasetFilters struct {
	Search      string `json:"search"`
	ProjectID   int32  `json:"project_id"`
	Public      *bool  `json:"public" extensions:"x-nullable"`
	Managed     *bool  `json:"managed" extensions:"x-nullable"`
	NamespaceID int32  `json:"namespace_id"`
	Cluster     string `json:"cluster"`
	Path        string `json:"path"`
}

func (f DatasetFilters) MarshalJSON() ([]byte, error) {
	type Alias DatasetFilters
	return json.Marshal(struct {
		Alias
		ExperimentID int32 `json:"experiment_id"`
		WorkspaceID  int32 `json:"workspace_id"`
	}{
		Alias:        Alias(f),
		ExperimentID: f.ProjectID,
		WorkspaceID:  f.NamespaceID,
	})
}
