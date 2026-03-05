package responses

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"

type GetAppAboutResponse struct {
	AppAbout dto.AppAbout `json:"app_about"`
}

type UpdateAppAboutResponse struct {
	AppAbout dto.AppAbout `json:"app_about"`
}

