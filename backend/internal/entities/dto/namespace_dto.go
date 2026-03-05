package dto

import (
	"encoding/json"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"time"
)

type Namespace struct {
	ID     int32       `json:"id"`
	Name   string      `json:"name"`
	Rights []acl.Right `json:"rights"`
}

type NamespaceShort struct {
	ID   int32  `json:"id"`
	Name string `json:"name"`
}

type NamespaceConfigVersion struct {
	ID        int32     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
}

type NamespaceConfig struct {
	ID        int32     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Config    string    `json:"config"`
}

type NamespaceInfo struct {
	ID               int32       `json:"id"`
	Name             string      `json:"name"`
	Config           string      `json:"config"`
	CurrentVersionID int32       `json:"current_version_id"`
	Rights           []acl.Right `json:"rights"`
}

func (n Namespace) MarshalJSON() ([]byte, error) {
	type Alias Namespace
	return json.Marshal(struct {
		Alias
		WorkspaceID   int32  `json:"workspace_id"`
		WorkspaceName string `json:"workspace_name"`
	}{
		Alias:         Alias(n),
		WorkspaceID:   n.ID,
		WorkspaceName: n.Name,
	})
}

func (n NamespaceShort) MarshalJSON() ([]byte, error) {
	type Alias NamespaceShort
	return json.Marshal(struct {
		Alias
		WorkspaceID   int32  `json:"workspace_id"`
		WorkspaceName string `json:"workspace_name"`
	}{
		Alias:         Alias(n),
		WorkspaceID:   n.ID,
		WorkspaceName: n.Name,
	})
}

func (n NamespaceInfo) MarshalJSON() ([]byte, error) {
	type Alias NamespaceInfo
	return json.Marshal(struct {
		Alias
		WorkspaceID   int32  `json:"workspace_id"`
		WorkspaceName string `json:"workspace_name"`
	}{
		Alias:         Alias(n),
		WorkspaceID:   n.ID,
		WorkspaceName: n.Name,
	})
}
