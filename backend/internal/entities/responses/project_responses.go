package responses

import (
	"encoding/json"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
)

type CreateProjectResponse struct {
	ID          int32  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type AddPinnedProjectResponse struct {
	ID          int32  `json:"id"`
	ProjectID   int32  `json:"project_id"`
	ProjectName string `json:"project_name"`
}

type ListProjectsResponse struct {
	Projects []dto.Project `json:"projects"`
}

type ListPinnedProjectsResponse struct {
	PinnedProjects []dto.PinnedProject `json:"pinned_projects"`
}

type GetProjectResponse struct {
	Project dto.Project `json:"project"`
	Rights  []acl.Right `json:"rights"`
}

type GetProjectV2Response struct {
	ID            int32       `json:"id"`
	Name          string      `json:"name"`
	Description   string      `json:"description"`
	Config        string      `json:"config"`
	NamespaceName string      `json:"namespace_name"`
	NamespaceID   int32       `json:"namespace_id"`
	Rights        []acl.Right `json:"rights"`
	IsPinned      bool        `json:"is_pinned"`
}

type ListProjectConfigsResponse struct {
	Configs []dto.ProjectConfigVersion `json:"configs"`
}

type UpdateProjectResponse struct {
	Project dto.Project `json:"project"`
}

type GetProjectConfigResponse struct {
	Config dto.ProjectConfig `json:"config"`
}

type ListProjectsResponseV2 struct {
	Pages    int64             `json:"pages"`
	Total    int64             `json:"total"`
	Projects []dto.ProjectInfo `json:"projects"`
}

type GetProjectsURLSResponse struct {
	URLs []dto.ProjectURL `json:"urls"`
}

type CreateProjectRolesResponse struct {
	RolesCreated int32 `json:"roles_created"`
}

type ValidationResponse struct {
	Errors  string `json:"errors"`
	Success bool   `json:"success"`
}

func (r AddPinnedProjectResponse) MarshalJSON() ([]byte, error) {
	type Alias AddPinnedProjectResponse
	return json.Marshal(struct {
		Alias
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
	}{
		Alias:          Alias(r),
		ExperimentID:   r.ProjectID,
		ExperimentName: r.ProjectName,
	})
}

func (r ListProjectsResponse) MarshalJSON() ([]byte, error) {
	type Alias ListProjectsResponse
	return json.Marshal(struct {
		Alias
		Experiments []dto.Project `json:"experiments"`
	}{
		Alias:       Alias(r),
		Experiments: r.Projects,
	})
}

func (r ListPinnedProjectsResponse) MarshalJSON() ([]byte, error) {
	type Alias ListPinnedProjectsResponse
	return json.Marshal(struct {
		Alias
		PinnedExperiments []dto.PinnedProject `json:"pinned_experiments"`
	}{
		Alias:             Alias(r),
		PinnedExperiments: r.PinnedProjects,
	})
}

func (r GetProjectResponse) MarshalJSON() ([]byte, error) {
	type Alias GetProjectResponse
	return json.Marshal(struct {
		Alias
		Experiment dto.Project `json:"experiment"`
	}{
		Alias:      Alias(r),
		Experiment: r.Project,
	})
}

func (r GetProjectV2Response) MarshalJSON() ([]byte, error) {
	type Alias GetProjectV2Response
	return json.Marshal(struct {
		Alias
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
		WorkspaceID    int32  `json:"workspace_id"`
		WorkspaceName  string `json:"workspace_name"`
	}{
		Alias:          Alias(r),
		ExperimentID:   r.ID,
		ExperimentName: r.Name,
		WorkspaceID:    r.NamespaceID,
		WorkspaceName:  r.NamespaceName,
	})
}

func (r UpdateProjectResponse) MarshalJSON() ([]byte, error) {
	type Alias UpdateProjectResponse
	return json.Marshal(struct {
		Alias
		Experiment dto.Project `json:"experiment"`
	}{
		Alias:      Alias(r),
		Experiment: r.Project,
	})
}

func (r ListProjectsResponseV2) MarshalJSON() ([]byte, error) {
	type Alias ListProjectsResponseV2
	return json.Marshal(struct {
		Alias
		Experiments []dto.ProjectInfo `json:"experiments"`
	}{
		Alias:       Alias(r),
		Experiments: r.Projects,
	})
}
