package jwt_client

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	errs "github.com/pkg/errors"
)

type TokenInfo struct {
	Token     string    `json:"token"`
	ExpiresIn time.Time `json:"expires_in"`
}

type JWTConfig struct {
	JWTSecret         string `yaml:"jwt-secret"`
	AccessExpiration  int    `yaml:"access_expiration"`
	RefreshExpiration int    `yaml:"refresh_expiration"`
}

type Client struct {
	jwtSecret         []byte
	AccessExpireTime  time.Duration
	RefreshExpireTime time.Duration
}

func NewJWTClient(JWTSecret string, aExpTime, rExpTime int) *Client {
	return &Client{
		jwtSecret:         []byte(JWTSecret),
		AccessExpireTime:  time.Duration(aExpTime) * time.Second,
		RefreshExpireTime: time.Duration(rExpTime) * time.Second,
	}
}

type JwtUserClaims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func (j *Client) CreateJWT(username string, expire time.Time) (*TokenInfo, error) {
	if expire.Before(time.Now()) {
		return nil, errs.New("token expire time is in past")
	}
	claims := JwtUserClaims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expire),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	if len(j.jwtSecret) == 0 {
		return nil, errs.New("invalid secret")
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS512, claims)

	signedToken, err := token.SignedString(j.jwtSecret)
	if err != nil {
		return nil, err
	}

	tokenInfo := &TokenInfo{
		Token:     signedToken,
		ExpiresIn: expire,
	}

	return tokenInfo, nil
}

func (j *Client) ValidateJWT(token string) (*JwtUserClaims, error) {
	jwtToken, err := jwt.ParseWithClaims(token, &JwtUserClaims{}, func(token *jwt.Token) (interface{}, error) {
		return j.jwtSecret, nil
	})
	if jwtToken == nil {
		return nil, errs.Wrap(jwt.ErrTokenMalformed, "That's not even a token")
	}
	switch {
	case jwtToken.Valid:

	case errors.Is(err, jwt.ErrTokenMalformed):
		err = errs.Wrap(err, "That's not even a token")
	case errors.Is(err, jwt.ErrTokenSignatureInvalid):
		err = errs.Wrap(err, "Invalid signature")
	case errors.Is(err, jwt.ErrTokenExpired) || errors.Is(err, jwt.ErrTokenNotValidYet):
		err = errs.Wrapf(err, "Token expired or not valid date")
	default:
		err = errs.Wrap(err, "Couldn't handle this token: %v")
	}
	if err != nil {
		return nil, err
	}
	return jwtToken.Claims.(*JwtUserClaims), nil
}

func (j *Client) CreateAccessAndRefreshJWT(username string) (*TokenInfo, *TokenInfo, error) {
	accessExpire := time.Now().Add(j.AccessExpireTime)
	refreshExpire := time.Now().Add(j.RefreshExpireTime)

	accessToken, err := j.CreateJWT(username, accessExpire)
	if err != nil {
		return nil, nil, err
	}

	refreshToken, err := j.CreateJWT(username, refreshExpire)
	if err != nil {
		return nil, nil, err
	}

	return accessToken, refreshToken, nil
}

func (j *Client) CreateRobotToken(username string) (*TokenInfo, error) {
	accessExpire := time.Now().Add(j.RefreshExpireTime * 10)

	accessToken, err := j.CreateJWT(username, accessExpire)
	if err != nil {
		return nil, err
	}

	return accessToken, nil
}

func (j *Client) RefreshToken(refreshToken string) (*TokenInfo, *TokenInfo, error) {
	claims, err := j.ValidateJWT(refreshToken)
	if err != nil {
		return nil, nil, err
	}

	accessToken, refresh, err := j.CreateAccessAndRefreshJWT(claims.Username)
	if err != nil {
		return nil, nil, err
	}

	return accessToken, refresh, nil
}
