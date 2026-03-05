package private

import (
	"context"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	idm_roles "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/idm"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	"net/http"
)

// createProjectRolesHandler godoc
//
//	@Summary	create and push project roles to idm
//	@Tags		idm
//	@Accept		json
//	@Produce	json
//	@Param		x-superuser-token	header		string								false	"superuser token"
//	@Param		request				body		requests.CreateProjectRolesRequest	true	"request body"
//	@Success	200					{object}	responses.CreateProjectRolesResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/idm/project/roles [post]
func createProjectRolesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateProjectRolesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.ProjectAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	projectsWithoutRole, err := svc.Repo.DB.GetProjectsWithoutRole(ctx)
	if err != nil {
		l.Error("failed to get projects", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	rolesCreated := 0
	for _, project := range projectsWithoutRole {
		err = idm_roles.CreateProjectOwnerRole(ctx, svc.Repo, l, project.ID, 0, u)
		if err != nil {
			return nil, &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "Failed to create project developer role",
				HTTPStatusCode:  http.StatusInternalServerError,
			}
		}
		rolesCreated++
	}

	return responses.CreateProjectRolesResponse{
		RolesCreated: int32(rolesCreated),
	}, nil
}

// createNamespaceRolesHandler godoc
//
//	@Summary	create and push namespace roles to idm
//	@Tags		idm
//	@Accept		json
//	@Produce	json
//	@Param		x-superuser-token	header		string									false	"superuser token"
//	@Param		request				body		requests.CreateNamespaceRolesRequest	true	"request body"
//	@Success	200					{object}	responses.CreateNamespaceRolesResponse
//	@Failure	400					{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401					{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403					{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404					{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500					{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/idm/namespace/roles [post]
func createNamespaceRolesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateNamespaceRolesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.ProjectAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	namespacesWithoutRole, err := svc.Repo.DB.GetNamespacesWithoutRole(ctx)
	if err != nil {
		l.Error("failed to get namespace", err)
		return nil, shared.ConvertServiceError(err, shared.EntityNamespace)
	}

	rolesCreated := 0
	for _, namespace := range namespacesWithoutRole {
		err = idm_roles.CreateNamespaceOwnerRole(ctx, svc.Repo, l, namespace.ID, u)
		if err != nil {
			return nil, &responses.ErrorResponse{
				ExternalMessage: "failed to create namespace owner role",
				InternalError:   err,
				HTTPStatusCode:  http.StatusInternalServerError,
			}
		}
		rolesCreated++
	}

	return responses.CreateNamespaceRolesResponse{
		RolesCreated: int32(rolesCreated),
	}, nil
}
