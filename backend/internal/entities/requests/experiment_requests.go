package requests

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
)

type ExperimentStartRequest struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	Comment    string `json:"comment"`
}

type ExperimentCheckUpdateRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
}

type ExperimentStopRequest struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	Comment    string `json:"comment"`
}

type ExperimentStatusRequest struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	Comment    string `json:"comment"`
}

type ApplyExperimentConfigRequest struct {
	ExperimentID  int32  `json:"experiment_id" validate:"required"`
	Comment     string `json:"comment"`
	SingleStage *bool  `json:"single_stage,omitempty"`
}

type ApplyExperimentDatasetRequest struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	Comment    string `json:"comment"`
	AgentURL   string `json:"agent_url"`
}

type CleanExperimentQueueRequest struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	Comment    string `json:"comment"`
}

type SaveAppliedVersionForExperimentsRequest struct {
	ExperimentIDs []int32 `json:"experiment_ids" validate:"required"`
}

type AddDatasetToExperimentRequest struct {
	ExperimentID   int32  `json:"experiment_id" validate:"required"`
	DatasetID int32  `json:"dataset_id" validate:"required"`
	Alias        string `json:"alias" validate:"required"`
	Comment      string `json:"comment"`
}

type RemoveDatasetFromExperimentRequest struct {
	LinkID     int32 `json:"link_id" validate:"required"`
	ExperimentID int32 `json:"experiment_id" validate:"required"`
}

type RemoveDatasetFromExperimentV2Request struct {
	Alias      string `json:"alias" validate:"required"`
	ExperimentID int32  `json:"experiment_id" validate:"required"`
}

type GetExperimentDatasetsRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
}

type GetDatasetFromExperimentV2Request struct {
	Alias      string `json:"alias" validate:"required"`
	ExperimentID int32  `json:"experiment_id" validate:"required"`
}

type GetExperimentAvailableDatasetsToLinkRequest struct {
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	Offset     *int32 `validate:"required"`
	Limit      int32  `validate:"required,min=1,max=100"`
	Filters    dto.DatasetFilters
}

type UpdateExperimentDatasetRequest struct {
	LinkID     int32  `json:"link_id" validate:"required"`
	ExperimentID int32  `json:"experiment_id" validate:"required"`
	Alias      string `json:"alias" validate:"required"`
	Comment    string `json:"comment"`
}

type UpdateExperimentDatasetV2Request struct {
	DatasetID int32  `json:"dataset_id" validate:"required"`
	ExperimentID   int32  `json:"experiment_id" validate:"required"`
	Alias        string `json:"alias" validate:"required"`
	Comment      string `json:"comment"`
}

type GetExperimentURLsRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
}

type GetExperimentGrafanaURLRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
}

type CreateCompleteExperimentRequest struct {
	ProjectID   int32  `json:"project_id" validate:"required"`
	Name        string `json:"name" validate:"required,min=1,max=128"`
	Description string `json:"description" validate:"min=0,max=256"`
	Comment     string `json:"comment"`
}

type CopyCompleteExperimentRequest struct {
	ProjectID     int32  `json:"project_id" validate:"required"`
	SrcExperimentID int32  `json:"src_experiment_id" validate:"required"`
	Name          string `json:"name" validate:"required,min=1,max=128"`
	Description   string `json:"description" validate:"min=0,max=256"`
}

type DeleteCompleteExperimentRequest struct {
	ID int32 `json:"id" validate:"required"`
}

type UpdateCompleteExperimentRequest struct {
	ExperimentID            int32  `json:"experiment_id" validate:"required"`
	Name                  string `json:"name" validate:"max=128"`
	Description           string `json:"description" validate:"min=0,max=256"`
	Config                string `json:"config"`
	Comment               string `json:"comment"`
	DisableValidation     bool   `json:"disable_validation"`
	AdditionalInformation string `json:"additional_information"`
}

type GetCompleteExperimentRequest struct {
	ExperimentID int32 `validate:"required"`
}

type CompleteExperimentValidateRequest struct {
	ExperimentConfig string `validate:"required"`
	ExperimentID     int32
}
type ListCompleteExperimentsRequest struct {
	ProjectID int32 `validate:"required"`
}

type ExperimentValidateFastRequest struct {
	ExperimentConfig string `json:"config" validate:"required"`
	ExperimentID     int32  `json:"experiment_id"`
}

type ExperimentValidateRunRequest struct {
	ExperimentConfig     string                        `json:"config" validate:"required" example:"{\"Meta\":{\"ExperimentId\":\"1\",\"ProjectId\":\"1\",\"Namespace\":\"test\",\"AbcProductId\":\"1\",\"YT\":{\"Token\":\"test\",\"WorkDir\":\"//test\",\"Cluster\":\"test\",\"ProxyRole\":\"test\"}},\"Placement\":{\"OnecloudDatacenters\":[\"kc\"]},\"Resources\":{\"Worker\":{\"ReplicasInDc\":1,\"CpuCores\":1,\"RamMB\":512,\"NetworkInMbit\":256,\"NetworkOutMbit\":20},\"Resharder\":{\"ReplicasInDc\":1,\"CpuCores\":1,\"RamMB\":512,\"NetworkInMbit\":256,\"NetworkOutMbit\":20}},\"Worker\":{\"GraphConfig\":{\"Name\":\"Test\",\"Cubes\":[]}},\"Resharder\":{\"InputSources\":[],\"IntermediateQueueOptions\":{\"ShardsCount\":1}},\"PublicSources\":{},\"InternalSources\":{}}"`
	ExperimentID         int32                         `json:"experiment_id" example:"1"`
	DataSets           *[][]ExperimentValidateDataItem `json:"data_sets,omitempty"`
	ShouldReadYtSample *bool                         `json:"should_read_yt_sample,omitempty" example:"false"`
}

type ExperimentValidateDataItem struct {
	SourceName string `json:"source_name" example:"input_queue"`
	OutputName string `json:"output_name,omitempty" example:"output_queue"`
	Data       string `json:"data" example:"[{\"id\"=1};{\"id\"=2}]"`
}
