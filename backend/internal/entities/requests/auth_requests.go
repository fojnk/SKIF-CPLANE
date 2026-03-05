package requests

type AuthUserRequest struct {
	RedirectUrl string `json:"redirect_url"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RefreshTokenRequest struct {
	Token string `header:"X-Refresh-Token" binding:"required"`
}

type LogoutRequest struct {
}

type OAuthCodeRequest struct {
	Code        string `form:"code" binding:"required"`
	RedirectUri string `form:"redirect_uri" binding:"omitempty,url"`
}

type UserInfoRequest struct{}
