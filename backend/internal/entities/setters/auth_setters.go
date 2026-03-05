package setters

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

func SetAuthRequestParams(r *requests.AuthUserRequest, _, value string) *responses.ErrorResponse {
	r.RedirectUrl = value
	return nil
}

func SetLoginRequestParams(r *requests.LoginRequest, _, _ string) *responses.ErrorResponse {
	return nil
}

func SetTokenRequestParams(r *requests.OAuthCodeRequest, name, value string) *responses.ErrorResponse {
	switch name {
	case "code":
		r.Code = value
	case "redirect_uri":
		r.RedirectUri = value
	}
	return nil
}

func SetRefreshTokenRequestParams(r *requests.RefreshTokenRequest, name, value string) *responses.ErrorResponse {
	r.Token = value
	return nil
}
