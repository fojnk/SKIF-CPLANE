package responses

import (
	jwt_client "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/jwt"
)

type UserTokensResponse struct {
	AccessToken  jwt_client.TokenInfo `json:"access_token"`
	RefreshToken jwt_client.TokenInfo `json:"refresh_token"`
}
