package responses

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"

type GetAppUpcomingResponse struct {
	AppUpcoming dto.AppUpcoming `json:"app_upcoming"`
}

type UpdateAppUpcomingResponse struct {
	AppUpcoming dto.AppUpcoming `json:"app_upcoming"`
}

