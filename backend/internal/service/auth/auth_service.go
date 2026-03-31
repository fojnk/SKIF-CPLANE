package service

import (
	"errors"
	"github.com/google/uuid"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/oauth"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

type AuthService struct {
	repo *repository.Repository
}

func NewAuthService(repo *repository.Repository) *AuthService {
	return &AuthService{repo: repo}
}

func (s *AuthService) isLocalAuthEnabled() bool {
	return s.repo.Config.LocalAuth.Enabled
}

func (s *AuthService) shouldUseSecureCookies() bool {
	return os.Getenv("DisableSSL") != "true"
}

func (s *AuthService) findLocalUser(login string) (string, string, string, bool) {
	for _, u := range s.repo.Config.LocalAuth.Users {
		if strings.EqualFold(u.Username, login) || strings.EqualFold(u.Email, login) {
			return u.Username, u.Email, u.Password, true
		}
	}

	return "", "", "", false
}

func (s *AuthService) getLocalUserByUsername(username string) (string, string, bool) {
	for _, u := range s.repo.Config.LocalAuth.Users {
		if u.Username == username {
			return u.Username, u.Email, true
		}
	}

	return "", "", false
}

func (s *AuthService) createLocalAccessToken(username string) (*dto.OAuthAccessToken, error) {
	accessToken, refreshToken, err := s.repo.Clients.JwtClient.CreateAccessAndRefreshJWT(username)
	if err != nil {
		return nil, serviceerrors.NewUnauthorizedError("Не удалось создать токены", err)
	}

	expiresIn := int(time.Until(accessToken.ExpiresIn).Seconds())
	if expiresIn < 1 {
		expiresIn = 1
	}

	return &dto.OAuthAccessToken{
		AccessToken:  accessToken.Token,
		RefreshToken: refreshToken.Token,
		ExpiresIn:    expiresIn,
		TokenType:    "Bearer",
		Scope:        "local_auth",
	}, nil
}

func (s *AuthService) extractAccessToken(r *http.Request) string {
	tokenCookie, err := r.Cookie(pkg.SessionHeader)
	if err == nil && tokenCookie != nil && tokenCookie.Value != "" {
		return tokenCookie.Value
	}

	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
			return parts[1]
		}
	}

	return ""
}

// GetAuthorizationURL генерирует URL для OAuth авторизации
func (s *AuthService) GetAuthorizationURL(redirectUrl string) (string, error) {
	if s.isLocalAuthEnabled() {
		return "", serviceerrors.NewBadRequestError("OAuth отключен: используйте /auth/login", nil)
	}

	v := url.Values{}
	v.Add("client_id", s.repo.Config.Clients.OAuth.ClientID)
	v.Add("response_type", "code")
	v.Add("redirect_uri", redirectUrl)
	v.Add("scope", s.repo.Config.Clients.OAuth.Scope)
	v.Add("state", uuid.New().String())

	oauthUrl := s.repo.Config.Clients.OAuth.OAuthUrl + "/authorize/?" + v.Encode()
	return oauthUrl, nil
}

func (s *AuthService) Login(username, password string) (*dto.OAuthAccessToken, error) {
	if !s.isLocalAuthEnabled() {
		return nil, serviceerrors.NewBadRequestError("Локальная авторизация отключена", nil)
	}

	if strings.TrimSpace(username) == "" || strings.TrimSpace(password) == "" {
		return nil, serviceerrors.NewBadRequestError("Логин и пароль обязательны", nil)
	}

	localUsername, _, localPassword, found := s.findLocalUser(username)
	if !found || localPassword != password {
		return nil, serviceerrors.NewUnauthorizedError("Неверный логин или пароль", nil)
	}

	return s.createLocalAccessToken(localUsername)
}

// GetUserInfo получает информацию о пользователе по токену
func (s *AuthService) GetUserInfo(token string) (*dto.UserInfo, error) {
	if token == "" {
		return nil, serviceerrors.NewBadRequestError("Токен не указан", nil)
	}

	if s.isLocalAuthEnabled() {
		claims, err := s.repo.Clients.JwtClient.ValidateJWT(token)
		if err != nil {
			return nil, serviceerrors.NewUnauthorizedError("Не удалось валидировать токен", err)
		}

		username, email, found := s.getLocalUserByUsername(claims.Username)
		if !found {
			return nil, serviceerrors.NewUnauthorizedError("Пользователь не найден", nil)
		}

		return &dto.UserInfo{
			Username: username,
			Email:    email,
		}, nil
	}

	userInfo, err := s.repo.Clients.OAuth.OAuthGetUserInfo(token)
	if err != nil {
		s.repo.Logger.Error("failed to get user info from OAuth", err)
		return nil, serviceerrors.NewUnauthorizedError("Не удалось получить информацию о пользователе", err)
	}

	return userInfo, nil
}

// GetUserInfoFromRequest получает информацию о пользователе из HTTP запроса
// Использует кэш для оптимизации
func (s *AuthService) GetUserInfoFromRequest(r *http.Request) (*user.UserInfo, error) {
	if s.isLocalAuthEnabled() {
		token := s.extractAccessToken(r)
		if token == "" {
			return nil, serviceerrors.NewUnauthorizedError("Токен не найден", nil)
		}

		claims, err := s.repo.Clients.JwtClient.ValidateJWT(token)
		if err != nil {
			return nil, serviceerrors.NewUnauthorizedError("Не удалось валидировать токен", err)
		}

		return &user.UserInfo{Username: claims.Username}, nil
	}

	return pkg.GetUserInfo(r, s.repo, s.repo.Logger)
}

// ExchangeCodeForToken обменивает OAuth код на access token
func (s *AuthService) ExchangeCodeForToken(code, redirectUri string) (*dto.OAuthAccessToken, error) {
	if s.isLocalAuthEnabled() {
		return nil, serviceerrors.NewBadRequestError("OAuth отключен: используйте /auth/login", nil)
	}

	if code == "" {
		return nil, serviceerrors.NewBadRequestError("Код авторизации не указан", nil)
	}

	accessToken, err := s.repo.Clients.OAuth.OAuthGetAccessToken(code, redirectUri)
	if err != nil {
		s.repo.Logger.Error("failed to exchange code for token", err)
		return nil, serviceerrors.NewUnauthorizedError("Не удалось обменять код на токен", err)
	}

	return accessToken, nil
}

// RefreshAccessToken обновляет access token используя refresh token
func (s *AuthService) RefreshAccessToken(refreshToken string) (*dto.OAuthAccessToken, error) {
	if refreshToken == "" {
		return nil, serviceerrors.NewBadRequestError("Refresh token не указан", nil)
	}

	if s.isLocalAuthEnabled() {
		accessToken, newRefreshToken, err := s.repo.Clients.JwtClient.RefreshToken(refreshToken)
		if err != nil {
			return nil, serviceerrors.NewUnauthorizedError("Не удалось обновить токен доступа", err)
		}

		expiresIn := int(time.Until(accessToken.ExpiresIn).Seconds())
		if expiresIn < 1 {
			expiresIn = 1
		}

		return &dto.OAuthAccessToken{
			AccessToken:  accessToken.Token,
			RefreshToken: newRefreshToken.Token,
			ExpiresIn:    expiresIn,
			TokenType:    "Bearer",
			Scope:        "local_auth",
		}, nil
	}

	result, err := s.repo.Clients.OAuth.RefreshAccessToken(refreshToken)
	if err != nil {
		s.repo.Logger.Error("failed to refresh access token", err)
		return nil, serviceerrors.NewUnauthorizedError("Не удалось обновить токен доступа", err)
	}

	return result, nil
}

// CreateAuthCookies создает cookies для авторизации (access и refresh tokens)
func (s *AuthService) CreateAuthCookies(accessToken *dto.OAuthAccessToken) ([]*http.Cookie, error) {
	if accessToken == nil {
		return nil, serviceerrors.NewBadRequestError("Токен доступа не указан", nil)
	}

	cookies := make([]*http.Cookie, 2)
	secure := s.shouldUseSecureCookies()

	// Cookie для access token
	cookies[0] = &http.Cookie{
		Name:     pkg.SessionHeader,
		Value:    accessToken.AccessToken,
		Path:     "/",
		MaxAge:   accessToken.ExpiresIn,
		Secure:   secure,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	// Cookie для refresh token
	cookies[1] = &http.Cookie{
		Name:     pkg.RefreshTokenHeader,
		Value:    accessToken.RefreshToken,
		Path:     "/",
		MaxAge:   s.repo.Config.Clients.JWT.RefreshExpiration,
		Secure:   secure,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	return cookies, nil
}

// CreateLogoutCookies создает cookies для выхода (удаление токенов)
func (s *AuthService) CreateLogoutCookies() []*http.Cookie {
	cookies := make([]*http.Cookie, 2)
	secure := s.shouldUseSecureCookies()

	// Удаляем access token cookie
	cookies[0] = &http.Cookie{
		Name:     pkg.SessionHeader,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Secure:   secure,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	// Удаляем refresh token cookie
	cookies[1] = &http.Cookie{
		Name:     pkg.RefreshTokenHeader,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Secure:   secure,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	return cookies
}

// IsTokenExpiredError проверяет является ли ошибка ошибкой протухшего токена
func (s *AuthService) IsTokenExpiredError(err error) bool {
	if s.isLocalAuthEnabled() && err != nil {
		return strings.Contains(strings.ToLower(err.Error()), "expired")
	}

	var oauthErr *oauth.OAuthError
	if errors.As(err, &oauthErr) && oauthErr != nil {
		return oauthErr.IsTokenExpired()
	}
	return false
}

// GetErrorStatusCode возвращает HTTP status code на основе ошибки OAuth
func (s *AuthService) GetErrorStatusCode(err error) int {
	if s.isLocalAuthEnabled() {
		return serviceerrors.GetHTTPStatusCode(err)
	}

	var oauthErr *oauth.OAuthError
	if errors.As(err, &oauthErr) && oauthErr != nil {
		if oauthErr.IsNetworkError {
			return http.StatusServiceUnavailable
		}
		if oauthErr.StatusCode >= 400 && oauthErr.StatusCode < 500 {
			return oauthErr.StatusCode
		}
	}
	return http.StatusInternalServerError
}
