package shared

import (
	"context"
	"database/sql"
	"errors"
	"net/http"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	svcerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

var superUserHeader = "X-SuperUser-Token"

func CheckPermission(ctx context.Context, l *logger.Logger, svc *service.Service, objectType service.ACLObjectType, objectAttribute service.ACLObjectAttribute, action service.ACLAction, objectID int32, userInfo *user.UserInfo) *responses.ErrorResponse {
	headers := getHeaders(ctx)
	var token string
	if headers != nil {
		token = headers.Get(superUserHeader)
	}
	if headers == nil {
		l.Info("no headers present, can't check superuser, proceeding with permission check")
	}

	allow, err := svc.CheckPermission(ctx, token, objectType, objectAttribute, action, userInfo, objectID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "permission not found",
				HTTPStatusCode:  http.StatusForbidden,
			}
		}
		// Используем convertServiceError для единообразной обработки
		var svcErr *svcerrors.ServiceError
		if errors.As(err, &svcErr) {
			return convertServiceError(svcErr, EntityPermissionDenied)
		}
		// Fallback для обычных ошибок
		return PermissionDeniedError(err, EntityPermissionDenied)
	}

	if !allow {
		return PermissionDeniedError(err, EntityPermissionDenied)
	}

	return nil
}
