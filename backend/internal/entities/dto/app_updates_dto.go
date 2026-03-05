package dto

import "time"

type AppUpdate struct {
	Id          int32     `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Content     string    `json:"content"`
	VideoUrl    *string   `json:"video_url,omitempty"`
	ImageUrl    *string   `json:"image_url,omitempty"`
	ReleaseDate time.Time `json:"release_date"`
	IsPublished bool      `json:"is_published"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

