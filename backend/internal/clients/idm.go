package clients

import (
	"bytes"
	"encoding/json"
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"io"
	"net/http"
	"time"
)

type IDMClientConfig struct {
	URL         string        `yaml:"url"`
	Timeout     time.Duration `yaml:"timeout"`
	SystemID    string        `yaml:"system_id"`
	AccessToken string        `yaml:"access_token"`
	PushEnabled bool          `yaml:"push_enabled"`
}

type IDMClient struct {
	config IDMClientConfig
	client *http.Client
	l      *logger.Logger
}

func NewClientIDM(config IDMClientConfig, l *logger.Logger) *IDMClient {
	return &IDMClient{
		config: config,
		client: &http.Client{Timeout: config.Timeout},
		l:      l,
	}
}

type Role struct {
	ID                string   `json:"id"`
	Name              string   `json:"name"`
	Description       string   `json:"description"`
	Owners            []string `json:"owners,omitempty"`
	Params            Params   `json:"params,omitempty"`
	MarkedForDeletion int32    `json:"marked_for_deletion"`
}

type WorkflowStep struct {
	Name   string `json:"name"`
	Order  int    `json:"order"`
	Status bool   `json:"status"`
}

type Workflow []WorkflowStep

type ABC struct {
	GetOwners GetOwners `json:"get_owners"`
}

type GetOwners struct {
	ProductID  int      `json:"product_id"`
	RolesSlugs []string `json:"roles_slugs"`
}

type Params struct {
	FullPath string   `json:"fullpath"`
	Workflow Workflow `json:"workflow"`
	ABC      ABC      `json:"abc"`
}

func (idm *IDMClient) PushRoles(roles []Role) error {
	if idm.config.PushEnabled == false {
		return nil
	}

	data, err := json.Marshal(roles)
	if err != nil {
		return fmt.Errorf("не удалось сериализовать роли в JSON: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, idm.config.URL+"/permissions/", bytes.NewBuffer(data))
	if err != nil {
		return fmt.Errorf("не удалось создать HTTP запрос: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-AUTH-LOGIN", idm.config.SystemID)
	req.Header.Set("X-AUTH-TOKEN", idm.config.AccessToken)

	resp, err := idm.client.Do(req)
	if err != nil {
		return fmt.Errorf("ошибка выполнения HTTP запроса: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("ошибка от сервера, status: %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}

type PermissionObject struct {
	Username    string   `json:"username"`
	Permissions []string `json:"permissions"`
}

type Meta struct {
	Next         *string `json:"next"` // может быть null
	Previous     *string `json:"previous"`
	PagesCount   int     `json:"pages_count"`
	ObjectsCount int     `json:"objects_count"`
}

type PermissionsResponse struct {
	Meta    Meta               `json:"meta"`
	Objects []PermissionObject `json:"objects"`
}

func mapRoleToUsers(objs []PermissionObject) map[string][]string {
	roleToUsers := make(map[string][]string)

	for _, obj := range objs {
		for _, roleID := range obj.Permissions {
			roleToUsers[roleID] = append(roleToUsers[roleID], obj.Username)
		}
	}

	return roleToUsers
}

func (idm *IDMClient) GetRoles(limit, offset int32) (*[]PermissionObject, bool, error) {
	next := false
	url := fmt.Sprintf(idm.config.URL+"/account_permissions?limit=%d&offset=%d", limit, offset)

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, next, fmt.Errorf("не удалось создать запрос: %w", err)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-AUTH-LOGIN", idm.config.SystemID)
	req.Header.Set("X-AUTH-TOKEN", idm.config.AccessToken)

	resp, err := idm.client.Do(req)
	if err != nil {
		return nil, false, fmt.Errorf("ошибка выполнения запроса: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, false, fmt.Errorf("ошибка от сервера, status: %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var rolesResponse PermissionsResponse
	if err := json.NewDecoder(resp.Body).Decode(&rolesResponse); err != nil {
		return nil, false, fmt.Errorf("не удалось распарсить ответ: %w", err)
	}

	if rolesResponse.Meta.Next != nil && *rolesResponse.Meta.Next != "null" {
		next = true
	}

	return &rolesResponse.Objects, next, nil
}
