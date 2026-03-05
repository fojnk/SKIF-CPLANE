package responses

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"

type CreateAppBannerResponse struct {
	Id int32 `json:"id"`
}

type UpdateAppBannerResponse struct {
	AppBanner dto.AppBanner `json:"app_banner"`
}

type ListAppBannersResponse struct {
	AppBanners []dto.AppBanner `json:"app_banners"`
}

type GetAppBannerResponse struct {
	AppBanner dto.AppBanner `json:"app_banner"`
}

type GetAvailableBannerTypesResponse struct {
	Types []dto.BannerType `json:"types"`
}

type GetCurrentAppBannerResponse struct {
	AppBanner *dto.AppBanner `json:"app_banner"`
}
