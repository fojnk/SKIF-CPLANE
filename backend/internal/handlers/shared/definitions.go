package shared

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	"net/http"
)

type Handler = func(*service.Service, *http.Request, *logger.Logger, *user.UserInfo) (any, *responses.ErrorResponse)

type AuthHandler = func(*service.Service, *http.Request, *http.ResponseWriter, *logger.Logger) (any, *responses.ErrorResponse)

type Definition struct {
	Path        string
	Method      string
	Handler     Handler
	DisableAuth bool
}

type AuthDefinition struct {
	Path        string
	Method      string
	Handler     AuthHandler
	DisableAuth bool
}
