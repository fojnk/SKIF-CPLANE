package clients

// OneAlertsClientConfig is kept for backward compatibility with config files.
// The one_alerts client has been removed.
type OneAlertsClientConfig struct {
	BaseURL string  `yaml:"base_url"`
	Token   *string `yaml:"token"`
	Timeout int     `yaml:"timeout"` // in seconds
}
