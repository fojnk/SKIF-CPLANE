package responses

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"

type CheckPermissionsResponse struct {
	Permissions []dto.Permission `json:"permissions"`
}

type EmptyResponse struct {
}
