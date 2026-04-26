package private

import (
	"net/http"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/setters"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/validation"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
)

var AuthDefinitions = []shared.AuthDefinition{
	// Auth
	{
		Path:    "/auth/login",
		Method:  http.MethodPost,
		Handler: shared.CreateAuthHandler(Login, setters.SetLoginRequestParams, validation.DefaultValidate[requests.LoginRequest]),
	},
	{
		Path:    "/auth/register",
		Method:  http.MethodPost,
		Handler: shared.CreateAuthHandler(Register, setters.EmptySetParam[requests.RegisterRequest], validation.DefaultValidate[requests.RegisterRequest]),
	},
	{
		Path:    "/auth/authorize",
		Method:  http.MethodGet,
		Handler: shared.CreateAuthHandler(AuthorizeUser, setters.SetAuthRequestParams, validation.DefaultValidate[requests.AuthUserRequest], "redirect_url"),
	},
	{
		Path:    "/auth/logout",
		Method:  http.MethodGet,
		Handler: shared.CreateAuthHandler(Logout, setters.EmptySetParam[requests.LogoutRequest], validation.DefaultValidate[requests.LogoutRequest]),
	},
	{
		Path:    "/auth/token",
		Method:  http.MethodGet,
		Handler: shared.CreateAuthHandler(UserToken, setters.SetTokenRequestParams, validation.DefaultValidate[requests.OAuthCodeRequest], "code", "redirect_uri"),
	},
	{
		Path:    "/auth/who_am_i",
		Method:  http.MethodGet,
		Handler: shared.CreateAuthHandler(UserInfoV2Handler, setters.EmptySetParam[requests.UserInfoRequest], validation.DefaultValidate[requests.UserInfoRequest]),
	},
	{
		Path:    "/auth/refresh",
		Method:  http.MethodGet,
		Handler: shared.CreateAuthHandler(RefreshJWT, setters.SetRefreshTokenRequestParams, validation.DefaultValidate[requests.RefreshTokenRequest]),
	},
}

var Definitions = []shared.Definition{
	// Dead man
	{
		Path:        "/api/v1/ping",
		Method:      http.MethodGet,
		Handler:     shared.CreateHandler(PingHandler, setters.EmptySetParam[PingRequest], validation.DefaultValidate[PingRequest]),
		DisableAuth: true,
	},
	{
		Path:        "/api/v1/version",
		Method:      http.MethodGet,
		Handler:     shared.CreateHandler(VersionHandler, setters.EmptySetParam[struct{}], validation.DefaultValidate[struct{}]),
		DisableAuth: true,
	},
	// Rule
	{
		Path:    "/api/v1/role",
		Handler: shared.CreateHandler(createRoleHandler, setters.EmptySetParam[requests.CreateRoleRequest], validation.DefaultValidate[requests.CreateRoleRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/rules",
		Handler: shared.CreateHandler(listRulesHandler, setters.SetListRuleRequestParams, validation.DefaultValidate[requests.ListRulesRequest], "role_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/role",
		Handler: shared.CreateHandler(updateRoleHandler, setters.EmptySetParam[requests.UpdateRoleRequest], validation.DefaultValidate[requests.UpdateRoleRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/rule",
		Handler: shared.CreateHandler(createRuleHandler, setters.EmptySetParam[requests.CreateRuleRequest], validation.DefaultValidate[requests.CreateRuleRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/roles",
		Handler: shared.CreateHandler(listRolesHandler, setters.EmptySetParam[requests.ListRolesRequest], validation.DefaultValidate[requests.ListRolesRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/user_matches",
		Handler: shared.CreateHandler(listUserMatchesHandler, setters.SetListUserMatchesRequestParams, validation.DefaultValidate[requests.ListUserMatchesRequest], "user_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/user_group_matches",
		Handler: shared.CreateHandler(listUserGroupMatchesHandler, setters.SetListUserGroupMatchesRequestParams, validation.DefaultValidate[requests.ListUserGroupMatchesRequest], "user_group_id"),
		Method:  http.MethodGet,
	},
	// User
	{
		Path:    "/api/v1/usergroup",
		Handler: shared.CreateHandler(createUserGroupHandler, setters.EmptySetParam[requests.CreateUserGroupRequest], validation.DefaultValidate[requests.CreateUserGroupRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/user/roles",
		Handler: shared.CreateHandler(listUserRolesHandler, setters.SetListUserRolesRequestParams, validation.DefaultValidate[requests.ListUserRolesRequest], "user_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/who_am_i",
		Handler: shared.CreateHandler(userInfoHandler, setters.EmptySetParam[requests.GetUserInfoRequest], validation.DefaultValidate[requests.GetUserInfoRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/users",
		Handler: shared.CreateHandler(listUsersHandler, setters.SetListUserRequestParams, validation.DefaultValidate[requests.ListUsersRequest], "user_group_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/usergroup",
		Handler: shared.CreateHandler(updateUserGroupHandler, setters.EmptySetParam[requests.UpdateUserGroupRequest], validation.DefaultValidate[requests.UpdateUserGroupRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/user",
		Handler: shared.CreateHandler(createUserHandler, setters.EmptySetParam[requests.CreateUserRequest], validation.DefaultValidate[requests.CreateUserRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/user",
		Handler: shared.CreateHandler(userByNameHandler, setters.SetUserByNameRequestParams, validation.DefaultValidate[requests.UserByNameRequest], "name"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/usergroups",
		Handler: shared.CreateHandler(listUserGroupsHandler, setters.EmptySetParam[requests.ListUserGroupsRequest], validation.DefaultValidate[requests.ListUserGroupsRequest]),
		Method:  http.MethodGet,
	},
	// ACL actions
	{
		Path:    "/api/v1/grant",
		Handler: shared.CreateHandler(GrantHandler, setters.EmptySetParam[requests.GrantRequest], validation.ValidateGrant),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/disclaim",
		Handler: shared.CreateHandler(DisclaimHandler, setters.EmptySetParam[requests.DisclaimRequest], validation.ValidateDisclaim),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/role/rule",
		Handler: shared.CreateHandler(AddRuleToRoleHandler, setters.EmptySetParam[requests.AddRuleToRoleRequest], validation.DefaultValidate[requests.AddRuleToRoleRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/role/rule",
		Handler: shared.CreateHandler(RemoveRuleFromRoleHandler, setters.EmptySetParam[requests.RemoveRuleFromRoleRequest], validation.DefaultValidate[requests.RemoveRuleFromRoleRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v1/usergroup/user",
		Handler: shared.CreateHandler(AddUserToGroupHandler, setters.EmptySetParam[requests.AddUserToGroupRequest], validation.DefaultValidate[requests.AddUserToGroupRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/usergroup/user",
		Handler: shared.CreateHandler(RemoveUserFromGroupHandler, setters.EmptySetParam[requests.RemoveUserFromGroupRequest], validation.DefaultValidate[requests.RemoveUserFromGroupRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v2/acl/check",
		Handler: shared.CreateHandler(CheckACLHandler, setters.SetCheckACLRequestParams, validation.DefaultValidate[requests.CheckACLRequest], "object_type", "object_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/acl/users",
		Handler: shared.CreateHandler(GetUsersPermissionsHandler, setters.SetUsersACLRequestParams, validation.DefaultValidate[requests.UsersACLRequest], "object_type", "object_id", "limit", "offset", "search"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/me/capabilities",
		Handler: shared.CreateHandler(GetMyCapabilitiesHandler, setters.EmptySetParam[struct{}], validation.DefaultValidate[struct{}]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/permission-requests",
		Handler: shared.CreateHandler(CreatePermissionRequestHandler, setters.EmptySetParam[requests.CreatePermissionRequest], validation.DefaultValidate[requests.CreatePermissionRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/permission-requests/mine",
		Handler: shared.CreateHandler(ListMyPermissionRequestsHandler, setters.EmptySetParam[struct{}], validation.DefaultValidate[struct{}]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/permission-requests",
		Handler: shared.CreateHandler(ListPermissionRequestsAdminHandler, setters.SetListPermissionRequestsAdminParams, validation.DefaultValidate[requests.ListPermissionRequestsAdminRequest], "status", "limit", "offset"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/permission-requests/approve",
		Handler: shared.CreateHandler(ApprovePermissionRequestHandler, setters.EmptySetParam[requests.ReviewPermissionRequest], validation.DefaultValidate[requests.ReviewPermissionRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/permission-requests/reject",
		Handler: shared.CreateHandler(RejectPermissionRequestHandler, setters.EmptySetParam[requests.ReviewPermissionRequest], validation.DefaultValidate[requests.ReviewPermissionRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/permissions",
		Handler: shared.CreateHandler(CheckPermissionsHandler, setters.SetCheckPermissionsParams, validation.DefaultValidate[requests.CheckPermissionsRequest], "user_id", "object_type", "object_id"),
		Method:  http.MethodGet,
	},
	// Namespace
	{
		Path:    "/api/v1/namespace",
		Handler: shared.CreateHandler(createNamespaceHandler, setters.EmptySetParam[requests.CreateNamespaceRequest], validation.DefaultValidate[requests.CreateNamespaceRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/namespaces",
		Handler: shared.CreateHandler(listNamespacesHandler, setters.EmptySetParam[struct{}], validation.DefaultValidate[struct{}]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/namespaces",
		Handler: shared.CreateHandler(listNamespacesV2Handler, setters.EmptySetParam[struct{}], validation.DefaultValidate[struct{}]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/namespace",
		Handler: shared.CreateHandler(deleteNamespaceHandler, setters.EmptySetParam[requests.DeleteNamespaceRequest], validation.DefaultValidate[requests.DeleteNamespaceRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v1/namespace",
		Handler: shared.CreateHandler(updateNamespaceHandler, setters.EmptySetParam[requests.UpdateNamespaceRequest], validation.DefaultValidate[requests.UpdateNamespaceRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/namespace/configs",
		Handler: shared.CreateHandler(listNamespaceConfigsHandler, setters.SetListNamespaceConfigsRequestParams, validation.DefaultValidate[requests.ListNamespaceConfigsRequest], "namespace_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/namespace/config",
		Handler: shared.CreateHandler(getNamespaceConfigHandler, setters.SetGetNamespaceConfigRequestParams, validation.DefaultValidate[requests.GetNamespaceConfigRequest], "config_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/namespace",
		Handler: shared.CreateHandler(getNamespaceHandler, setters.SetGetNamespaceRequestParams, validation.DefaultValidate[requests.GetNamespaceRequest], "namespace_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/namespace/logs",
		Handler: shared.CreateHandler(listNamespaceUpdateLogsHandler, setters.SetListNamespaceUpdateLogsRequestParams, validation.DefaultValidate[requests.ListNamespaceUpdateLogsRequest], "namespace_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/namespace/log",
		Handler: shared.CreateHandler(getNamespaceLogHandler, setters.SetGetNamespaceLogRequestParams, validation.DefaultValidate[requests.GetNamespaceLogRequest], "log_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/namespace/log",
		Handler: shared.CreateHandler(updateNamespaceLogCommentHandler, setters.EmptySetParam[requests.UpdateNamespaceLogCommentRequest], validation.DefaultValidate[requests.UpdateNamespaceLogCommentRequest]),
		Method:  http.MethodPut,
	},
	// Project
	{
		Path:    "/api/v1/project",
		Handler: shared.CreateHandler(createProjectHandler, setters.EmptySetParam[requests.CreateProjectRequest], validation.DefaultValidate[requests.CreateProjectRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/project/pinned",
		Handler: shared.CreateHandler(addPinnedProjectHandler, setters.EmptySetParam[requests.AddPinnedRequest], validation.DefaultValidate[requests.AddPinnedRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/project/config/validate",
		Handler: shared.CreateHandler(validateProjectConfigHandler, setters.EmptySetParam[requests.ProjectValidateRequest], validation.DefaultValidate[requests.ProjectValidateRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/projects",
		Handler: shared.CreateHandler(listProjectsHandler, setters.SetListProjectRequestParams, validation.DefaultValidate[requests.ListProjectsRequest], "namespace_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/projects/pinned",
		Handler: shared.CreateHandler(listPinnedProjectsHandler, setters.EmptySetParam[requests.ListPinnedProjectsRequest], validation.DefaultValidate[requests.ListPinnedProjectsRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/projects",
		Handler: shared.CreateHandler(listProjectsPostHandlerV2, setters.EmptySetParam[requests.ListProjectsRequestV2], validation.DefaultValidate[requests.ListProjectsRequestV2]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/project",
		Handler: shared.CreateHandler(getProjectV2Handler, setters.SetGetProjectRequestParams, validation.DefaultValidate[requests.GetProjectRequest], "project_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/project",
		Handler: shared.CreateHandler(deleteProjectHandler, setters.EmptySetParam[requests.DeleteProjectRequest], validation.DefaultValidate[requests.DeleteProjectRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v2/project/pinned",
		Handler: shared.CreateHandler(deletePinnedProjectHandler, setters.EmptySetParam[requests.DeletePinnedProjectRequest], validation.DefaultValidate[requests.DeletePinnedProjectRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v1/project",
		Handler: shared.CreateHandler(updateProjectHandler, setters.EmptySetParam[requests.UpdateProjectRequest], validation.ValidateUpdateProjectRequest),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/project/configs",
		Handler: shared.CreateHandler(listProjectConfigsHandler, setters.SetListProjectConfigsRequestParams, validation.DefaultValidate[requests.ListProjectConfigsRequest], "project_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/project/config",
		Handler: shared.CreateHandler(getProjectConfigHandler, setters.SetGetProjectConfigRequestParams, validation.DefaultValidate[requests.GetProjectConfigRequest], "config_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/project/logs",
		Handler: shared.CreateHandler(listProjectUpdateLogsHandler, setters.SetListProjectUpdateLogsRequestParams, validation.ValidateListProjectUpdateLogsRequest, "project_id", "namespace_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/project/log",
		Handler: shared.CreateHandler(getProjectLogHandler, setters.SetGetProjectLogRequestParams, validation.DefaultValidate[requests.GetProjectLogRequest], "log_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/project/log",
		Handler: shared.CreateHandler(updateProjectLogCommentHandler, setters.EmptySetParam[requests.UpdateProjectLogCommentRequest], validation.DefaultValidate[requests.UpdateProjectLogCommentRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v2/project/urls",
		Handler: shared.CreateHandler(getProjectURLsHandler, setters.SetGetProjectURLsRequestParams, validation.DefaultValidate[requests.GetProjectLinksRequest], "project_id"),
		Method:  http.MethodGet,
	},
	// CompleteExperiment
	{
		Path:    "/api/v1/experiment",
		Handler: shared.CreateHandler(createCompleteExperimentHandler, setters.EmptySetParam[requests.CreateCompleteExperimentRequest], validation.DefaultValidate[requests.CreateCompleteExperimentRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiment/copy",
		Handler: shared.CreateHandler(copyCompleteExperimentHandler, setters.EmptySetParam[requests.CopyCompleteExperimentRequest], validation.DefaultValidate[requests.CopyCompleteExperimentRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiments",
		Handler: shared.CreateHandler(listCompleteExperimentsHandler, setters.SetListCompleteExperimentsRequestParams, validation.DefaultValidate[requests.ListCompleteExperimentsRequest], "project_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment",
		Handler: shared.CreateHandler(getCompleteExperimentHandler, setters.SetGetCompleteExperimentRequestParams, validation.DefaultValidate[requests.GetCompleteExperimentRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment",
		Handler: shared.CreateHandler(deleteCompleteExperimentHandler, setters.EmptySetParam[requests.DeleteCompleteExperimentRequest], validation.DefaultValidate[requests.DeleteCompleteExperimentRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v1/experiment",
		Handler: shared.CreateHandler(updateCompleteExperimentHandler, setters.EmptySetParam[requests.UpdateCompleteExperimentRequest], validation.ValidateUpdateExperimentRequest),
		Method:  http.MethodPut,
	},
	// Experiment actions
	{
		Path:    "/api/v1/experiment/start",
		Handler: shared.CreateHandler(ExperimentStartHandler, setters.EmptySetParam[requests.ExperimentStartRequest], validation.DefaultValidate[requests.ExperimentStartRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/updates",
		Handler: shared.CreateHandler(ExperimentCheckUpdateConfigHandler, setters.SetExperimentCheckConfigRequestParams, validation.DefaultValidate[requests.ExperimentCheckUpdateRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/stop",
		Handler: shared.CreateHandler(ExperimentStopHandler, setters.EmptySetParam[requests.ExperimentStopRequest], validation.DefaultValidate[requests.ExperimentStopRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/status",
		Handler: shared.CreateHandler(ExperimentStatusHandler, setters.SetExperimentStatusRequestParams, validation.DefaultValidate[requests.ExperimentStatusRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/config/apply",
		Handler: shared.CreateHandler(ApplyExperimentConfigV2Handler, setters.EmptySetParam[requests.ApplyExperimentConfigRequest], validation.DefaultValidate[requests.ApplyExperimentConfigRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v2/experiment/config/apply",
		Handler: shared.CreateHandler(ApplyExperimentConfigV2Handler, setters.EmptySetParam[requests.ApplyExperimentConfigRequest], validation.DefaultValidate[requests.ApplyExperimentConfigRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v3/experiment/config/apply",
		Handler: shared.CreateHandler(ApplyExperimentConfigV3Handler, setters.EmptySetParam[requests.ApplyExperimentConfigRequest], validation.DefaultValidate[requests.ApplyExperimentConfigRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/config/apply/save",
		Handler: shared.CreateHandler(saveAppliedVersionForExperiments, setters.EmptySetParam[requests.SaveAppliedVersionForExperimentsRequest], validation.DefaultValidate[requests.SaveAppliedVersionForExperimentsRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/experiment/config/validate",
		Handler: shared.CreateHandler(validateExperimentConfigHandler, setters.EmptySetParam[requests.CompleteExperimentValidateRequest], validation.DefaultValidate[requests.CompleteExperimentValidateRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiment/validations/fast",
		Handler: shared.CreateHandler(validateExperimentFastHandler, setters.EmptySetParam[requests.ExperimentValidateFastRequest], validation.DefaultValidate[requests.ExperimentValidateFastRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiment/validations/run",
		Handler: shared.CreateHandler(validateExperimentRunHandler, setters.EmptySetParam[requests.ExperimentValidateRunRequest], validation.DefaultValidate[requests.ExperimentValidateRunRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiment/dataset",
		Handler: shared.CreateHandler(addDatasetToExperimentHandler, setters.EmptySetParam[requests.AddDatasetToExperimentRequest], validation.DefaultValidate[requests.AddDatasetToExperimentRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/experiment/search/datasets",
		Handler: shared.CreateHandler(getExperimentAvailableDatasetsToLinkHandler, setters.EmptySetParam[requests.GetExperimentAvailableDatasetsToLinkRequest], validation.DefaultValidate[requests.GetExperimentAvailableDatasetsToLinkRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiment/dataset",
		Handler: shared.CreateHandler(removeDatasetFromExperimentHandler, setters.EmptySetParam[requests.RemoveDatasetFromExperimentRequest], validation.DefaultValidate[requests.RemoveDatasetFromExperimentRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v1/experiment/datasets",
		Handler: shared.CreateHandler(getExperimentDatasetsHandler, setters.SetGetExperimentDatasetsRequestParams, validation.DefaultValidate[requests.GetExperimentDatasetsRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/dataset",
		Handler: shared.CreateHandler(updateExperimentDatasetHandler, setters.EmptySetParam[requests.UpdateExperimentDatasetRequest], validation.DefaultValidate[requests.UpdateExperimentDatasetRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/supervisor",
		Handler: shared.CreateHandler(getSupervisorConfigHandler, setters.SetGetSupervisorConfigRequestParams, validation.DefaultValidate[requests.GetSupervisorConfigRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/urls",
		Handler: shared.CreateHandler(getExperimentURLsHandler, setters.SetGetExperimentURLsRequestParams, validation.DefaultValidate[requests.GetExperimentURLsRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/grafana_url",
		Handler: shared.CreateHandler(getExperimentGrafanaURLHandler, setters.SetGetExperimentGrafanaURLRequestParams, validation.DefaultValidate[requests.GetExperimentGrafanaURLRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/logs",
		Handler: shared.CreateHandler(listExperimentUpdateLogsHandler, setters.SetListExperimentUpdateLogsRequestParams, validation.ValidateListExperimentUpdateLogsRequest, "experiment_id", "project_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/versions",
		Handler: shared.CreateHandler(listExperimentConfigVersionsHandler, setters.SetListExperimentVersionsRequestParams, validation.ValidateListExperimentVersionsRequest, "experiment_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/experiment/version",
		Handler: shared.CreateHandler(updateExperimentVersionCommentHandler, setters.EmptySetParam[requests.UpdateExperimentVersionCommentRequest], validation.DefaultValidate[requests.UpdateExperimentVersionCommentRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/version",
		Handler: shared.CreateHandler(getExperimentConfigByVersionHandler, setters.SetGetExperimentConfigVersionRequestParams, validation.ValidateGetExperimentVersionsRequest, "experiment_id", "version_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/version/current",
		Handler: shared.CreateHandler(getExperimentCurrentConfigVersionHandler, setters.SetGetExperimentCurrentVersionRequestParams, validation.ValidateGetExperimentCurrentVersionsRequest, "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/version/current",
		Handler: shared.CreateHandler(updateExperimentConfigVersionHandler, setters.EmptySetParam[requests.UpdateExperimentConfigVersionRequest], validation.DefaultValidate[requests.UpdateExperimentConfigVersionRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/log",
		Handler: shared.CreateHandler(getExperimentLogHandler, setters.SetGetExperimentLogRequestParams, validation.DefaultValidate[requests.GetExperimentLogRequest], "log_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/log",
		Handler: shared.CreateHandler(updateExperimentLogCommentHandler, setters.EmptySetParam[requests.UpdateExperimentLogCommentRequest], validation.DefaultValidate[requests.UpdateExperimentLogCommentRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/queue/clean",
		Handler: shared.CreateHandler(cleanExperimentQueueHandler, setters.EmptySetParam[requests.CleanExperimentQueueRequest], validation.DefaultValidate[requests.CleanExperimentQueueRequest]),
		Method:  http.MethodPut,
	},
	// Jobs
	{
		Path:    "/api/v1/jobs/search",
		Handler: shared.CreateHandler(listJobsHandler, setters.EmptySetParam[requests.ListJobsRequest], validation.DefaultValidate[requests.ListJobsRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/job",
		Handler: shared.CreateHandler(getJobHandler, setters.SetGetJobRequestParams, validation.DefaultValidate[requests.GetJobRequest], "job_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/job/events",
		Handler: shared.CreateHandler(getJobEventsHandler, setters.SetGetJobEventsRequestParams, validation.DefaultValidate[requests.GetJobEventsRequest], "job_id", "event_type", "limit", "offset"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/events",
		Handler: shared.CreateHandler(listAllEventsHandler, setters.SetListAllEventsRequestParams, validation.DefaultValidate[requests.ListAllEventsRequest], "job_id", "entity_type", "entity_id", "event_type", "job_type", "limit", "offset", "sort", "order"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/job/cancel",
		Handler: shared.CreateHandler(cancelJobHandler, setters.SetCancelJobRequestParams, validation.DefaultValidate[requests.CancelJobRequest], "job_id"),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/job/retry",
		Handler: shared.CreateHandler(retryJobHandler, setters.SetRetryJobRequestParams, validation.DefaultValidate[requests.RetryJobRequest], "job_id"),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/job/tasks",
		Handler: shared.CreateHandler(getJobTasksHandler, setters.SetGetJobTasksRequestParams, validation.DefaultValidate[requests.GetJobTasksRequest], "job_id", "status"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/variables",
		Handler: shared.CreateHandler(getExperimentVariablesHandler, setters.SetGetExperimentVariablesRequestParams, validation.DefaultValidate[requests.GetExperimentVariablesRequest], "experiment_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/variable",
		Handler: shared.CreateHandler(getExperimentVariableHandler, setters.SetGetExperimentVariableRequestParams, validation.DefaultValidate[requests.GetExperimentVariableRequest], "variable_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/variable",
		Handler: shared.CreateHandler(updateExperimentVariableHandler, setters.EmptySetParam[requests.UpdateExperimentVariableRequest], validation.DefaultValidate[requests.UpdateExperimentVariableRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/experiment/variable",
		Handler: shared.CreateHandler(createExperimentVariableHandler, setters.EmptySetParam[requests.CreateExperimentVariableRequest], validation.DefaultValidate[requests.CreateExperimentVariableRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/experiment/variables/types",
		Handler: shared.CreateHandler(getAvailableExperimentVariableTypesHandler, setters.EmptySetParam[requests.GetAvailableExperimentVariableTypesRequest], validation.DefaultValidate[requests.GetAvailableExperimentVariableTypesRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/experiment/variable",
		Handler: shared.CreateHandler(deleteExperimentVariableHandler, setters.EmptySetParam[requests.DeleteExperimentVariableRequest], validation.DefaultValidate[requests.DeleteExperimentVariableRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v2/experiment/variable/versions",
		Handler: shared.CreateHandler(listExperimentVariableVersionsHandler, setters.SetListExperimentVariableVersionsRequestParams, validation.ValidateListExperimentVariableVersionsRequest, "variable_id", "experiment_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/experiment/variable/version",
		Handler: shared.CreateHandler(updateExperimentVariableVersionCommentHandler, setters.EmptySetParam[requests.UpdateExperimentVariableVersionCommentRequest], validation.DefaultValidate[requests.UpdateExperimentVariableVersionCommentRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v2/experiment/variable/version",
		Handler: shared.CreateHandler(getExperimentVariableVersionHandler, setters.SetGetExperimentVariableVersionRequestParams, validation.ValidateGetExperimentVariableVersionsRequest, "version_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/experiment/variable/version/current",
		Handler: shared.CreateHandler(getExperimentVariableCurrentVersionHandler, setters.SetGetExperimentVariableCurrentVersionRequestParams, validation.ValidateGetExperimentVariableCurrentVersionsRequest, "variable_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/experiment/variable/version/current",
		Handler: shared.CreateHandler(updateExperimentVariableVersionHandler, setters.EmptySetParam[requests.UpdateExperimentVariableVersionRequest], validation.DefaultValidate[requests.UpdateExperimentVariableVersionRequest]),
		Method:  http.MethodPut,
	},
	// Dataset
	{
		Path:    "/api/v2/dataset/config/validate",
		Handler: shared.CreateHandler(validateDatasetConfigHandler, setters.EmptySetParam[requests.DatasetValidateRequest], validation.DefaultValidate[requests.DatasetValidateRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/dataset",
		Handler: shared.CreateHandler(createDatasetHandlerV2, setters.EmptySetParam[requests.CreateDatasetRequestV2], validation.DefaultValidate[requests.CreateDatasetRequestV2]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/dataset/copy",
		Handler: shared.CreateHandler(copyDatasetHandlerV2, setters.EmptySetParam[requests.CopyDatasetRequestV2], validation.DefaultValidate[requests.CopyDatasetRequestV2]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/datasets/search",
		Handler: shared.CreateHandler(searchDatasetsPostHandler, setters.EmptySetParam[requests.SearchDatasetsRequest], validation.DefaultValidate[requests.SearchDatasetsRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/dataset/links",
		Handler: shared.CreateHandler(getDatasetLinkedExperimentsHandler, setters.SetGetDatasetLinkedExperimentsRequestParams, validation.DefaultValidate[requests.GetDatasetLinkedExperimentsRequest], "dataset_id", "offset", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/datasets",
		Handler: shared.CreateHandler(listDatasetsByProjectIdHandler, setters.SetListDatasetsByProjectRequestParams, validation.DefaultValidate[requests.ListDatasetsByProjectRequest], "project_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/dataset",
		Handler: shared.CreateHandler(getDatasetV2Handler, setters.SetGetDatasetRequestParams, validation.DefaultValidate[requests.GetDatasetRequest], "dataset_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/dataset",
		Handler: shared.CreateHandler(deleteDatasetHandler, setters.EmptySetParam[requests.DeleteDatasetRequest], validation.DefaultValidate[requests.DeleteDatasetRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v1/experiment/dataset/apply",
		Handler: shared.CreateHandler(applyExperimentDatasetHandler, setters.EmptySetParam[requests.ApplyExperimentDatasetRequest], validation.DefaultValidate[requests.ApplyExperimentDatasetRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/dataset/apply",
		Handler: shared.CreateHandler(applyDatasetHandler, setters.EmptySetParam[requests.ApplyDatasetRequest], validation.DefaultValidate[requests.ApplyDatasetRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v2/dataset",
		Handler: shared.CreateHandler(updateDatasetHandlerV2, setters.EmptySetParam[requests.UpdateDatasetRequestV2], validation.ValidateUpdateDatasetRequest),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/dataset/logs",
		Handler: shared.CreateHandler(listDatasetUpdateLogsByNamespaceHandler, setters.SetListDatasetUpdateLogsByNamespaceRequestParams, validation.ValidateListDatasetUpdateLogsByNamespaceRequest, "dataset_id", "namespace_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/dataset/logs",
		Handler: shared.CreateHandler(listDatasetUpdateLogsByProjectHandler, setters.SetListDatasetUpdateLogsByProjectRequestParams, validation.ValidateListDatasetUpdateLogsByProjectRequest, "dataset_id", "project_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/dataset/log",
		Handler: shared.CreateHandler(getDatasetLogHandler, setters.SetGetDatasetLogRequestParams, validation.DefaultValidate[requests.GetDatasetLogRequest], "log_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/dataset/log",
		Handler: shared.CreateHandler(updateDatasetLogCommentHandler, setters.EmptySetParam[requests.UpdateDatasetLogCommentRequest], validation.DefaultValidate[requests.UpdateDatasetLogCommentRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v2/datasets/clusters",
		Handler: shared.CreateHandler(getAvailableClustersHandler, setters.EmptySetParam[requests.GetAvailableDatasetClustersRequest], validation.DefaultValidate[requests.GetAvailableDatasetClustersRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/dataset/yt",
		Handler: shared.CreateHandler(getDatasetYtURLHandler, setters.SetGetDatasetYTUrlRequestParams, validation.DefaultValidate[requests.GetDatasetYTLinkRequest], "dataset_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/dataset/versions",
		Handler: shared.CreateHandler(listDatasetVersionsHandler, setters.SetListDatasetVersionsRequestParams, validation.ValidateListDatasetVersionsRequest, "dataset_id", "from", "limit"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/dataset/version",
		Handler: shared.CreateHandler(updateDatasetVersionCommentHandler, setters.EmptySetParam[requests.UpdateDatasetVersionCommentRequest], validation.DefaultValidate[requests.UpdateDatasetVersionCommentRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v2/dataset/version",
		Handler: shared.CreateHandler(getDatasetVersionHandler, setters.SetGetDatasetVersionRequestParams, validation.ValidateGetDatasetVersionsRequest, "version_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/dataset/version/current",
		Handler: shared.CreateHandler(getDatasetCurrentVersionHandler, setters.SetGetDatasetCurrentVersionRequestParams, validation.ValidateGetDatasetCurrentVersionsRequest, "dataset_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/dataset/version/current",
		Handler: shared.CreateHandler(updateDatasetVersionHandler, setters.EmptySetParam[requests.UpdateDatasetVersionRequest], validation.DefaultValidate[requests.UpdateDatasetVersionRequest]),
		Method:  http.MethodPut,
	},
	// Graph
	{
		Path:    "/api/v1/graph",
		Handler: shared.CreateHandler(getProjectGraphHandler, setGetProjectGraphRequestParams, validation.DefaultValidate[getProjectGraphRequest], "project_id"),
		Method:  http.MethodGet,
	},
	// App
	{
		Path:    "/api/v1/app/banner",
		Handler: shared.CreateHandler(deleteAppBannerHandler, setters.EmptySetParam[requests.DeleteAppBannerRequest], validation.DefaultValidate[requests.DeleteAppBannerRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v1/app/banner",
		Handler: shared.CreateHandler(updateAppBannerHandler, setters.EmptySetParam[requests.UpdateAppBannerRequest], validation.DefaultValidate[requests.UpdateAppBannerRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/app/banner",
		Handler: shared.CreateHandler(getAppBannerHandler, setters.SetGetAppBannerRequestParams, validation.DefaultValidate[requests.GetAppBannerRequest], "banner_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/app/banner",
		Handler: shared.CreateHandler(createAppBannerHandler, setters.EmptySetParam[requests.CreateAppBannerRequest], validation.DefaultValidate[requests.CreateAppBannerRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/app/banners",
		Handler: shared.CreateHandler(listAppBannersHandler, setters.EmptySetParam[requests.GetListOfAppBannersRequest], validation.DefaultValidate[requests.GetListOfAppBannersRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/app/banner/types",
		Handler: shared.CreateHandler(getListAppBannerTypesHandler, setters.EmptySetParam[requests.GetAppBannerTypesRequest], validation.DefaultValidate[requests.GetAppBannerTypesRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/app/banners/current",
		Handler: shared.CreateHandler(getCurrentAppBannerHandler, setters.EmptySetParam[requests.GetCurrentAppBannerRequest], validation.DefaultValidate[requests.GetCurrentAppBannerRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/app/is-admin",
		Handler: shared.CreateHandler(getAppIsAdminHandler, setters.EmptySetParam[requests.GetAppIsAdminRequest], validation.DefaultValidate[requests.GetAppIsAdminRequest]),
		Method:  http.MethodGet,
	},
	// App Updates
	{
		Path:    "/api/v1/app/update",
		Handler: shared.CreateHandler(deleteAppUpdateHandler, setters.EmptySetParam[requests.DeleteAppUpdateRequest], validation.DefaultValidate[requests.DeleteAppUpdateRequest]),
		Method:  http.MethodDelete,
	},
	{
		Path:    "/api/v1/app/update",
		Handler: shared.CreateHandler(updateAppUpdateHandler, setters.EmptySetParam[requests.UpdateAppUpdateRequest], validation.DefaultValidate[requests.UpdateAppUpdateRequest]),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/app/update",
		Handler: shared.CreateHandler(getAppUpdateHandler, setters.SetGetAppUpdateRequestParams, validation.DefaultValidate[requests.GetAppUpdateRequest], "update_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/app/update",
		Handler: shared.CreateHandler(createAppUpdateHandler, setters.EmptySetParam[requests.CreateAppUpdateRequest], validation.DefaultValidate[requests.CreateAppUpdateRequest]),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/app/updates",
		Handler: shared.CreateHandler(listAppUpdatesHandler, setters.SetListAppUpdatesRequestParams, validation.DefaultValidate[requests.ListAppUpdatesRequest], "limit", "offset"),
		Method:  http.MethodGet,
	},
	// App Upcoming
	{
		Path:    "/api/v1/app/upcoming",
		Handler: shared.CreateHandler(getAppUpcomingHandler, setters.EmptySetParam[requests.GetAppUpcomingRequest], validation.DefaultValidate[requests.GetAppUpcomingRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/app/upcoming",
		Handler: shared.CreateHandler(updateAppUpcomingHandler, setters.EmptySetParam[requests.UpdateAppUpcomingRequest], validation.DefaultValidate[requests.UpdateAppUpcomingRequest]),
		Method:  http.MethodPut,
	},
	// App About
	{
		Path:    "/api/v1/app/about",
		Handler: shared.CreateHandler(getAppAboutHandler, setters.EmptySetParam[requests.GetAppAboutRequest], validation.DefaultValidate[requests.GetAppAboutRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/app/about",
		Handler: shared.CreateHandler(updateAppAboutHandler, setters.EmptySetParam[requests.UpdateAppAboutRequest], validation.DefaultValidate[requests.UpdateAppAboutRequest]),
		Method:  http.MethodPut,
	},
	// Schema
	{
		Path:    "/api/v2/schema",
		Handler: shared.CreateHandler(getConfigSchemaHandler, setters.SetGetSchema, validation.DefaultValidate[requests.GetSchemaRequest], "config_type"),
		Method:  http.MethodGet,
	},
	// Forms
	{
		Path:    "/api/v2/forms/dataset",
		Handler: shared.CreateHandler(getDatasetFormHandler, setters.SetGetDatasetFormRequestParams, validation.DefaultValidate[requests.GetDatasetFormRequest], "type"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/forms/project",
		Handler: shared.CreateHandler(getProjectFormHandler, setters.EmptySetParam[requests.GetProjectFormRequest], validation.DefaultValidate[requests.GetProjectFormRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v2/forms/experiment",
		Handler: shared.CreateHandler(getExperimentFormsHandler, setters.EmptySetParam[requests.GetExperimentFormsRequest], validation.DefaultValidate[requests.GetExperimentFormsRequest]),
		Method:  http.MethodGet,
	},
	// Cube
	{
		Path:    "/api/v1/cube/system",
		Handler: shared.CreateHandler(createSystemCube, setters.EmptySetParam[requests.CreateCubeRequest], validation.ValidateCreateCubeRequest),
		Method:  http.MethodPost,
	},
	{
		Path:    "/api/v1/cube",
		Handler: shared.CreateHandler(getCubeByID, setters.SetGetCubeRequestParams, validation.DefaultValidate[requests.GetCubeRequest], "cube_id"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/cubes",
		Handler: shared.CreateHandler(listCubes, setters.EmptySetParam[requests.ListCubesRequest], validation.DefaultValidate[requests.ListCubesRequest]),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/cubes/by_ids",
		Handler: shared.CreateHandler(listCubesByIDs, setters.SetListCubesByIDsRequestParams, validation.DefaultValidate[requests.ListCubesByIDsRequest], "ids"),
		Method:  http.MethodGet,
	},
	{
		Path:    "/api/v1/cube",
		Handler: shared.CreateHandler(updateCube, setters.EmptySetParam[requests.UpdateCubeRequest], validation.ValidateUpdateCubeRequest),
		Method:  http.MethodPut,
	},
	{
		Path:    "/api/v1/cube/name",
		Handler: shared.CreateHandler(getCubeByName, setters.SetGetCubeByNameRequestParams, validation.DefaultValidate[requests.GetCubeByNameRequest], "name"),
		Method:  http.MethodGet,
	},
}
