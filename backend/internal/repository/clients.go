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
	IDM          *clients.IDMClient
	OAuth        *oauth.OAuthClient
	JwtClient    *jwt_client.Client
	Jobd         *clients.JobdClient
	OneAlerts    *clients.OneAlertsClient
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

	idm := clients.NewClientIDM(c.Clients.IDM, l)

	jwt := jwt_client.NewJWTClient(c.Clients.JWT.JWTSecret, c.Clients.JWT.AccessExpiration, c.Clients.JWT.RefreshExpiration)

	var jobd *clients.JobdClient
	// Only initialize jobd client if base_url is configured
	if c.Clients.Jobd.BaseURL != "" {
		var err error
		jobd, err = clients.NewJobdClient(c.Clients.Jobd, l)
		if err != nil {
			l.Error("failed to init jobd client", err)
			jobd = nil
		}
	} else {
		l.Info("jobd client is not configured (base_url is empty)")
	}

	var oneAlerts *clients.OneAlertsClient
	if c.Clients.OneAlerts.BaseURL != "" {
		var err error
		oneAlerts, err = clients.NewOneAlertsClient(c.Clients.OneAlerts, l)
		if err != nil {
			l.Error("failed to init one alerts client", err)
			oneAlerts = nil
		}
	} else {
		l.Info("one alerts client is not configured (base_url is empty)")
	}

	return &Clients{
		Auth:         auth,
		Orchestrator: orchestrator,
		IDM:          idm,
		OAuth:        oauthC,
		JwtClient:    jwt,
		Jobd:         jobd,
		OneAlerts:    oneAlerts,
	}, nil
}
