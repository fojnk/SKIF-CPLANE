package requests

import "time"

type CreateAppBannerRequest struct {
	Type      *string    `json:"type,omitempty" extensions:"x-nullable, x-optional"`
	Title     string     `json:"title" minLength:"0" maxLength:"50"`
	Message   string     `json:"message"`
	Active    bool       `json:"active"`
	Color     string     `json:"color"`
	ColorDark string     `json:"color_dark"`
	Starts    *time.Time `json:"starts,omitempty" extensions:"x-nullable, x-optional"`
	Ends      *time.Time `json:"ends,omitempty" extensions:"x-nullable, x-optional"`
}

type UpdateAppBannerRequest struct {
	Id        int32      `json:"id" validate:"required"`
	Type      *string    `json:"type" extensions:"x-nullable, x-optional"`
	Title     string     `json:"title"`
	Message   string     `json:"message"`
	Active    *bool      `json:"active" extensions:"x-nullable, x-optional"`
	Color     string     `json:"color"`
	ColorDark string     `json:"color_dark"`
	Starts    *time.Time `json:"starts,omitempty" extensions:"x-nullable, x-optional"`
	Ends      *time.Time `json:"ends,omitempty" extensions:"x-nullable, x-optional"`
}

type DeleteAppBannerRequest struct {
	Id int32 `json:"id"`
}

type GetAppBannerRequest struct {
	Id int32 `json:"id"`
}

type GetListOfAppBannersRequest struct {
}

type GetAppBannerTypesRequest struct{}

type GetCurrentAppBannerRequest struct{}
