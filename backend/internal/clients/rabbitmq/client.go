package rabbitmq

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"strings"

	amqp "github.com/rabbitmq/amqp091-go"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
)

// Client публикует события в RabbitMQ (одно соединение и канал на процесс).
type Client struct {
	log         *logger.Logger
	conn        *amqp.Connection
	ch          *amqp.Channel
	exchange    string
	keyStart    string
	keyStop     string
	keyApply    string
}

func New(cfg *Config, log *logger.Logger) (*Client, error) {
	if cfg == nil || !cfg.Enabled {
		return nil, fmt.Errorf("rabbitmq: config disabled or nil")
	}
	if strings.TrimSpace(cfg.Host) == "" {
		return nil, fmt.Errorf("rabbitmq: host is required when enabled")
	}

	exchange, keyStart, keyStop, keyApply, kind, port := cfg.effectiveParams()
	uri, err := buildAMQPURI(cfg, port)
	if err != nil {
		return nil, err
	}

	conn, err := amqp.Dial(uri)
	if err != nil {
		return nil, fmt.Errorf("rabbitmq dial: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		_ = conn.Close()
		return nil, fmt.Errorf("rabbitmq channel: %w", err)
	}

	if err := ch.ExchangeDeclare(
		exchange,
		kind,
		true,
		false,
		false,
		false,
		nil,
	); err != nil {
		_ = ch.Close()
		_ = conn.Close()
		return nil, fmt.Errorf("rabbitmq declare exchange %q: %w", exchange, err)
	}

	return &Client{
		log:      log,
		conn:     conn,
		ch:       ch,
		exchange: exchange,
		keyStart: keyStart,
		keyStop:  keyStop,
		keyApply: keyApply,
	}, nil
}

func (c *Config) effectiveParams() (exchange, keyStart, keyStop, keyApply, kind string, port int) {
	exchange = strings.TrimSpace(c.Exchange)
	if exchange == "" {
		exchange = "cplane.events"
	}
	keyStart = strings.TrimSpace(c.RoutingKey)
	if keyStart == "" {
		keyStart = "experiment.start"
	}
	keyStop = strings.TrimSpace(c.RoutingKeyStop)
	if keyStop == "" {
		keyStop = "experiment.stop"
	}
	keyApply = strings.TrimSpace(c.RoutingKeyApply)
	if keyApply == "" {
		keyApply = "experiment.apply"
	}
	kind = strings.TrimSpace(c.ExchangeKind)
	if kind == "" {
		kind = amqp.ExchangeTopic
	}
	port = c.Port
	if port == 0 {
		port = 5672
	}
	return exchange, keyStart, keyStop, keyApply, kind, port
}

func buildAMQPURI(cfg *Config, port int) (string, error) {
	vhost := strings.TrimSpace(cfg.VHost)
	if vhost == "" {
		vhost = "/"
	}
	if !strings.HasPrefix(vhost, "/") {
		vhost = "/" + vhost
	}

	u := url.URL{
		Scheme: "amqp",
		User:   url.UserPassword(cfg.User, cfg.Password),
		Host:   fmt.Sprintf("%s:%d", cfg.Host, port),
		Path:   vhost,
	}
	return u.String(), nil
}

func (c *Client) publish(ctx context.Context, routingKey string, body []byte) error {
	if c == nil || c.ch == nil {
		return nil
	}
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}
	err := c.ch.PublishWithContext(ctx,
		c.exchange,
		routingKey,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Body:         body,
		},
	)
	if err != nil {
		return fmt.Errorf("rabbitmq publish: %w", err)
	}
	return nil
}

// PublishExperimentStart публикует JSON тела запроса супервизору (ExperimentRequest).
func (c *Client) PublishExperimentStart(ctx context.Context, body []byte) error {
	if len(body) == 0 {
		return fmt.Errorf("rabbitmq: пустое тело experiment.start")
	}
	return c.publish(ctx, c.keyStart, body)
}

// PublishExperimentStop публикует команду остановки.
func (c *Client) PublishExperimentStop(ctx context.Context, msg MessageExperimentStop) error {
	body, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("rabbitmq marshal: %w", err)
	}
	return c.publish(ctx, c.keyStop, body)
}

// PublishExperimentApply публикует применение конфигурации (тот же JSON, что и для start).
func (c *Client) PublishExperimentApply(ctx context.Context, body []byte) error {
	if len(body) == 0 {
		return fmt.Errorf("rabbitmq: пустое тело experiment.apply")
	}
	return c.publish(ctx, c.keyApply, body)
}

// Close закрывает канал и соединение.
func (c *Client) Close() {
	if c == nil {
		return
	}
	if c.ch != nil {
		_ = c.ch.Close()
	}
	if c.conn != nil {
		_ = c.conn.Close()
	}
}
