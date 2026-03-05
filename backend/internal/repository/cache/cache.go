package cache

import (
	"github.com/patrickmn/go-cache"
	"time"
)

type SessionCacheConfig struct {
	ExpirationTime  time.Duration `json:"expiration_time"`
	CleanupInterval time.Duration `json:"cleanup_interval"`
}

type TokenCache struct {
	SessionCache *cache.Cache
}

func NewTokenCache(config SessionCacheConfig) *TokenCache {
	return &TokenCache{
		SessionCache: cache.New(config.ExpirationTime, config.CleanupInterval),
	}
}
