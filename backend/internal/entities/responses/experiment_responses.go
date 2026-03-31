package responses

import (
	"encoding/json"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
)

type GetExperimentURLsResponse struct {
	URLs []dto.ExperimentURL `json:"urls"`
}

type CheckExperimentUpdateResponse struct {
	HasNotAppliedChanges bool   `json:"has_not_applied_changes"`
	SavedConfig          string `json:"saved_config"`
	AppliedConfig        string `json:"applied_config"`
}

type UpdateExperimentDatasetResponse struct {
	LinkID int32  `json:"link_id"`
	Alias  string `json:"alias"`
}

type UpdateExperimentDatasetV2Response struct {
	DatasetID int32  `json:"dataset_id"`
	Alias        string `json:"alias"`
}

type GetExperimentDatasetsResponse struct {
	Datasets []dto.ExperimentDataset `json:"datasets"`
}

type GetExperimentAvailableDatasetsToLinkResponse struct {
	Datasets []dto.DatasetShort `json:"datasets"`
	Pages       int64                 `json:"pages"`
	Total       int64                 `json:"total"`
}

type AddDatasetToExperimentResponse struct {
	LinkID       int32  `json:"link_id"`
	Alias        string `json:"alias"`
	DatasetID int32  `json:"dataset_id"`
	Name         string `json:"name"`
	ProjectID    int32  `json:"project_id"`
	ProjectName  string `json:"project_name"`
}

type GetCompleteExperimentsResponse struct {
	dto.CompleteExperiment
	Rights []acl.Right `json:"rights"`
}

// MarshalJSON includes rights. Embeddable dto.CompleteExperiment has its own MarshalJSON; without this,
// encoding/json would marshal only the DTO and drop rights.
func (r GetCompleteExperimentsResponse) MarshalJSON() ([]byte, error) {
	type Alias dto.CompleteExperiment
	return json.Marshal(struct {
		Alias
		Rights         []acl.Right `json:"rights"`
		ExperimentID   int32       `json:"experiment_id"`
		ExperimentName string      `json:"experiment_name"`
		ModelID        int32       `json:"model_id"`
		ModelName      string      `json:"model_name"`
	}{
		Alias:          Alias(r.CompleteExperiment),
		Rights:         r.Rights,
		ExperimentID:   r.ID,
		ExperimentName: r.Name,
		ModelID:        r.ID,
		ModelName:      r.Name,
	})
}

type ListCompleteExperimentsResponse struct {
	Experiments []dto.CompleteExperimentList `json:"experiments"`
}

type UpdateCompleteExperimentResponse struct {
	dto.CompleteExperiment
}

type CreateCompleteExperimentResponse struct {
	dto.CompleteExperiment
}

type CopyCompleteExperimentResponse struct {
	dto.CompleteExperiment
}

type ExperimentStatusResponse struct {
	Status  dto.ExperimentStatus `json:"status"`
	Summary string             `json:"summary"`
	Message string             `json:"message"`

	Debug string `json:"debug"`
}

type ExperimentValidationResponse struct {
	Status  dto.ExperimentStatus `json:"status"`
	Summary string             `json:"summary"`
	Message string             `json:"message"`

	Debug string `json:"debug"`
}

type SaveAppliedConfigResponse struct {
	Saved int64 `json:"saved"`
}

type ExperimentJobResponse struct {
	JobID int64 `json:"job_id"`
}

func (r UpdateExperimentDatasetV2Response) MarshalJSON() ([]byte, error) {
	type Alias UpdateExperimentDatasetV2Response
	return json.Marshal(struct {
		Alias
		DatasetID int32 `json:"dataset_id"`
	}{
		Alias:     Alias(r),
		DatasetID: r.DatasetID,
	})
}

func (r GetExperimentDatasetsResponse) MarshalJSON() ([]byte, error) {
	type Alias GetExperimentDatasetsResponse
	return json.Marshal(struct {
		Alias
		Datasets []dto.ExperimentDataset `json:"datasets"`
	}{
		Alias:    Alias(r),
		Datasets: r.Datasets,
	})
}

func (r GetExperimentAvailableDatasetsToLinkResponse) MarshalJSON() ([]byte, error) {
	type Alias GetExperimentAvailableDatasetsToLinkResponse
	return json.Marshal(struct {
		Alias
		Datasets []dto.DatasetShort `json:"datasets"`
	}{
		Alias:    Alias(r),
		Datasets: r.Datasets,
	})
}

func (r AddDatasetToExperimentResponse) MarshalJSON() ([]byte, error) {
	type Alias AddDatasetToExperimentResponse
	return json.Marshal(struct {
		Alias
		DatasetID      int32  `json:"dataset_id"`
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
	}{
		Alias:          Alias(r),
		DatasetID:      r.DatasetID,
		ExperimentID:   r.ProjectID,
		ExperimentName: r.ProjectName,
	})
}

func (r ListCompleteExperimentsResponse) MarshalJSON() ([]byte, error) {
	type Alias ListCompleteExperimentsResponse
	return json.Marshal(struct {
		Alias
		Experiments []dto.CompleteExperimentList `json:"experiments"`
		Models      []dto.CompleteExperimentList `json:"models"`
	}{
		Alias:       Alias(r),
		Experiments: r.Experiments,
		Models:      r.Experiments,
	})
}
