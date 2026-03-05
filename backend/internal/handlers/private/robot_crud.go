package private

import (
	"context"
	"github.com/jackc/pgx/v5/pgtype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	"net/http"
)

// createRobotHandler godoc
//
//	@Summary	create robot
//	@Tags		robot
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.CreateRobotRequest	true	"request body"
//	@Param		x-superuser-token	header		string						false	"superuser token"
//	@Success	200					{object}	responses.CreateRobotResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/robot [post]
func createRobotHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateRobotRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.ProjectAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	_, err := svc.GetUserIDByName(ctx, r.Name)
	if err == nil {
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "robot already exists",
			HTTPStatusCode:  http.StatusConflict,
		}
	}

	robotID, err := svc.CreateRobot(ctx, r.Name)
	if err != nil {
		l.Error("failed to create robot", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}

	token, err := svc.GenerateRobotTokenViaJWT(r.Name)
	if err != nil {
		l.Error("failed to generate robot token", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to create token for robot",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	_, err = svc.CreateRobotToken(ctx, robotID, token.Token, pgtype.Timestamp{Time: token.ExpiresIn, Valid: true})
	if err != nil {
		l.Error("failed to save robot token", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to insert robot token",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	return &responses.CreateRobotResponse{
		ID:    robotID,
		Token: *token,
		Name:  r.Name,
	}, nil
}

// generateTokenForRobotHandler godoc
//
//	@Summary	generate robot token
//	@Tags		robot
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.GenerateTokenForRobotRequest	true	"request body"
//	@Param		x-superuser-token	header		string									false	"superuser token"
//	@Success	200					{object}	responses.CreateRobotResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/robot/token [post]
func generateTokenForRobotHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GenerateTokenForRobotRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.ProjectAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	robotID, err := svc.GetUserIDByName(ctx, r.Name)
	if err != nil {
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "unknown robot",
			HTTPStatusCode:  http.StatusForbidden,
		}
	}

	token, err := svc.GenerateRobotTokenViaJWT(r.Name)
	if err != nil {
		l.Error("failed to generate robot token", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to create token for robot",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	_, err = svc.CreateRobotToken(ctx, robotID, token.Token, pgtype.Timestamp{Time: token.ExpiresIn, Valid: true})
	if err != nil {
		l.Error("failed to save robot token", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to insert robot token",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	return &responses.GenerateTokenRobotResponse{
		ID:    robotID,
		Name:  r.Name,
		Token: *token,
	}, nil
}

// deleteAllRobotTokensHandler godoc
//
//	@Summary	delete all robot tokens
//	@Tags		robot
//	@Accept		json
//	@Produce	json
//	@Param		request				body		requests.DeleteAllTokenForRobotRequest	true	"request body"
//	@Param		x-superuser-token	header		string									false	"superuser token"
//	@Success	200					{object}	responses.EmptyResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/robot/tokens [delete]
func deleteAllRobotTokensHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteAllTokenForRobotRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.ProjectAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	robotID, err := svc.GetUserIDByName(ctx, r.Name)
	if err != nil {
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "unknown robot",
			HTTPStatusCode:  http.StatusForbidden,
		}
	}

	err = svc.DeleteAllRobotTokens(ctx, robotID)
	if err != nil {
		l.Error("failed to delete robot tokens", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}

	return &responses.EmptyResponse{}, nil
}
