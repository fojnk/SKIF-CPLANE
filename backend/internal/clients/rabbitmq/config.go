package rabbitmq

// Config подключение к брокеру. При Enabled=false клиент не создаётся.
type Config struct {
	Enabled         bool   `yaml:"enabled"`
	Host            string `yaml:"host"`
	Port            int    `yaml:"port"`
	User            string `yaml:"user"`
	Password        string `yaml:"password"`
	VHost           string `yaml:"vhost"`
	Exchange        string `yaml:"exchange"`          // topic exchange, по умолчанию cplane.events
	RoutingKey      string `yaml:"routing_key"`       // experiment.start
	RoutingKeyStop  string `yaml:"routing_key_stop"`  // experiment.stop
	RoutingKeyApply string `yaml:"routing_key_apply"` // experiment.apply
	ExchangeKind    string `yaml:"exchange_kind"`     // topic | fanout | direct, по умолчанию topic
}
