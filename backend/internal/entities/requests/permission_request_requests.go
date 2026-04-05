package requests

type CreatePermissionRequest struct {
	ObjectType      string `json:"object_type" binding:"required"`
	ObjectID        int32  `json:"object_id" binding:"required"`
	ObjectAttribute string `json:"object_attribute"`
	Action          string `json:"action"`
	Message         string `json:"message"`
}

type ListPermissionRequestsAdminRequest struct {
	Status string `json:"status" form:"status"`
	Limit  int32  `json:"limit" form:"limit"`
	Offset int32  `json:"offset" form:"offset"`
}

type ReviewPermissionRequest struct {
	ID int32 `json:"id" binding:"required"`
}

type RegisterRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=50"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8"`
	DisplayName string `json:"display_name" binding:"omitempty,max=255"`
}
