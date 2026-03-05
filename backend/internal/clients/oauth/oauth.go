package oauth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/metrics"
	"io"
	"net/http"
	"net/url"
	"strings"
	"errors"
)

type AuthResponse struct {
	Username string `json:"username"`
}

type OAuthError struct {
	StatusCode     int
	IsNetworkError bool
	Message        string
	OriginalError  error
}

func (e *OAuthError) Error() string {
	if e.IsNetworkError {
		return fmt.Sprintf("network error: %v", e.OriginalError)
	}
	return fmt.Sprintf("oauth error (status %d): %s", e.StatusCode, e.Message)
}

func (e *OAuthError) IsTokenExpired() bool {
	return !e.IsNetworkError && (e.StatusCode == 401 || e.StatusCode == 403 || e.StatusCode == 400)
}

type OAuthConfig struct {
	OAuthUrl     string `yaml:"OAuthUrl"`
	ClientID     string `yaml:"client-id"`
	ClientSecret string `yaml:"client-secret"`
	GrantType    string `yaml:"grant-type"`
	Scope        string `yaml:"scope"`
	RedirectURL  string `yaml:"redirect-url"`
	OAuthProxy   string `yaml:"oauth-proxy"`
}

type OAuthClient struct {
	httpClient  HttpClient
	oAuthConfig *OAuthConfig
	logger      *logger.Logger
}

func NewOauthClient(AuthConfig *OAuthConfig, httpClient HttpClient, logger *logger.Logger) (*OAuthClient, error) {
	retryableClient := NewRetryableHttpClient(httpClient, DefaultRetryConfig(), logger)
	return &OAuthClient{
		oAuthConfig: AuthConfig,
		httpClient:  retryableClient,
		logger:      logger,
	}, nil
}

func (r *OAuthClient) Cancel() {
	r.httpClient.CloseIdleConnections()
}

func (r *OAuthClient) OAuthGetAccessToken(code string, redirectURL string) (*dto.OAuthAccessToken, *OAuthError) {
	if redirectURL == "" {
		redirectURL = r.oAuthConfig.RedirectURL
	}
	form := url.Values{}
	form.Add("client_id", r.oAuthConfig.ClientID)
	form.Add("client_secret", r.oAuthConfig.ClientSecret)
	form.Add("grant_type", "authorization_code")
	form.Add("code", code)
	form.Add("redirect_uri", redirectURL)

	tokenUrl, err := url.JoinPath(r.oAuthConfig.OAuthUrl, "token/")
	if err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось построить URL для получения токена доступа",
			OriginalError:  err,
		}
	}

	formData := form.Encode()
	req, err := http.NewRequest("POST", tokenUrl, strings.NewReader(formData))
	if err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось создать запрос для получения токена доступа",
			OriginalError:  err,
		}
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("request_id", uuid.New().String())

	resp, err := r.httpClient.Do(req)

	if resp == nil && err != nil {
		metrics.OAuthFails.WithLabelValues("network_error", "access_token", "").Inc()
		r.logger.Error("failed on httpClient Do: %v", err)
		return nil, &OAuthError{
			IsNetworkError: true,
			Message:        "Сетевая ошибка при получении токена доступа",
			OriginalError:  err,
		}
	}

	if resp != nil {
		defer func() { _ = resp.Body.Close() }()
	}

	if resp.StatusCode < 200 || resp.StatusCode > 300 {
		var errInfo string
		data, err := io.ReadAll(resp.Body)
		if err == nil {
			errInfo = fmt.Sprintf("got error status code from oauth, code: %d, status %s, request_id: %s",
				resp.StatusCode, resp.Status, resp.Header.Get("request_id"),
			)
		}
		var info map[string]interface{}
		err = json.Unmarshal(data, &info)
		if _, ok := info["error"]; ok {
			errInfo = fmt.Sprintf("err: %s", info["error"].(string))
		}

		// Определяем тип ошибки и увеличиваем соответствующую метрику
		errorType := "unknown_error"
		switch {
		case resp.StatusCode == 429 || resp.StatusCode >= 500 && resp.StatusCode < 600:
			errorType = "retryable_error"
		case resp.StatusCode >= 400 && resp.StatusCode < 500:
			errorType = "client_error"
		}

		// Увеличиваем метрику с типом ошибки и кодом статуса
		metrics.OAuthFails.WithLabelValues(errorType, "access_token", fmt.Sprintf("%d", resp.StatusCode)).Inc()

		return nil, &OAuthError{
			StatusCode:     resp.StatusCode,
			IsNetworkError: false,
			Message:        errInfo,
			OriginalError:  fmt.Errorf("oauth server error"),
		}
	}
	rBody, err := io.ReadAll(resp.Body)
	if err != nil {
		metrics.OAuthFails.WithLabelValues("read_error", "access_token", "").Inc()
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось прочитать ответ сервера",
			OriginalError:  err,
		}
	}
	accessToken := &dto.OAuthAccessToken{}
	if err = json.NewDecoder(bytes.NewReader(rBody)).Decode(accessToken); err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось декодировать ответ сервера",
			OriginalError:  err,
		}
	}
	if accessToken.AccessToken == "" {
		metrics.OAuthFails.WithLabelValues("empty__token_token", "access_token", "").Inc()
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Пустой токен доступа в ответе сервера",
			OriginalError:  fmt.Errorf("bad response data"),
		}
	}
	return accessToken, nil
}

func (r *OAuthClient) RefreshAccessToken(refreshToken string) (*dto.OAuthAccessToken, *OAuthError) {
	form := url.Values{}
	form.Add("grant_type", "refresh_token")
	form.Add("refresh_token", refreshToken)

	tokenUrl, err := url.JoinPath(r.oAuthConfig.OAuthUrl, "token/")
	if err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось построить URL для обновления токена",
			OriginalError:  err,
		}
	}
	req, err := http.NewRequest("POST", tokenUrl, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось создать запрос для обновления токена",
			OriginalError:  err,
		}
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetBasicAuth(r.oAuthConfig.ClientID, r.oAuthConfig.ClientSecret)

	resp, err := r.httpClient.Do(req)

	if resp == nil && err != nil {
		metrics.OAuthFails.WithLabelValues("network_error", "refresh_token", "").Inc()
		return nil, &OAuthError{
			IsNetworkError: true,
			Message:        "Сетевая ошибка при обновлении токена",
			OriginalError:  err,
		}
	}

	if resp != nil {
		defer func() { _ = resp.Body.Close() }()
	}

	if resp.StatusCode < 200 || resp.StatusCode > 300 {
		var errInfo string
		data, err := io.ReadAll(resp.Body)
		if err == nil {
			errInfo = fmt.Sprintf("got error status code from oauth, code: %d, status %s, request_id: %s",
				resp.StatusCode, resp.Status, resp.Header.Get("request_id"),
			)
		}
		var info map[string]interface{}
		err = json.Unmarshal(data, &info)
		if _, ok := info["error"]; ok {
			errInfo = fmt.Sprintf("err: %s", info["error"].(string))
		}

		// Определяем тип ошибки и увеличиваем соответствующую метрику
		errorType := "unknown_error"
		switch {
		case resp.StatusCode >= 400 && resp.StatusCode < 500:
			errorType = "client_error"
		case resp.StatusCode >= 500 && resp.StatusCode < 600:
			errorType = "server_error"
		}

		// Увеличиваем метрику с типом ошибки и кодом статуса
		metrics.OAuthFails.WithLabelValues(errorType, "refresh_token", fmt.Sprintf("%d", resp.StatusCode)).Inc()

		return nil, &OAuthError{
			StatusCode:     resp.StatusCode,
			IsNetworkError: false,
			Message:        fmt.Sprintf("Ошибка OAuth сервера при обновлении токена: %s", errInfo),
			OriginalError:  fmt.Errorf("oauth server error"),
		}
	}
	rBody, err := io.ReadAll(resp.Body)
	if err != nil {
		metrics.OAuthFails.WithLabelValues("read_error", "refresh_token", "").Inc()
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось прочитать ответ сервера при обновлении токена",
			OriginalError:  err,
		}
	}
	accessToken := &dto.OAuthAccessToken{}
	if err = json.NewDecoder(bytes.NewReader(rBody)).Decode(accessToken); err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось декодировать ответ сервера при обновлении токена",
			OriginalError:  err,
		}
	}
	if accessToken.AccessToken == "" {
		metrics.OAuthFails.WithLabelValues("empty_token_error", "refresh_token", "").Inc()
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Пустой токен доступа в ответе сервера при обновлении",
			OriginalError:  fmt.Errorf("bad response data"),
		}
	}
	return accessToken, nil
}

func (r *OAuthClient) OAuthGetUserInfo(accessToken string) (*dto.UserInfo, *OAuthError) {
	h, err := url.JoinPath(r.oAuthConfig.OAuthUrl, "info/")
	if err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось построить URL для получения информации о пользователе",
			OriginalError:  err,
		}
	}
	req, err := http.NewRequest("GET", h, nil)
	if err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось создать запрос для получения информации о пользователе",
			OriginalError:  err,
		}
	}
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", accessToken))
	resp, err := r.httpClient.Do(req)

	if resp == nil && err != nil {
		metrics.OAuthFails.WithLabelValues("network_error", "user_info", "").Inc()
		return nil, &OAuthError{
			IsNetworkError: true,
			Message:        "Сетевая ошибка при получении информации о пользователе",
			OriginalError:  err,
		}
	}

	if resp != nil {
		defer func() { _ = resp.Body.Close() }()
	}

	if resp.StatusCode < 200 || resp.StatusCode > 300 {
		var errInfo string
		data, err := io.ReadAll(resp.Body)
		if err == nil {
			errInfo = fmt.Sprintf("got error status code from oauth, code: %d, status %s, request_id: %s",
				resp.StatusCode, resp.Status, resp.Header.Get("request_id"),
			)
		}
		var info map[string]interface{}
		err = json.Unmarshal(data, &info)
		if _, ok := info["message"]; ok {
			errInfo = fmt.Sprintf("err: %s", info["message"].(string))
		}

		// Определяем тип ошибки и увеличиваем соответствующую метрику
		errorType := "unknown_error"
		switch {
		case resp.StatusCode == 429 || resp.StatusCode >= 500 && resp.StatusCode < 600:
			errorType = "retryable_error"
		case resp.StatusCode >= 400 && resp.StatusCode < 500:
			errorType = "client_error"
		}

		// Увеличиваем метрику с типом ошибки и кодом статуса
		metrics.OAuthFails.WithLabelValues(errorType, "user_info", fmt.Sprintf("%d", resp.StatusCode)).Inc()

		return nil, &OAuthError{
			StatusCode:     resp.StatusCode,
			IsNetworkError: false,
			Message:        errInfo,
			OriginalError:  fmt.Errorf("oauth server error"),
		}
	}
	rBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось прочитать ответ сервера при получении информации о пользователе",
			OriginalError:  err,
		}
	}
	userInfo := &dto.UserInfo{}
	if err = json.NewDecoder(bytes.NewReader(rBody)).Decode(userInfo); err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось декодировать ответ сервера при получении информации о пользователе",
			OriginalError:  err,
		}
	}
	if userInfo.Email == "" {
		metrics.OAuthFails.WithLabelValues("empty_info_error", "user_info", "").Inc()
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Пустая информация о пользователе в ответе сервера",
			OriginalError:  errors.New("bad response data"),
		}
	}
	return userInfo, nil
}

func (c *OAuthClient) Authenticate(token string) (*AuthResponse, *OAuthError) {
	h, err := url.JoinPath(c.oAuthConfig.OAuthUrl, "info/")
	if err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось построить URL для аутентификации",
			OriginalError:  err,
		}
	}

	req, err := http.NewRequest(http.MethodGet, h, nil)
	if err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось создать запрос для аутентификации",
			OriginalError:  err,
		}
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	resp, err := c.httpClient.Do(req)

	if resp == nil && err != nil {
		metrics.OAuthFails.WithLabelValues("network_error", "authenticate", "").Inc()
		return nil, &OAuthError{
			IsNetworkError: true,
			Message:        "Сетевая ошибка при аутентификации",
			OriginalError:  err,
		}
	}

	if resp != nil {
		defer func() {
			_ = resp.Body.Close()
		}()
	}

	if resp.StatusCode != http.StatusOK {
		errorType := "unknown_error"
		switch {
		case resp.StatusCode == 429 || resp.StatusCode >= 500 && resp.StatusCode < 600:
			errorType = "retryable_error"
		case resp.StatusCode >= 400 && resp.StatusCode < 500:
			errorType = "client_error"
		}

		metrics.OAuthFails.WithLabelValues(errorType, "authenticate", fmt.Sprintf("%d", resp.StatusCode)).Inc()

		return nil, &OAuthError{
			StatusCode:     resp.StatusCode,
			IsNetworkError: false,
			Message:        fmt.Sprintf("Неожиданный статус код от OAuth сервера: %d", resp.StatusCode),
			OriginalError:  fmt.Errorf("oauth server error"),
		}
	}

	var authResponse AuthResponse
	if err := json.NewDecoder(resp.Body).Decode(&authResponse); err != nil {
		return nil, &OAuthError{
			IsNetworkError: false,
			Message:        "Не удалось декодировать ответ сервера при аутентификации",
			OriginalError:  err,
		}
	}

	return &authResponse, nil
}
