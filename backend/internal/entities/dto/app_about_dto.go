package dto

import "time"

type AppAbout struct {
	Content   string    `json:"content"`
	Links     string    `json:"links"`
	UpdatedAt time.Time `json:"updated_at"`
}
