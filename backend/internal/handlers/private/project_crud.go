package private

import (
	"context"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/validation"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	"net/http"
)

// validateProjectConfigHandler godoc
//
//	@Summary	validate project config
//	@Tags		project
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ProjectValidateRequest	true	"request body"
//	@Success	200		{object}	responses.ValidationResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/project/config/validate [post]
func validateProjectConfigHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ProjectValidateRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	err := validation.ProjectSyntaxConfigValidation(r.ProjectConfig)
	if err != nil {
		l.Error("failed to validate project config", err)
		return responses.ValidationResponse{
			Success: false,
			Errors:  err.Error(),
		}, nil
	}

	return responses.ValidationResponse{
		Success: true,
	}, nil
}

// createProjectHandler godoc
//
//	@Summary	create project
//	@Tags		project
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CreateProjectRequest	true	"request body"
//	@Success	200		{object}	responses.CreateProjectResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	409		{object}	responses.ErrorResponse	"Conflict - resource already exists"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/project [post]
func createProjectHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateProjectRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.ProjectAttribute, acl.Create, r.NamespaceID, u); err != nil {
		return nil, err
	}

	projectDTO := dto.Project{
		Name:        r.Name,
		Description: r.Description,
	}

	project, err := svc.CreateProject(ctx, projectDTO, r.NamespaceID)
	if err != nil {
		l.Error("failed to create project", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	svc.LogProjectChange(ctx, r.NamespaceID, project.ID, u.Username, r.Comment, update_log.ActionNew, update_log.ProjectUpdateLog{
		New: update_log.Project{
			Name:        r.Name,
			Description: r.Description,
		},
	})

	return &responses.CreateProjectResponse{
		ID:          project.ID,
		Name:        project.Name,
		Description: project.Description,
	}, nil
}

// listProjectsHandler godoc
//
//	@Summary	list projects in namespace
//	@Tags		project
//	@Param		namespace_id	query	int	true	"namespace id"
//	@Produce	json
//	@Success	200	{object}	responses.ListProjectsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/projects [get]
func listProjectsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListProjectsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.ProjectAttribute, acl.Read, r.NamespaceID, u); err != nil {
		return nil, err
	}

	projects, err := svc.ListProjects(ctx, r.NamespaceID)
	if err != nil {
		l.Error("failed to select project list", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	var res responses.ListProjectsResponse
	for _, project := range projects {
		res.Projects = append(res.Projects, dto.Project{
			ID:          project.ID,
			Name:        project.Name,
			Description: project.Description,
		})
	}

	return &res, nil
}

// deleteProjectHandler godoc
//
//	@Summary	delete project
//	@Tags		project
//	@Accept		json
//	@Param		request	body	requests.DeleteProjectRequest	true	"request body"
//	@Success	200
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/project [delete]
func deleteProjectHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteProjectRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.NoAttribute, acl.Delete, r.ID, u); err != nil {
		return nil, err
	}

	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user from database", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}

	// Get project info before deletion for logging
	project, err := svc.GetProjectInfo(ctx, userID, r.ID)
	if err != nil {
		l.Error("failed to get project info", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	if err := svc.DeleteProject(ctx, userID, r.ID); err != nil {
		l.Error("failed to delete project", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	svc.LogProjectChange(ctx, project.NamespaceID, project.ID, u.Username, "", update_log.ActionDelete, update_log.ProjectUpdateLog{
		Old: update_log.Project{
			Name:        project.Name,
			Description: project.Description,
			Config:      string(project.Config),
		},
	})

	return nil, nil
}

// updateProjectHandler godoc
//
//	@Summary	update project
//	@Tags		project
//	@Accept		json
//	@Param		request	body		requests.UpdateProjectRequest	true	"request body"
//	@Success	200		{object}	responses.UpdateProjectResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/project [put]
func updateProjectHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateProjectRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.MetaAttribute, acl.Edit, r.ID, u); err != nil {
		return nil, err
	}

	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user from database", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}

	oldProject, err := svc.GetProjectInfo(ctx, userID, r.ID)
	if err != nil {
		l.Error("failed to get project info", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	projectDTO := dto.Project{
		ID:          r.ID,
		Name:        r.Name,
		Description: r.Description,
		Config:      r.Config,
	}

	updatedProject, err := svc.UpdateProject(ctx, userID, projectDTO)
	if err != nil {
		l.Error("failed to update project", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	// Get final project state
	project, err := svc.GetProjectInfo(ctx, userID, r.ID)
	if err != nil {
		l.Error("failed to get updated project info", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	svc.LogProjectChange(ctx, project.NamespaceID, project.ID, u.Username, r.Comment, update_log.ActionUpdate, update_log.ProjectUpdateLog{
		New: update_log.Project{
			Name:        project.Name,
			Description: project.Description,
			Config:      project.Config,
		},
		Old: update_log.Project{
			Name:        oldProject.Name,
			Description: oldProject.Description,
			Config:      oldProject.Config,
		},
	})

	return &responses.UpdateProjectResponse{
		Project: dto.Project{
			ID:          updatedProject.ID,
			Name:        updatedProject.Name,
			Description: updatedProject.Description,
			Config:      updatedProject.Config,
		},
	}, nil
}

// getProjectV2Handler godoc
//
//	@Summary	get project by id
//	@Tags		project
//	@Param		project_id	query	int	true	"project id"
//	@Produce	json
//	@Success	200	{object}	responses.GetProjectV2Response
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/project [get]
func getProjectV2Handler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetProjectRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.MetaAttribute, acl.Read, r.ProjectID, u); err != nil {
		return nil, err
	}

	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user from database", err)
	}

	project, pinned, err := svc.GetProjectInfoV2(ctx, r.ProjectID, userID)
	if err != nil {
		l.Error("failed to get project info", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	rights, err := svc.GetProjectRights(ctx, u, r.ProjectID)
	if err != nil {
		l.Error("failed to update project config", err)
		l.Error("failed to get project rights", err)
	}

	return &responses.GetProjectV2Response{
		ID:            project.ID,
		Name:          project.Name,
		Description:   project.Description,
		Config:        project.Config,
		NamespaceName: project.NamespaceName,
		NamespaceID:   project.NamespaceID,
		Rights:        rights,
		IsPinned:      pinned,
	}, nil
}

// listProjectConfigsHandler godoc
//
//	@Summary	list project configs
//	@Tags		project
//	@Param		project_id	query	int	true	"project id"
//	@Produce	json
//	@Success	200	{object}	responses.ListProjectConfigsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/project/configs [get]
func listProjectConfigsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListProjectConfigsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.MetaAttribute, acl.Read, r.ProjectID, u); err != nil {
		return nil, err
	}

	configs, err := svc.ListProjectConfigs(ctx, r.ProjectID)
	if err != nil {
		l.Error("failed to list project configs", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	var res responses.ListProjectConfigsResponse
	if configs != nil {
		res.Configs = *configs
	}

	return &res, nil
}

// getProjectConfigHandler godoc
//
//	@Summary	get project config by id
//	@Tags		project
//	@Param		config_id	query	int	true	"config id"
//	@Produce	json
//	@Success	200	{object}	responses.GetProjectConfigResponse
//	@Router		/api/v1/project/config [get]
func getProjectConfigHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetProjectConfigRequest, _ *user.UserInfo) (any, *responses.ErrorResponse) {
	config, err := svc.GetProjectConfig(ctx, r.ConfigID)
	if err != nil {
		l.Error("failed to get project config", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	var res responses.GetProjectConfigResponse
	res.Config = *config

	return &res, nil
}

// listProjectsPostHandlerV2 godoc
//
//	@Summary	search projects with filters
//	@Tags		project
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.ListProjectsRequestV2	true	"request body"
//	@Success	200		{object}	responses.ListProjectsResponseV2
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/projects [post]
func listProjectsPostHandlerV2(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListProjectsRequestV2, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.ProjectAttribute, acl.Read, r.NamespaceID, u); err != nil {
		return nil, err
	}

	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user from database", err)
		userID = 0
	}

	projectInfos, total, err := svc.ListProjectsV2(ctx, dbcore.SelectProjectsV2Params{
		Limit:     r.Limit,
		Offset:    *r.Offset,
		Search:    r.Search,
		Namespace: r.NamespaceID,
		OrderBy:   r.OrderBy,
		UserID:    userID,
	})
	if err != nil {
		l.Error("failed to list projects", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	var res responses.ListProjectsResponseV2
	for _, project := range projectInfos {
		rights, err := svc.GetProjectRights(ctx, u, project.ID)
		if err != nil {
			l.Error("failed to get project rights", err)
		}

		projectWithRights := project
		projectWithRights.Rights = rights
		res.Projects = append(res.Projects, projectWithRights)
	}
	res.Total = total
	res.Pages = shared.GetPages(total, int64(r.Limit))

	return &res, nil
}

// getExperimentURLsHandler godoc
//
//	@Summary	get project urls
//	@Tags		project
//	@Accept		json
//	@Produce	json
//	@Param		project_id	query		int	true	"project id"
//	@Success	200			{object}	responses.GetProjectsURLSResponse
//	@Failure	400			{object}	responses.ErrorResponse				"Bad Request"
//	@Failure	401			{object}	responses.ErrorResponse				"Unauthorized"
//	@Failure	403			{object}	responses.ErrorResponse				"Forbidden"
//	@Failure	404			{object}	responses.CreateAppBannerResponse	"Not Found"
//	@Failure	500			{object}	responses.ErrorResponse				"Internal server error"
//	@Router		/api/v2/project/urls [get]
func getProjectURLsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetProjectLinksRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.MetaAttribute, acl.Read, r.ProjectID, u); err != nil {
		return nil, err
	}

	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user from database", err)
		userID = 0
	}

	urls, err := svc.GetProjectURLs(ctx, r.ProjectID, userID)
	if err != nil {
		l.Error("failed to get project URLs", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	return responses.GetProjectsURLSResponse{
		URLs: urls,
	}, nil
}

// addPinnedProjectHandler godoc
//
//	@Summary	addPinnedProject
//	@Tags		project
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.AddPinnedRequest	true	"request body"
//	@Success	200		{object}	responses.AddPinnedProjectResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/project/pinned [post]
func addPinnedProjectHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.AddPinnedRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {

	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user by name", err)
		return nil, shared.ConvertServiceError(err, shared.EntityUser)
	}

	pinnedProject, err := svc.AddPinnedProject(ctx, r.ProjectID, userID)
	if err != nil {
		l.Error("failed to add pinned project", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	return &responses.AddPinnedProjectResponse{
		ID:          pinnedProject.ID,
		ProjectID:   pinnedProject.ProjectID,
		ProjectName: pinnedProject.ProjectName,
	}, nil
}

// listPinnedProjectsHandler godoc
//
//	@Summary	list user's pinned projects
//	@Tags		project
//	@Produce	json
//	@Success	200	{object}	responses.ListPinnedProjectsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/projects/pinned [get]
func listPinnedProjectsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListPinnedProjectsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {

	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user by name", err)
		return nil, &responses.ErrorResponse{
			ExternalMessage: "failed to get user by name",
			InternalError:   err,
			HTTPStatusCode:  http.StatusNotFound,
		}
	}

	pinnedProjects, err := svc.ListPinnedProjects(ctx, userID)
	if err != nil {
		l.Error("failed to select pinned project list", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	var res responses.ListPinnedProjectsResponse
	for _, project := range pinnedProjects {
		res.PinnedProjects = append(res.PinnedProjects, dto.PinnedProject{
			ID:          project.ID,
			ProjectID:   project.ProjectID,
			ProjectName: project.ProjectName,
		})
	}

	return &res, nil
}

// deletePinnedProjectHandler godoc
//
//	@Summary	delete pin on project
//	@Tags		project
//	@Accept		json
//	@Param		request	body	requests.DeletePinnedProjectRequest	true	"request body"
//	@Success	200
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/project/pinned [delete]
func deletePinnedProjectHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeletePinnedProjectRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	userID, err := svc.GetUserIDByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user by name", err)
		return nil, &responses.ErrorResponse{
			ExternalMessage: "failed to get user by name",
			InternalError:   err,
			HTTPStatusCode:  http.StatusNotFound,
		}
	}

	err = svc.DeletePinnedProject(ctx, r.ProjectID, userID)
	if err != nil {
		l.Error("failed to delete pinned project", err)
		return nil, shared.ConvertServiceError(err, shared.EntityProject)
	}

	return nil, nil
}
