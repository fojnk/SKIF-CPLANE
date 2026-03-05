package dto

import "time"

type AppUpcoming struct {
	Content   string    `json:"content"`
	UpdatedAt time.Time `json:"updated_at"`
}

