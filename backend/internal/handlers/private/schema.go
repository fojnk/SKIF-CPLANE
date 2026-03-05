package private

import (
	"context"
	"net/http"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

// getConfigSchemaHandler godoc
//
//	@Summary	get config schema by config type
//	@Tags		schema
//	@Param		config_type	query	string	true	"config type"
//	@Produce	json
//	@Success	200	{object}	responses.GetSchemaResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/schema [get]
func getConfigSchemaHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetSchemaRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	schema, err := svc.GetConfigSchema(ctx, r.ConfigType)
	if err != nil {
		l.Error("failed to get config schema", err)
		return nil, &responses.ErrorResponse{
			ExternalMessage: "failed to get config schema",
			InternalError:   err,
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	return &responses.GetSchemaResponse{ConfigSchema: schema}, nil
}
