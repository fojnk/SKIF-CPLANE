package requests

type ListDatasetsByNamespaceRequest struct {
	NamespaceID int32 `validate:"required"`
}

type ListDatasetsRequest struct {
	Offset *int32 `validate:"required"`
	Limit  int32  `validate:"required,min=1,max=100"`
	Search string
}

type GetDatasetRequest struct {
	DatasetID int32 `validate:"required"`
}

type GetDatasetLinkedExperimentsRequest struct {
	DatasetID int32  `validate:"required"`
	Offset       *int32 `validate:"required"`
	Limit        int32  `validate:"required,min=1,max=100"`
}

type DeleteDatasetRequest struct {
	ID int32 `json:"id" validate:"required"`
}

// PROJECT CONNECTION v2

type CreateDatasetRequestV2 struct {
	ProjectID int32  `json:"project_id" validate:"required"`
	Name      string `json:"name" validate:"required,max=128"`
	Type      string `json:"type" validate:"required,max=64,oneof=json kafka"`
	Params    string `json:"params"`
	Schema    string `json:"schema"`
	Public    bool   `json:"public"`
	Comment   string `json:"comment"`
}

type ListDatasetsByProjectRequest struct {
	ProjectID int32 `json:"project_id" validate:"required"`
}

type CopyDatasetRequestV2 struct {
	ProjectID       int32  `json:"project_id"`
	SrcDatasetID int32  `json:"src_dataset_id" validate:"required"`
	Name            string `json:"name" validate:"required,max=128"`
}

type UpdateDatasetRequestV2 struct {
	ID                int32  `json:"id" validate:"required"`
	Name              string `json:"name" validate:"max=128"`
	Type              string `json:"type" validate:"omitempty,max=64,oneof=json kafka"`
	Schema            string `json:"schema"`
	Params            string `json:"params"`
	Public            *bool  `json:"public" extensions:"x-nullable"`
	Comment           string `json:"comment"`
	DisableValidation bool   `json:"disable_validation"`
}

type DatasetValidateRequest struct {
	DatasetConfig string `validate:"required"`
}

type SearchDatasetsRequest struct {
	Offset      *int32 `validate:"required"`
	Limit       int32  `validate:"required,min=1,max=100"`
	Search      string `json:"search"`
	ProjectID   int32  `json:"project_id"`
	Public      *bool  `json:"public" extensions:"x-nullable"`
	Type        string `json:"type" validate:"max=64"`
	NamespaceID int32  `json:"namespace_id"`
	Cluster     string `json:"cluster"`
	Path        string `json:"path"`
	OrderBy     string `json:"order_by"`
	// Опция полнотекстового поиска
	ExactMatch *bool `json:"exact_match" extensions:"x-nullable"`
}

type GetAvailableDatasetClustersRequest struct {
}

type GetDatasetYTLinkRequest struct {
	DatasetID int32 `validate:"required"`
}

type ApplyDatasetRequest struct {
	DatasetID int32  `json:"dataset_id" validate:"required"`
	Comment      string `json:"comment"`
}
