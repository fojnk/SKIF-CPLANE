package private

import (
	"context"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	"net/http"
	"strings"
)

func toACLObjectType(raw string) (service.ACLObjectType, bool) {
	switch requests.NormalizeObjectTypeAlias(strings.ToLower(raw)) {
	case "experiment":
		return acl.Experiment, true
	case "dataset":
		return acl.Dataset, true
	case "project":
		return acl.Project, true
	case "namespace":
		return acl.Namespace, true
	case "cube":
		return acl.Cube, true
	default:
		return "", false
	}
}

// CheckACLHandler godoc
//
//	@Summary	list user's permitted actions on the given object
//	@Tags		acl
//	@Param		object_type	query	string	true	"object type (experiment, dataset, project, namespace)"
//	@Param		object_id	query	int		true	"object id"
//	@Produce	json
//	@Param		x-superuser-token	header		string	false	"superuser token"
//	@Success	200					{object}	responses.CheckACLResponse
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/acl/check [get]
func CheckACLHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CheckACLRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	objectType, ok := toACLObjectType(r.ObjectType)
	if !ok {
		return nil, &responses.ErrorResponse{
			ExternalMessage: "unsupported object type",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	if err := shared.CheckPermission(ctx, l, svc, objectType, acl.NoAttribute, acl.Read, r.ObjectID, u); err != nil {
		return nil, err
	}

	var err error

	var rights []acl.Right

	switch requests.NormalizeObjectTypeAlias(strings.ToLower(r.ObjectType)) {
	case "experiment":
		rights, err = svc.GetExperimentRights(ctx, u, r.ObjectID)
		if err != nil {
			l.Error("failed to get experiment rights", err)
			return nil, &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "failed to get experiment rights",
				HTTPStatusCode:  http.StatusInternalServerError,
			}
		}
	case "dataset":
		rights, err = svc.GetDatasetRights(ctx, u, r.ObjectID)
		if err != nil {
			l.Error("failed to get dataset rights", err)
			return nil, &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "failed to get dataset rights",
				HTTPStatusCode:  http.StatusInternalServerError,
			}
		}
	case "project":
		rights, err = svc.GetProjectRights(ctx, u, r.ObjectID)
		if err != nil {
			l.Error("failed to get project rights", err)
			return nil, &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "failed to get project rights",
				HTTPStatusCode:  http.StatusInternalServerError,
			}
		}
	case "namespace":
		rights, err = svc.GetNamespaceRights(ctx, u, r.ObjectID)
		if err != nil {
			l.Error("failed to get project rights", err)
			return nil, &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "failed to get namespace rights",
				HTTPStatusCode:  http.StatusInternalServerError,
			}
		}
	default:
		rights = make([]acl.Right, 0)
	}

	return &responses.CheckACLResponse{
		Rights: rights,
	}, nil
}

// GetUsersPermissionsHandler godoc
//
//	@Summary	list users and permitted actions on the given object
//	@Tags		acl
//	@Param		object_type	query	string	true	"object type (experiment, dataset, project, namespace)"
//	@Param		object_id	query	int		true	"object id"
//	@Param		limit		query	int		true	"limit"
//	@Param		offset		query	int		true	"offset"
//	@Param		search		query	string	false	"search"
//
//	@Produce	json
//	@Param		x-superuser-token	header		string	false	"superuser token"
//	@Success	200					{object}	responses.UsersACLResponse
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/acl/users [get]
func GetUsersPermissionsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UsersACLRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	objectType, ok := toACLObjectType(r.ObjectType)
	if !ok {
		return nil, &responses.ErrorResponse{
			ExternalMessage: "unsupported object type",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	if err := shared.CheckPermission(ctx, l, svc, objectType, acl.NoAttribute, acl.Read, r.ObjectID, u); err != nil {
		return nil, err
	}

	users, total, err := svc.GetUsersPermissions(ctx, requests.NormalizeObjectTypeAlias(strings.ToLower(r.ObjectType)), r.ObjectID, r.Search, r.Limit, *r.Offset)
	if err != nil {
		l.Error("failed to get users permissions", err)
		return nil, &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to get users permissions",
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	var res responses.UsersACLResponse
	res.Total = total
	res.Pages = shared.GetPages(total, int64(r.Limit))
	res.Users = users

	return &res, nil
}
