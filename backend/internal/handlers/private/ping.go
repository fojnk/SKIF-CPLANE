package private

import (
	"context"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

type PingRequest struct{}

type pingResponse struct {
	Message string `json:"message"`
}

// PingHandler godoc
//
//	@Summary		ping me
//	@Description	As if to say even louder to the world: here is the best ping handler in the world
//	@Tags			meta
//	@Produce		json
//	@Success		200	{object}	pingResponse
//	@Failure		400	{object}	responses.ErrorResponse				"Bad Request"
//	@Failure		403	{object}	responses.ErrorResponse				"Forbidden"
//	@Failure		404	{object}	responses.CreateAppBannerResponse	"Not Found"
//	@Failure		500	{object}	responses.ErrorResponse				"Internal server error"
//	@Router			/api/v1/ping [get]
func PingHandler(_ context.Context, _ *service.Service, _ *logger.Logger, _ *PingRequest, _ *user.UserInfo) (any, *responses.ErrorResponse) {
	message := "pong"
	return &pingResponse{Message: message}, nil
}

type versionResponse struct {
	Version string `json:"version"`
}

// VersionHandler godoc
//
//	@Summary	get current project version
//	@Tags		meta
//	@Produce	json
//	@Success	200	{object}	versionResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/version [get]
func VersionHandler(_ context.Context, svc *service.Service, _ *logger.Logger, _ *struct{}, _ *user.UserInfo) (any, *responses.ErrorResponse) {
	return &versionResponse{Version: svc.GetVersion()}, nil
}
