package shared

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5/middleware"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/oauth"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	svcerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type externalError struct {
	Error string `json:"error"`
}

func UpdateValueString(prev, new string) string {
	if new != "" {
		return new
	}
	return prev
}

func UpdateValueBoolean(prev bool, new *bool) bool {
	if new != nil {
		return *new
	}
	return prev
}

func marshalError(errResp *responses.ErrorResponse, w http.ResponseWriter, logger *logger.Logger, isTestEnv bool) {

	var eBytes []byte
	var err error

	// В тестах используем формат ErrorResponse (соответствует swagger spec)
	if isTestEnv {
		//если в ошибке нет текстового пояснения, то устанавливаем стандартное
		if strings.TrimSpace(errResp.ExternalMessage) == "" {
			errResp.ExternalMessage = "Текстовое пояснение ошибки отсутствует"
		}
		// Используем errResp напрямую, но скрываем InternalError
		// так как error не маршалится в JSON
		clientResp := map[string]any{
			"external_message": errResp.ExternalMessage,
			"http_status_code": errResp.HTTPStatusCode,
		}
		eBytes, err = json.Marshal(clientResp)
	} else {
		// В проде используем старый формат для обратной совместимости
		e := externalError{Error: errResp.ExternalMessage}
		eBytes, err = json.Marshal(e)
	}

	if err != nil {
		logger.Error("error marshalling error", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if _, err := w.Write(eBytes); err != nil {
		logger.Error("error while writing response", err)
	}
}

func WrapHandler(h Handler, svc *service.Service, disableAuth bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logger := svc.GetLogger().With("request_id", fmt.Sprintf("%s", r.Context().Value(middleware.RequestIDKey)))
		isTestEnv := svc.IsTestEnvironment()
		token := r.Header.Get("X-Auth-Token")
		if !disableAuth {
			if token != svc.GetAuthToken() {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				if _, err := w.Write([]byte("X-Auth-Token is invalid")); err != nil {
					logger.Error("error while writing response", err)
				}
				return
			}
		}

		var info *user.UserInfo
		superUserToken := r.Header.Get(superUserHeader)
		isSuperUser := superUserToken == svc.GetACLToken()
		if !disableAuth && !isSuperUser {
			var err error
			info, err = svc.GetUserInfoFromRequest(r)
			if err != nil || info == nil {
				if err == nil {
					err = fmt.Errorf("user info is nil")
				}

				logger.Error("error client auth", err)

				// Определяем правильный статус код на основе типа ошибки
				statusCode := http.StatusUnauthorized
				message := "Нет доступа"

				// Проверяем, является ли это ошибкой OAuth с истекшим токеном
				if oauthErr, ok := err.(*oauth.OAuthError); ok && oauthErr != nil {
					if oauthErr.IsTokenExpired() {
						statusCode = http.StatusUnauthorized
						message = "Токен протух, обновите страницу"
					} else if oauthErr.IsNetworkError {
						statusCode = http.StatusServiceUnavailable
						message = "Сервис авторизации временно недоступен"
					} else if oauthErr.StatusCode >= 400 && oauthErr.StatusCode < 500 {
						statusCode = http.StatusBadRequest
						message = "Неправильный запрос"
					}
				}

				errResp := &responses.ErrorResponse{
					ExternalMessage: message,
					InternalError:   err,
					HTTPStatusCode:  statusCode,
				}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(statusCode)
				marshalError(errResp, w, logger, isTestEnv)
				return
			}
		} else { // using else because userInfo must not be nil
			info = &user.UserInfo{
				Username: "noauth-user",
			}
		}

		resp, sErr := h(svc, r, logger, info)
		if sErr != nil {
			logErr := sErr.InternalError
			if logErr == nil {
				logErr = fmt.Errorf("service error: %s", sErr.ExternalMessage)
			}
			logger.Error("error processing query", logErr)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(sErr.HTTPStatusCode)
			marshalError(sErr, w, logger, isTestEnv)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		respBytes, err := json.Marshal(resp)
		if err != nil {
			logger.Error("error marshalling response", err)
			w.WriteHeader(http.StatusInternalServerError)
			_, err := w.Write([]byte("Internal server error"))
			if err != nil {
				logger.Error("error while writing response", err)
			}

			return
		}

		if _, err := w.Write(respBytes); err != nil {
			logger.Error("error while writing response", err)
		}
	}
}

func AuthWrapHandler(h AuthHandler, svc *service.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logger := svc.GetLogger().With("request_id", fmt.Sprintf("%s", r.Context().Value(middleware.RequestIDKey)))
		isTestEnv := svc.IsTestEnvironment()
		resp, sErr := h(svc, r, &w, logger)
		if sErr != nil {
			logErr := sErr.InternalError
			if logErr == nil {
				logErr = fmt.Errorf("service error: %s", sErr.ExternalMessage)
			}
			logger.Error("error processing query", logErr)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(sErr.HTTPStatusCode)
			marshalError(sErr, w, logger, isTestEnv)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		respBytes, err := json.Marshal(resp)
		if err != nil {
			logger.Error("error marshalling response", err)
			w.WriteHeader(http.StatusInternalServerError)
			_, err := w.Write([]byte("Internal server error"))
			if err != nil {
				logger.Error("error while writing response", err)
			}

			return
		}

		if _, err := w.Write(respBytes); err != nil {
			logger.Error("error while writing response", err)
		}
	}
}

func CreateAuthHandler[T any](
	process func(context.Context, *service.Service, *http.Request, *http.ResponseWriter, *logger.Logger, *T) (any, *responses.ErrorResponse),
	setParam func(*T, string, string) *responses.ErrorResponse,
	validate func(*T) error,
	pathParams ...string,
) AuthHandler {
	return func(svc *service.Service, r *http.Request, w *http.ResponseWriter, logger *logger.Logger) (any, *responses.ErrorResponse) {
		parsed, err := ParseRequest(r, setParam, pathParams...)
		if err != nil {
			return nil, err
		}

		if err := validate(parsed); err != nil {
			return nil, &responses.ErrorResponse{
				ExternalMessage: err.Error(),
				InternalError:   err,
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}

		ctx := setHeaders(r.Context(), r)

		return process(ctx, svc, r, w, logger, parsed)
	}
}

func CreateHandler[T any](
	process func(context.Context, *service.Service, *logger.Logger, *T, *user.UserInfo) (any, *responses.ErrorResponse),
	setParam func(*T, string, string) *responses.ErrorResponse,
	validate func(*T) error,
	pathParams ...string,
) Handler {
	return func(svc *service.Service, r *http.Request, logger *logger.Logger, u *user.UserInfo) (any, *responses.ErrorResponse) {
		parsed, err := ParseRequest(r, setParam, pathParams...)
		if err != nil {
			return nil, err
		}

		if err := validate(parsed); err != nil {
			return nil, &responses.ErrorResponse{
				ExternalMessage: err.Error(),
				InternalError:   err,
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}

		ctx := setHeaders(r.Context(), r)

		return process(ctx, svc, logger, parsed, u)
	}
}

func ParseRequest[T any](
	r *http.Request,
	setParam func(*T, string, string) *responses.ErrorResponse,
	pathParams ...string,
) (*T, *responses.ErrorResponse) {
	var request T
	var empty T

	defer func() {
		_ = r.Body.Close()
	}()

	if r.Body != http.NoBody {
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			return &empty, &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "Invalid JSON Format",
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}
	}

	for _, key := range pathParams {
		// Get from query parameters
		v, ok := r.URL.Query()[key]
		if !ok || len(v) == 0 {
			continue
		}

		if err := setParam(&request, key, v[0]); err != nil {
			return &empty, err
		}
	}

	return &request, nil
}

func GetPages(total int64, limit int64) int64 {
	pagesDec := total / limit
	pagesLeft := total % limit
	if pagesLeft > 0 {
		pagesDec++
	}
	return pagesDec
}

type headersKey struct{}

func setHeaders(ctx context.Context, r *http.Request) context.Context {
	return context.WithValue(ctx, headersKey{}, r.Header)
}

func getHeaders(ctx context.Context) http.Header {
	headers, ok := ctx.Value(headersKey{}).(http.Header)
	if !ok {
		return nil
	}
	return headers
}

func GetPathAndCluster(dsParams string) (*string, *string) {
	var sourceParams models.SourceParams
	err := json.Unmarshal([]byte(dsParams), &sourceParams)
	if err != nil {
		return nil, nil
	}

	return &sourceParams.YT.Path, &sourceParams.YT.Cluster
}

// ConvertServiceError преобразует ServiceError в ErrorResponse
// Использует детализированные сообщения из сервисного слоя
func ConvertServiceError(err error, entity EntityType) *responses.ErrorResponse {
	if err == nil {
		return nil
	}

	var svcErr *svcerrors.ServiceError
	if errors.As(err, &svcErr) {
		// Используем внутреннюю функцию convertServiceError, которая обрабатывает коды ошибок
		return convertServiceError(svcErr, entity)
	}

	// Для обычных ошибок используем fallback из shared
	return InternalServerError(err, entity)
}

// ConvertServiceErrorSimple - упрощенная версия без entityType (использует ToErrorResponse)
func ConvertServiceErrorSimple(err error) *responses.ErrorResponse {
	if err == nil {
		return nil
	}

	resp := svcerrors.ToErrorResponse(err)
	if resp != nil && resp.InternalError == nil {
		var svcErr *svcerrors.ServiceError
		if errors.As(err, &svcErr) {
			resp.InternalError = svcErr
		}
	}

	return resp
}
