package requests

import "time"

type CreateAppUpdateRequest struct {
	Title       string    `json:"title" required:"true" minLength:"1" maxLength:"255"`
	Description string    `json:"description" minLength:"0"`
	Content     string    `json:"content" minLength:"0"`
	VideoUrl    *string   `json:"video_url" extensions:"x-nullable, x-optional"`
	ImageUrl    *string   `json:"image_url" extensions:"x-nullable, x-optional"`
	ReleaseDate time.Time `json:"release_date" required:"true"`
	IsPublished bool      `json:"is_published"`
}

type UpdateAppUpdateRequest struct {
	Id          int32      `json:"id" validate:"required"`
	Title       string     `json:"title" minLength:"0" maxLength:"255"`
	Description string     `json:"description" minLength:"0"`
	Content     string     `json:"content" minLength:"0"`
	VideoUrl    *string    `json:"video_url" extensions:"x-nullable, x-optional"`
	ImageUrl    *string    `json:"image_url" extensions:"x-nullable, x-optional"`
	ReleaseDate *time.Time `json:"release_date" extensions:"x-nullable, x-optional"`
	IsPublished *bool      `json:"is_published" extensions:"x-nullable, x-optional"`
}

type DeleteAppUpdateRequest struct {
	Id int32 `json:"id"`
}

type GetAppUpdateRequest struct {
	Id int32 `json:"id"`
}

type ListAppUpdatesRequest struct {
	Limit  *int32 `json:"limit,omitempty" validate:"omitempty,min=1,max=100"`
	Offset *int32 `json:"offset,omitempty"`
}

type ListPublishedAppUpdatesRequest struct {
}

type ListUpcomingAppUpdatesRequest struct {
}
