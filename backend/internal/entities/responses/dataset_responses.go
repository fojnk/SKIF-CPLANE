package responses

import (
	"encoding/json"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
)

type UpdateDatasetResponse struct {
	Dataset dto.Dataset `json:"dataset"`
}

type GetDatasetResponse struct {
	Dataset  dto.Dataset `json:"dataset"`
	ProjectID   int32          `json:"project_id"`
	ProjectName string         `json:"project_name"`
	Rights      []acl.Right    `json:"rights"`
}

type ListDatasetsResponse struct {
	Datasets []dto.Dataset `json:"datasets"`
}

type CopyDatasetResponse struct {
	ID      int32  `json:"id"`
	Name    string `json:"name"`
	Type    string `json:"type"`
	Params  string `json:"params"`
	Schema  string `json:"schema"`
	Public  bool   `json:"public"`
}

type CreateDatasetResponse struct {
	ID      int32  `json:"id"`
	Name    string `json:"name"`
	Type    string `json:"type"`
	Params  string `json:"params"`
	Schema  string `json:"schema"`
	Public  bool   `json:"public"`
}

type ListAllDatasetResponse struct {
	Pages       int64            `json:"pages"`
	Total       int64            `json:"total"`
	Datasets []dto.Dataset `json:"datasets"`
}

type SearchDatasetsResponse struct {
	Pages       int64                `json:"pages"`
	Total       int64                `json:"total"`
	Datasets []dto.DatasetInfo `json:"datasets"`
}

type GetDatasetV2Response struct {
	ID          int32       `json:"id"`
	Name        string      `json:"name"`
	Type        string      `json:"type"`
	Params      string      `json:"params"`
	Schema      string      `json:"schema"`
	Public      bool        `json:"public"`
	ProjectID   int32       `json:"project_id"`
	ProjectName string      `json:"project_name"`
	Rights      []acl.Right `json:"rights"`
}

type DatasetExperimentLinksResponse struct {
	Links []dto.DatasetExperimentLink `json:"links"`
	Pages int64                        `json:"pages"`
	Total int64                        `json:"total"`
}

func (r UpdateDatasetResponse) MarshalJSON() ([]byte, error) {
	type Alias UpdateDatasetResponse
	return json.Marshal(struct {
		Alias
		Dataset dto.Dataset `json:"dataset"`
	}{
		Alias:   Alias(r),
		Dataset: r.Dataset,
	})
}

func (r GetDatasetResponse) MarshalJSON() ([]byte, error) {
	type Alias GetDatasetResponse
	return json.Marshal(struct {
		Alias
		Dataset        dto.Dataset `json:"dataset"`
		ExperimentID   int32          `json:"experiment_id"`
		ExperimentName string         `json:"experiment_name"`
	}{
		Alias:          Alias(r),
		Dataset:        r.Dataset,
		ExperimentID:   r.ProjectID,
		ExperimentName: r.ProjectName,
	})
}

func (r ListDatasetsResponse) MarshalJSON() ([]byte, error) {
	type Alias ListDatasetsResponse
	return json.Marshal(struct {
		Alias
		Datasets []dto.Dataset `json:"datasets"`
	}{
		Alias:    Alias(r),
		Datasets: r.Datasets,
	})
}

func (r ListAllDatasetResponse) MarshalJSON() ([]byte, error) {
	type Alias ListAllDatasetResponse
	return json.Marshal(struct {
		Alias
		Datasets []dto.Dataset `json:"datasets"`
	}{
		Alias:    Alias(r),
		Datasets: r.Datasets,
	})
}

func (r SearchDatasetsResponse) MarshalJSON() ([]byte, error) {
	type Alias SearchDatasetsResponse
	return json.Marshal(struct {
		Alias
		Datasets []dto.DatasetInfo `json:"datasets"`
	}{
		Alias:    Alias(r),
		Datasets: r.Datasets,
	})
}

func (r GetDatasetV2Response) MarshalJSON() ([]byte, error) {
	type Alias GetDatasetV2Response
	return json.Marshal(struct {
		Alias
		DatasetID      int32  `json:"dataset_id"`
		DatasetName    string `json:"dataset_name"`
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
	}{
		Alias:          Alias(r),
		DatasetID:      r.ID,
		DatasetName:    r.Name,
		ExperimentID:   r.ProjectID,
		ExperimentName: r.ProjectName,
	})
}
