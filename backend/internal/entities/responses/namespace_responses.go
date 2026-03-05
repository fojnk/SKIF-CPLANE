package responses

import (
	"encoding/json"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
)

type CreateNamespaceResponse struct {
	ID int32 `json:"id"`
}

type ListNamespacesResponse struct {
	Namespaces []dto.Namespace `json:"namespaces"`
	CanCreate  bool            `json:"can_create"`
}

type ListNamespacesV2Response struct {
	Namespaces []dto.NamespaceShort `json:"namespaces"`
}

type UpdateNamespaceResponse struct {
	ID     int32  `json:"id"`
	Name   string `json:"name"`
	Config string `json:"config"`
}

type ListNamespaceConfigsResponse struct {
	Configs []dto.NamespaceConfigVersion `json:"configs"`
}

type CreateNamespaceRolesResponse struct {
	RolesCreated int32 `json:"roles_created"`
}

type GetNamespaceConfigResponse struct {
	Config dto.NamespaceConfig `json:"config"`
}

type GetNamespaceResponse struct {
	ID     int32  `json:"id"`
	Name   string `json:"name"`
	Config string `json:"config"`

	Rights []acl.Right `json:"rights"`
}

func (r ListNamespacesResponse) MarshalJSON() ([]byte, error) {
	type Alias ListNamespacesResponse
	return json.Marshal(struct {
		Alias
		Workspaces []dto.Namespace `json:"workspaces"`
	}{
		Alias:      Alias(r),
		Workspaces: r.Namespaces,
	})
}

func (r ListNamespacesV2Response) MarshalJSON() ([]byte, error) {
	type Alias ListNamespacesV2Response
	return json.Marshal(struct {
		Alias
		Workspaces []dto.NamespaceShort `json:"workspaces"`
	}{
		Alias:      Alias(r),
		Workspaces: r.Namespaces,
	})
}

func (r GetNamespaceResponse) MarshalJSON() ([]byte, error) {
	type Alias GetNamespaceResponse
	return json.Marshal(struct {
		Alias
		WorkspaceID   int32  `json:"workspace_id"`
		WorkspaceName string `json:"workspace_name"`
	}{
		Alias:         Alias(r),
		WorkspaceID:   r.ID,
		WorkspaceName: r.Name,
	})
}
