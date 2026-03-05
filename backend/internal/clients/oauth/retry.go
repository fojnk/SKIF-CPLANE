package oauth

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"time"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
)

type RetryConfig struct {
	MaxRetries int
	Backoff    time.Duration
	MaxBackoff time.Duration
}

func DefaultRetryConfig() *RetryConfig {
	return &RetryConfig{
		MaxRetries: 3,
		Backoff:    200 * time.Millisecond,
		MaxBackoff: 5 * time.Second,
	}
}

type RetryableHttpClient struct {
	HttpClient
	config *RetryConfig
	logger *logger.Logger
}

func NewRetryableHttpClient(client HttpClient, config *RetryConfig, logger *logger.Logger) *RetryableHttpClient {
	return &RetryableHttpClient{
		HttpClient: client,
		config:     config,
		logger:     logger,
	}
}

func (c *RetryableHttpClient) Do(req *http.Request) (*http.Response, error) {
	var bodyBytes []byte
	if req.Body != nil {
		var err error
		bodyBytes, err = io.ReadAll(req.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to read request body: %w", err)
		}
		req.Body.Close()
		req.Body = io.NopCloser(bytes.NewReader(bodyBytes))
	}

	for i := 0; i <= c.config.MaxRetries; i++ {
		if bodyBytes != nil && i > 0 {
			req.Body = io.NopCloser(bytes.NewReader(bodyBytes))
		}

		resp, err := c.HttpClient.Do(req)

		if resp != nil {
			// Есть response - это HTTP ошибка, не сетевая
			if resp.StatusCode >= 200 && resp.StatusCode < 300 {
				return resp, nil
			}

			// HTTP ошибка - ретраим только 5xx и 429
			if resp.StatusCode == 429 || (resp.StatusCode >= 500 && resp.StatusCode < 600) {
				if i == c.config.MaxRetries {
					return resp, nil
				}

				delay := c.calculateDelay(i)
				c.logger.Warn(fmt.Sprintf("Rate limited or server error (HTTP %d), retrying in %v (attempt %d/%d)",
					resp.StatusCode, delay, i+1, c.config.MaxRetries+1))

				time.Sleep(delay)
				continue
			}

			// Не ретраим 4xx и другие ошибки - возвращаем сразу
			return resp, nil
		}

		// resp == nil - это сетевая ошибка, ретраим
		if err != nil {
			if i == c.config.MaxRetries {
				return nil, err
			}

			delay := c.calculateDelay(i)
			c.logger.Warn(fmt.Sprintf("Network error, retrying in %v (attempt %d/%d): %v", delay, i+1, c.config.MaxRetries+1, err))

			time.Sleep(delay)
			continue
		}
	}

	// Не должны сюда попасть, но на всякий случай
	return nil, fmt.Errorf("unexpected retry loop exit")
}

func (c *RetryableHttpClient) calculateDelay(attempt int) time.Duration {
	// Экспоненциальная задержка: base * 2^attempt
	delay := c.config.Backoff * time.Duration(1<<attempt)

	// Ограничиваем максимальной задержкой
	if delay > c.config.MaxBackoff {
		delay = c.config.MaxBackoff
	}

	return delay
}

func (c *RetryableHttpClient) CloseIdleConnections() {
	c.HttpClient.CloseIdleConnections()
}
