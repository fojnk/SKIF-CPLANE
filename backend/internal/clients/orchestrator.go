package clients

import (
	"crypto/tls"
	"net"
	"net/http"
	"time"

	httptransport "github.com/go-openapi/runtime/client"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/orchestrator/client"
)

type OrchestratorClientConfig struct {
	BaseURL string `yaml:"base_url"`
}

type OrchestratorClient struct {
	Client *client.ClientWithResponses
}

func NewStreamFlowOrchestratorClient(c OrchestratorClientConfig) (*OrchestratorClient, error) {
	dialer := &net.Dialer{
		Timeout:       10 * time.Second,
		KeepAlive:     10 * time.Second,
		FallbackDelay: 0,
	}
	httpTransport := &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
		DialContext: dialer.DialContext,
	}
	transport := httptransport.New(c.BaseURL, "", nil)
	transport.Transport = httpTransport

	client, err := client.NewClientWithResponses(c.BaseURL)
	if err != nil {
		return nil, err
	}

	return &OrchestratorClient{
		Client: client,
	}, nil
}
