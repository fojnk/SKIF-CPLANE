package clients

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

type AuthClientConfig struct {
	URL     string        `yaml:"url"`
	Timeout time.Duration `yaml:"timeout"`
}

type AuthResponse struct {
	Username string `json:"username"`
}

type AuthClient struct {
	url    string
	client *http.Client
}

func NewAuthClient(config AuthClientConfig) (*AuthClient, error) {
	return &AuthClient{
		url:    config.URL,
		client: &http.Client{Timeout: config.Timeout},
	}, nil
}

func (c *AuthClient) Authenticate(token string) (*AuthResponse, error) {
	h, err := url.JoinPath(c.url, "/oauth2/info/")
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodGet, h, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var authResponse AuthResponse
	if err := json.NewDecoder(resp.Body).Decode(&authResponse); err != nil {
		return nil, err
	}

	return &authResponse, nil
}
