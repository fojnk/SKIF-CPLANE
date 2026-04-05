package responses

import "time"

type PermissionRequestItem struct {
	ID              int32      `json:"id"`
	RequesterUserID int32      `json:"requester_user_id"`
	RequesterName   string     `json:"requester_name,omitempty"`
	RequesterEmail  *string    `json:"requester_email,omitempty"`
	ObjectType      string     `json:"object_type"`
	ObjectID        int32      `json:"object_id"`
	ObjectAttribute string     `json:"object_attribute"`
	Action          string     `json:"action"`
	Message         string     `json:"message"`
	Status          string     `json:"status"`
	ReviewerUserID  *int32     `json:"reviewer_user_id,omitempty"`
	ReviewedAt      *time.Time `json:"reviewed_at,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}

type ListPermissionRequestsResponse struct {
	Items []PermissionRequestItem `json:"items"`
	Total int64                   `json:"total"`
}
