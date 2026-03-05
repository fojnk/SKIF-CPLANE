package dto

import (
	"encoding/json"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"time"
)

type Project struct {
	ID            int32  `json:"id"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	Config        string `json:"config"`
	NamespaceName string `json:"namespace_name"`
	NamespaceID   int32  `json:"namespace_id"`
	IsPinned      bool   `json:"is_pinned"`
}

type ProjectConfigVersion struct {
	ID        int32     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
}

type ProjectConfig struct {
	ID        int32     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Config    string    `json:"config"`
}

type ProjectInfo struct {
	ID              int32       `json:"id"`
	Name            string      `json:"name"`
	Description     string      `json:"description"`
	NamespaceID     int32       `json:"namespace_id"`
	NamespaceName   string      `json:"namespace_name"`
	ExperimentCount int64       `json:"experiment_count"`
	DatasetCount    int64       `json:"dataset_count"`
	UpdatedAt       time.Time   `json:"updated_at"`
	CreatedAt       time.Time   `json:"created_at"`
	Rights          []acl.Right `json:"rights"`
	IsPinned        bool        `json:"is_pinned"`
}

type ProjectCatalogInfo struct {
	ID            int32  `json:"id"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	NamespaceID   int32  `json:"namespace_id"`
	NamespaceName string `json:"namespace_name"`
}

type ProjectColumn struct {
	ProjectName string `json:"project_name"`
	ProjectID   int32  `json:"project_id"`
}

type PinnedProject struct {
	ID          int32  `json:"id"`
	ProjectName string `json:"project_name"`
	ProjectID   int32  `json:"project_id"`
}

type ProjectURL struct {
	URL  string `json:"url"`
	Name string `json:"name"`
}

func (p Project) MarshalJSON() ([]byte, error) {
	type Alias Project
	return json.Marshal(struct {
		Alias
		ProjectID      int32  `json:"project_id"`
		ProjectName    string `json:"project_name"`
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
		WorkspaceID    int32  `json:"workspace_id"`
		WorkspaceName  string `json:"workspace_name"`
	}{
		Alias:          Alias(p),
		ProjectID:      p.ID,
		ProjectName:    p.Name,
		ExperimentID:   p.ID,
		ExperimentName: p.Name,
		WorkspaceID:    p.NamespaceID,
		WorkspaceName:  p.NamespaceName,
	})
}

func (p ProjectInfo) MarshalJSON() ([]byte, error) {
	type Alias ProjectInfo
	return json.Marshal(struct {
		Alias
		ProjectID       int32  `json:"project_id"`
		ProjectName     string `json:"project_name"`
		ExperimentID    int32  `json:"experiment_id"`
		ExperimentName  string `json:"experiment_name"`
		WorkspaceID     int32  `json:"workspace_id"`
		WorkspaceName   string `json:"workspace_name"`
		ExperimentCount int64  `json:"experiment_count"`
		ModelCount      int64  `json:"model_count"`
		DatasetCount    int64  `json:"dataset_count"`
	}{
		Alias:           Alias(p),
		ProjectID:       p.ID,
		ProjectName:     p.Name,
		ExperimentID:    p.ID,
		ExperimentName:  p.Name,
		WorkspaceID:     p.NamespaceID,
		WorkspaceName:   p.NamespaceName,
		ExperimentCount: p.ExperimentCount,
		ModelCount:      p.ExperimentCount,
		DatasetCount:    p.DatasetCount,
	})
}

func (p ProjectCatalogInfo) MarshalJSON() ([]byte, error) {
	type Alias ProjectCatalogInfo
	return json.Marshal(struct {
		Alias
		ProjectID      int32  `json:"project_id"`
		ProjectName    string `json:"project_name"`
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
		WorkspaceID    int32  `json:"workspace_id"`
		WorkspaceName  string `json:"workspace_name"`
	}{
		Alias:          Alias(p),
		ProjectID:      p.ID,
		ProjectName:    p.Name,
		ExperimentID:   p.ID,
		ExperimentName: p.Name,
		WorkspaceID:    p.NamespaceID,
		WorkspaceName:  p.NamespaceName,
	})
}

func (p ProjectColumn) MarshalJSON() ([]byte, error) {
	type Alias ProjectColumn
	return json.Marshal(struct {
		Alias
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
	}{
		Alias:          Alias(p),
		ExperimentID:   p.ProjectID,
		ExperimentName: p.ProjectName,
	})
}

func (p PinnedProject) MarshalJSON() ([]byte, error) {
	type Alias PinnedProject
	return json.Marshal(struct {
		Alias
		ExperimentID   int32  `json:"experiment_id"`
		ExperimentName string `json:"experiment_name"`
	}{
		Alias:          Alias(p),
		ExperimentID:   p.ProjectID,
		ExperimentName: p.ProjectName,
	})
}
