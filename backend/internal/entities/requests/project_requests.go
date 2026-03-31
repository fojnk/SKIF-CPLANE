package requests

type GetProjectConfigRequest struct {
	ConfigID int32 `validate:"required"`
}

type ListProjectConfigsRequest struct {
	ProjectID int32 `validate:"required"`
}

type ProjectValidateRequest struct {
	ProjectConfig string `validate:"required"`
}

type GetProjectRequest struct {
	ProjectID int32 `validate:"required"`
}

type GetProjectLinksRequest struct {
	ProjectID int32 `validate:"required"`
}

type UpdateProjectRequest struct {
	ID                int32  `json:"id" validate:"required"`
	Name              string `json:"name" validate:"max=128"`
	Description       string `json:"description"`
	Config            string `json:"config"`
	Comment           string `json:"comment"`
	DisableValidation bool   `json:"disable_validation"`
}

type DeleteProjectRequest struct {
	ID int32 `json:"id" validate:"required"`
}

type DeletePinnedProjectRequest struct {
	ProjectID int32 `json:"project_id" validate:"required"`
}

type ListProjectsRequest struct {
	NamespaceID int32 `validate:"required"`
}

type ListPinnedProjectsRequest struct {
}

type CreateProjectRequest struct {
	NamespaceID int32  `json:"namespace_id" validate:"required"`
	Name        string `json:"name" validate:"required,max=128"`
	Description string `json:"description"`
	Comment     string `json:"comment"`
}

type AddPinnedRequest struct {
	ProjectID int32 `json:"project_id" validate:"required"`
}

type ListProjectsRequestV2 struct {
	Offset      *int32 `validate:"required"`
	Limit       int32  `validate:"required,min=1,max=100"`
	Search      string `json:"search"`
	NamespaceID int32  `json:"namespace_id"`
	OrderBy     string `json:"order_by"`
}
