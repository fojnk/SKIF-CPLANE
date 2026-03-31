package pkg

import (
	"errors"
	"net/http"
	"strings"

	"fmt"
	"github.com/patrickmn/go-cache"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/metrics"
)

var (
	sessionKey          = "oneui-session"
	SessionHeader       = "X-AccessToken"
	RefreshTokenHeader  = "X-Refresh-Token"
)

func GetUserInfo(r *http.Request, repo *repository.Repository, logger *logger.Logger) (*user.UserInfo, error) {
	sessionStr := ""
	tokenCookie, err := r.Cookie(SessionHeader)
	if err == nil && tokenCookie != nil {
		sessionStr = tokenCookie.Value
		logger.Debug(fmt.Sprintf("Got token from %s cookie", SessionHeader))
	}

	if sessionStr == "" {
		cookie, err := r.Cookie(sessionKey)
		if err != nil {
			if errors.Is(err, http.ErrNoCookie) {
				logger.Info(fmt.Sprintf("No session cookies found. Available headers: %s", r.Header))
				return nil, errors.New(fmt.Sprintf("Session cookie '%s' not found in request", sessionKey))
			}

			return nil, errors.New(fmt.Sprintf("Error retrieving cookie '%s': %v", sessionKey, err))
		}
		sessionStr = cookie.Value
		logger.Debug(fmt.Sprintf("Got token from %s cookie", sessionKey))
	}

	sessionVals := strings.Split(sessionStr, ":")
	if len(sessionVals) == 0 {
		return nil, errors.New("invalid session key (empty)")
	}
	token := sessionVals[0]

	val, found := repo.Cache.SessionCache.Get(token)
	metrics.CacheRPS.WithLabelValues().Inc()
	if found {
		return val.(*user.UserInfo), nil
	}

	resp, oauthErr := repo.Clients.OAuth.OAuthGetUserInfo(sessionVals[0])
	if oauthErr != nil {
		logger.Error("OAuth error getting user info", oauthErr)
		return nil, oauthErr
	}

	userInfo := &user.UserInfo{Username: resp.Username}
	if err := repo.Cache.SessionCache.Add(token, userInfo, cache.DefaultExpiration); err != nil {
		metrics.CacheErrors.WithLabelValues().Inc()
		logger.Error("failed to cache user info: %v", err)
	}

	return userInfo, nil
}
