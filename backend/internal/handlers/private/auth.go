package private

import (
	"context"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	"net/http"
)

func Login(ctx context.Context, svc *service.Service, req *http.Request, w *http.ResponseWriter, l *logger.Logger, r *requests.LoginRequest) (any, *responses.ErrorResponse) {
	accessToken, err := svc.Login(ctx, r.Username, r.Password)
	if err != nil {
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Не удалось выполнить вход",
			HTTPStatusCode:  svc.GetErrorStatusCode(err),
		}
	}

	cookies, err := svc.CreateAuthCookies(accessToken)
	if err != nil {
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Failed to create auth cookies",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	for _, cookie := range cookies {
		http.SetCookie(*w, cookie)
	}

	return accessToken, nil
}

func Register(ctx context.Context, svc *service.Service, req *http.Request, w *http.ResponseWriter, l *logger.Logger, r *requests.RegisterRequest) (any, *responses.ErrorResponse) {
	accessToken, err := svc.Register(ctx, r)
	if err != nil {
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Не удалось зарегистрироваться",
			HTTPStatusCode:  svc.GetErrorStatusCode(err),
		}
	}

	cookies, err := svc.CreateAuthCookies(accessToken)
	if err != nil {
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Failed to create auth cookies",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	for _, cookie := range cookies {
		http.SetCookie(*w, cookie)
	}

	return accessToken, nil
}

// AuthorizeUser godoc
//
//	@Summary		Start authorize oauth2 for user
//	@Description	Start authorize oauth2 for user
//	@Tags			oauth
//	@Param			redirect_url	query	string	false	"redirect url"
//	@Accept			json
//	@Produce		json
//	@Success		302
//	@Router			/auth/authorize [GET]
func AuthorizeUser(ctx context.Context, svc *service.Service, req *http.Request, w *http.ResponseWriter, l *logger.Logger, r *requests.AuthUserRequest) (any, *responses.ErrorResponse) {
	authUrl, err := svc.GetAuthorizationURL(r.RedirectUrl)
	if err != nil {
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Failed to get authorization URL",
			HTTPStatusCode:  svc.GetErrorStatusCode(err),
		}
	}

	http.Redirect(*w, req, authUrl, http.StatusFound)
	return nil, nil
}

// UserInfoV2Handler godoc
//
//	@Summary	who am i
//	@Tags		oauth
//	@Accept		json
//	@Produce	json
//	@Success	200	{object}	dto.UserInfo
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Failure	503	{object}	responses.ErrorResponse	"oauth service unavailable"
//	@Router		/auth/who_am_i [get]
func UserInfoV2Handler(ctx context.Context, svc *service.Service, req *http.Request, w *http.ResponseWriter, l *logger.Logger, r *requests.UserInfoRequest) (any, *responses.ErrorResponse) {
	token, err := req.Cookie(pkg.SessionHeader)
	if err != nil || token == nil {
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Не удалось получить токен",
			HTTPStatusCode:  http.StatusUnauthorized,
		}
	}
	userInfo, err := svc.GetUserInfo(ctx, token.Value)
	if err != nil {
		statusCode := svc.GetErrorStatusCode(err)
		message := "Не удалось получить информацию о пользователе"
		if svc.IsTokenExpiredError(err) {
			message = "Токен протух"
			statusCode = http.StatusUnauthorized
		}

		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: message,
			HTTPStatusCode:  statusCode,
		}
	}

	return userInfo, nil
}

// UserToken godoc
//
//	@Summary		Handel oauth2 token, to generate auth jwt token
//	@Description	Handel oauth2 token, to generate auth jwt token
//	@Tags			oauth
//	@Param			code			query	string	true	"oauth code"
//	@Param			redirect_uri	query	string	true	"oauth code"
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	dto.OAuthAccessToken
//	@Failure		400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure		401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure		403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure		500	{object}	responses.ErrorResponse	"Internal server error"
//	@Failure		503	{object}	responses.ErrorResponse	"oauth service unavailable"
//	@Router			/auth/token [GET]
func UserToken(ctx context.Context, svc *service.Service, req *http.Request, w *http.ResponseWriter, l *logger.Logger, r *requests.OAuthCodeRequest) (any, *responses.ErrorResponse) {
	accessToken, err := svc.ExchangeCodeForToken(r.Code, r.RedirectUri)
	if err != nil {
		statusCode := svc.GetErrorStatusCode(err)
		message := "Не удалось получить токен доступа"

		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: message,
			HTTPStatusCode:  statusCode,
		}
	}

	cookies, err := svc.CreateAuthCookies(accessToken)
	if err != nil {
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Failed to create auth cookies",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	for _, cookie := range cookies {
		http.SetCookie(*w, cookie)
	}

	return accessToken, nil
}

// RefreshJWT godoc
//
//	@Summary		RefreshSession jwt token for user
//	@Description	RefreshSession jwt token for user
//	@Tags			oauth
//	@Param			X-Refresh-Token	header	string	true	"user refresh token"
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	dto.OAuthAccessToken
//	@Failure		400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure		401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure		403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure		500	{object}	responses.ErrorResponse	"Internal server error"
//	@Failure		503	{object}	responses.ErrorResponse	"oauth service unavailable"
//	@Router			/auth/refresh [GET]
func RefreshJWT(ctx context.Context, svc *service.Service, req *http.Request, w *http.ResponseWriter, l *logger.Logger, r *requests.RefreshTokenRequest) (any, *responses.ErrorResponse) {
	token := req.Header.Get(pkg.RefreshTokenHeader)
	if token == "" {
		cookieToken, err := req.Cookie(pkg.RefreshTokenHeader)
		if err != nil || cookieToken == nil {
			return nil, &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "Не удалось получить refresh токен",
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}

		token = cookieToken.Value
	}

	result, err := svc.RefreshAccessToken(token)
	if err != nil {
		statusCode := svc.GetErrorStatusCode(err)
		message := "Не удалось создать access и refresh токен"

		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: message,
			HTTPStatusCode:  statusCode,
		}
	}

	cookies, err := svc.CreateAuthCookies(result)
	if err != nil {
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "Failed to create auth cookies",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	for _, cookie := range cookies {
		http.SetCookie(*w, cookie)
	}

	return result, nil
}

// Logout godoc
//
//	@Summary	Logout
//
//	@Tags		oauth
//	@Produce	json
//	@Success	200
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/auth/logout [GET]
func Logout(ctx context.Context, svc *service.Service, req *http.Request, w *http.ResponseWriter, l *logger.Logger, r *requests.LogoutRequest) (any, *responses.ErrorResponse) {
	cookies := svc.CreateLogoutCookies()
	for _, cookie := range cookies {
		http.SetCookie(*w, cookie)
	}

	return nil, nil
}
