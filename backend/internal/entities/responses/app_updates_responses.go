package responses

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"

type CreateAppUpdateResponse struct {
	AppUpdate dto.AppUpdate `json:"app_update"`
}

type UpdateAppUpdateResponse struct {
	AppUpdate dto.AppUpdate `json:"app_update"`
}

type ListAppUpdatesResponse struct {
	AppUpdates []dto.AppUpdate `json:"app_updates"`
	Total      int64           `json:"total"`
	Pages      int64           `json:"pages"`
}

type ListPublishedAppUpdatesResponse struct {
	AppUpdates []dto.AppUpdate `json:"app_updates"`
}

type ListUpcomingAppUpdatesResponse struct {
	AppUpdates []dto.AppUpdate `json:"app_updates"`
}

type GetAppUpdateResponse struct {
	AppUpdate dto.AppUpdate `json:"app_update"`
}

