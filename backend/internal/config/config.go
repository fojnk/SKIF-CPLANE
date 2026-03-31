package config

import (
	"fmt"
	"os"
	"strings"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients"
	jwt_client "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/jwt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/oauth"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository/cache"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Log           logger.LoggerConfig `yaml:"log"`
	AppPort       int                 `yaml:"app_port"`
	AppPublicPort int                 `yaml:"app_public_port"`
	MetricsPort   int                 `yaml:"metrics_port"`
	AuthToken     string              `yaml:"auth_token"`
	Host          string              `yaml:"host"`
	Database      db.Config           `yaml:"database"`
	UseCors       bool                `yaml:"use_cors"`
	IsTestEnv     bool                `yaml:"is_test_env"`
	Clients       struct {
		Auth         clients.AuthClientConfig         `yaml:"auth"`
		Orchestrator clients.OrchestratorClientConfig `yaml:"orchestrator"`
		OAuth        oauth.OAuthConfig                `yaml:"oauth"`
		JWT          jwt_client.JWTConfig             `yaml:"jwt"`
	} `yaml:"clients"`
	SessionCache   cache.SessionCacheConfig `yaml:"session_cache"`
	ExperimentURLs map[string]struct {
		URL     string `yaml:"url"`
		Name    string `yaml:"name"`
		Enabled bool   `yaml:"enabled"`
	} `yaml:"experiment_urls"`
	ProjectURLs map[string]struct {
		URL     string `yaml:"url"`
		Name    string `yaml:"name"`
		Enabled bool   `yaml:"enabled"`
	} `yaml:"project_urls"`
	DatasetURLs map[string]struct {
		URL     string `yaml:"url"`
		Name    string `yaml:"name"`
		Enabled bool   `yaml:"enabled"`
	} `yaml:"dataset_urls"`
	ACL       acl.PermissionCheckConfig `yaml:"acl"`
	LocalAuth struct {
		Enabled bool `yaml:"enabled"`
		Users   []struct {
			Username string `yaml:"username"`
			Email    string `yaml:"email"`
			Password string `yaml:"password"`
		} `yaml:"users"`
	} `yaml:"local_auth"`
}

func NewConfig(configFile string) (*Config, error) {
	b, err := os.ReadFile(configFile)
	if err != nil {
		return nil, err
	}

	var config Config
	if err := yaml.Unmarshal(b, &config); err != nil {
		return nil, err
	}

	if err := config.ValidateRuntime(); err != nil {
		return nil, err
	}

	return &config, nil
}

func (c *Config) ValidateRuntime() error {
	isDisableAuth := strings.EqualFold(os.Getenv("DisableAuth"), "true")

	if isDisableAuth && !c.IsTestEnv {
		return fmt.Errorf("DisableAuth=true is allowed only in test environment")
	}

	if strings.TrimSpace(c.ACL.Token) == "" && !c.IsTestEnv {
		return fmt.Errorf("acl.token must be set for non-test environment")
	}

	if !c.LocalAuth.Enabled && strings.TrimSpace(c.AuthToken) == "" {
		return fmt.Errorf("auth_token must be set when local_auth is disabled")
	}

	if c.LocalAuth.Enabled && len(c.LocalAuth.Users) == 0 {
		return fmt.Errorf("local_auth.enabled=true requires at least one configured user")
	}

	return nil
}
