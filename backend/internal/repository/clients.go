package repository

import (
	"net/http"
	"net/url"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients"
	jwt_client "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/jwt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/oauth"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/config"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
)

type Clients struct {
	// DEPRECATED
	Auth         *clients.AuthClient
	Orchestrator *clients.OrchestratorClient
	OAuth        *oauth.OAuthClient
	JwtClient    *jwt_client.Client
}

func NewClients(c *config.Config, l *logger.Logger) (*Clients, error) {
	auth, err := clients.NewAuthClient(c.Clients.Auth)
	if err != nil {
		return nil, err
	}

	orchestrator, err := clients.NewStreamFlowOrchestratorClient(c.Clients.Orchestrator)
	if err != nil {
		return nil, err
	}

	httpClient := http.DefaultClient
	if c.Clients.OAuth.OAuthProxy != "" {
		proxyUrl, err := url.Parse(c.Clients.OAuth.OAuthProxy)
		if err != nil {
			panic("invalid proxy url. err: " + err.Error())
		}
		httpClient = &http.Client{Transport: &http.Transport{Proxy: http.ProxyURL(proxyUrl)}}
	}

	oauthC, err := oauth.NewOauthClient(&c.Clients.OAuth, httpClient, l)
	if err != nil {
		l.Error("failed to init oauth client", err)
	}

	jwt := jwt_client.NewJWTClient(c.Clients.JWT.JWTSecret, c.Clients.JWT.AccessExpiration, c.Clients.JWT.RefreshExpiration)

	return &Clients{
		Auth:         auth,
		Orchestrator: orchestrator,
		OAuth:        oauthC,
		JwtClient:    jwt,
	}, nil
}
