package responses

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
)

type CheckACLResponse struct {
	Rights []acl.Right `json:"rights"`
}

type UsersACLResponse struct {
	Users []dto.UserRights `json:"users"`
	Pages int64            `json:"pages"`
	Total int64            `json:"total"`
}
