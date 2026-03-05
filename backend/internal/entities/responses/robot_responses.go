package responses

import (
	jwt_client "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/jwt"
)

type CreateRobotResponse struct {
	ID    int32                `json:"id"`
	Name  string               `json:"name"`
	Token jwt_client.TokenInfo `json:"access_token"`
}

type GenerateTokenRobotResponse struct {
	ID    int32                `json:"id"`
	Name  string               `json:"name"`
	Token jwt_client.TokenInfo `json:"access_token"`
}
