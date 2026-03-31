package service

import (
	"context"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/params"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	aclService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/acl"
	appService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/app"
	authService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/auth"
	cubeService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/cube"
	datasetService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/dataset"
	experimentService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/experiment"
	formService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/form"
	graphService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/graph"
	updateLogService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/history/update_log"
	versionService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/history/versions"
	namespaceService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/namespace"
	projectService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/project"
	schemaService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/schema"
	userService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/user"
	validationService "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/validation"
)

type IAuthService interface {
	GetAuthorizationURL(redirectUrl string) (string, error)
	Login(username, password string) (*dto.OAuthAccessToken, error)
	GetUserInfo(token string) (*dto.UserInfo, error)
	GetUserInfoFromRequest(r *http.Request) (*user.UserInfo, error)
	ExchangeCodeForToken(code, redirectUri string) (*dto.OAuthAccessToken, error)
	RefreshAccessToken(refreshToken string) (*dto.OAuthAccessToken, error)
	CreateAuthCookies(accessToken *dto.OAuthAccessToken) ([]*http.Cookie, error)
	CreateLogoutCookies() []*http.Cookie
	IsTokenExpiredError(err error) bool
	GetErrorStatusCode(err error) int
}

type INamespaceService interface {
	GetNamespace(ctx context.Context, id int32, username string) (*dto.NamespaceInfo, error)
	CreateNamespace(ctx context.Context, name string) (int32, error)
	DeleteNamespace(ctx context.Context, id int32) error
	UpdateNamespace(ctx context.Context, id int32, name string, config string) (*dto.NamespaceInfo, error)
	ListNamespacesWithRights(ctx context.Context, username string) (*[]dto.Namespace, error)
	ListNamespacesV2(ctx context.Context) (*[]dto.NamespaceShort, error)
	ListNamespaceConfigs(ctx context.Context, namespaceID int32) (*[]dto.NamespaceConfigVersion, error)
	GetNamespaceConfig(ctx context.Context, configID int32) (*dto.NamespaceConfig, error)
}

type IExperimentService interface {
	// CRUD операции
	CreateExperiment(ctx context.Context, experimentName, description string, projectID int32) (*dto.CompleteExperiment, error)
	UpdateExperiment(ctx context.Context, experiment dto.CompleteExperiment) (*dto.CompleteExperiment, error)
	UpdateExperimentWithValidation(ctx context.Context, experimentID int32, name, description, config, comment, creator, additionalInformationReq string, disableValidation bool) (*dto.CompleteExperiment, error)
	GetExperimentsInProject(ctx context.Context, projectID int32) (*[]dto.CompleteExperiment, error)
	GetExperimentByID(ctx context.Context, experimentID int32) (*dto.CompleteExperiment, error)
	GetCompleteExperiment(ctx context.Context, experimentID, userID int32) (*dto.CompleteExperiment, string, error)
	DeleteExperiment(ctx context.Context, experimentID int32) error
	CopyExperiment(ctx context.Context, srcExperimentID, targetProjectID int32, newName, newDescription, username string) (*dto.CompleteExperiment, error)
	GetExperimentProjectID(ctx context.Context, experimentID int32) (int32, error)

	// Experiment Actions
	StartExperiment(ctx context.Context, experimentID int32, username ...string) error
	StopExperiment(ctx context.Context, experimentID int32, username ...string) error
	GetExperimentStatus(ctx context.Context, orchID string) responses.ExperimentStatusResponse
	CheckExperimentConfigUpdates(ctx context.Context, experimentID int32) (bool, string, string, error)
	ApplyExperimentConfig(ctx context.Context, experimentID int32) (string, error)
	GetOrchestratorConfig(ctx context.Context, experimentID int32) (string, error)
	FindUnknownExperimentVariables(ctx context.Context, experimentID int32, config string) ([]string, error)

	// Experiment Datasets
	AddDatasetToExperiment(ctx context.Context, experimentID, datasetID int32, alias string) (int32, *dto.Dataset, int32, string, string, error)
	RemoveDatasetFromExperiment(ctx context.Context, experimentID, linkID int32) (*dto.Dataset, error)
	RemoveDatasetFromExperimentByAlias(ctx context.Context, experimentID int32, alias string) (*dto.ExperimentDataset, error)
	UpdateExperimentDataset(ctx context.Context, experimentID, linkID int32, newAlias string) (string, *dto.Dataset, *dto.Dataset, error)
	GetExperimentDatasets(ctx context.Context, experimentID int32) ([]dto.ExperimentDataset, error)
	GetExperimentAvailableDatasets(ctx context.Context, experimentID int32, params dbcore.SelectDatasetsParams) ([]dto.DatasetShort, int64, error)

	// Experiment Variables
	CreateExperimentVariable(ctx context.Context, experimentID int32, name, value, varType, comment, creator string) (*dto.ExperimentVariable, int32, error)
	UpdateExperimentVariable(ctx context.Context, variableID int32, name, value, varType, comment, creator string) (*dto.ExperimentVariable, *dto.ExperimentVariable, int32, error)
	DeleteExperimentVariable(ctx context.Context, variableID int32) (*dto.ExperimentVariable, int32, error)
	GetExperimentVariables(ctx context.Context, experimentID int32) ([]dto.ExperimentVariableShort, error)
	GetExperimentVariable(ctx context.Context, variableID int32) (*dto.ExperimentVariable, error)
	GetExperimentVariableByName(ctx context.Context, experimentID int32, name string) (*dto.ExperimentVariable, error)
	UpdateExperimentVariableByName(ctx context.Context, experimentID int32, name, value, varType, comment, creator string) (*dto.ExperimentVariable, *dto.ExperimentVariable, int32, bool, error)
	DeleteExperimentVariableByName(ctx context.Context, experimentID int32, name string) (*dto.ExperimentVariable, int32, error)

	// Legacy variable methods (v1 API)
	UpdateExperimentVariableName(ctx context.Context, variableID int32, newName string) error
	InsertExperimentVariableVersionAndSetCurrent(ctx context.Context, variableID int32, value, varType string) error
	InsertExperimentVariableVersionAndSetCurrentWithMeta(ctx context.Context, variableID int32, value, varType, comment, creator string) error
	DeleteExperimentVariableByID(ctx context.Context, variableID int32) error

	// Experiment URLs
	GetExperimentURLs(ctx context.Context, experimentID int32) ([]dto.ExperimentURL, error)
	GetExperimentGrafanaURL(ctx context.Context, experimentID int32) (*dto.ExperimentURL, error)

	// Helper methods for internal use
	GetDatasetFromLinkByAlias(ctx context.Context, experimentID int32, alias string) (int32, string, error)
	GetDatasetFromLink(ctx context.Context, linkID int32) (int32, string, error)
	DeleteExperimentDatasetByID(ctx context.Context, linkID, experimentID int32) error
	InsertExperimentDatasetLink(ctx context.Context, experimentID, datasetID int32, alias string) (int32, error)
	UpdateExperimentDatasetLinkID(ctx context.Context, linkID, newDatasetID, experimentID int32) error
	UpdateExperimentDatasetAlias(ctx context.Context, linkID, experimentID int32, newAlias string) error
	GetExperimentDatasetByLink(ctx context.Context, experimentID int32, alias string) (*dto.ExperimentDataset, error)
	GetExperimentOrchID(ctx context.Context, experimentID int32) (string, error)
}

type IDatasetService interface {
	CreateDataset(ctx context.Context, dataset *dto.Dataset, inputProjectID int32, comment string, u *user.UserInfo) (*dto.Dataset, error)
	UpdateDataset(ctx context.Context, updatedDataset *dto.Dataset, public, managed *bool, comment, username string) (*dto.Dataset, error)
	ListDatasetByProject(ctx context.Context, projectID int32) (*[]dto.Dataset, error)
	GetDataset(ctx context.Context, datasetID int32) (*dto.DatasetWithProject, error)
	GetDatasetWithProjectInfo(ctx context.Context, datasetID, userID int32) (*dto.Dataset, string, int32, error)
	DeleteDataset(ctx context.Context, datasetID int32) error
	CopyDataset(ctx context.Context, srcDatasetID int32, newName string, targetProjectID int32, username string) (*dto.Dataset, error)
	SearchDatasets(ctx context.Context, params dbcore.SelectDatasetsParams) ([]dbcore.SelectDatasetsRow, error)
	GetDatasetLinkedExperiments(ctx context.Context, datasetID int32, limit, offset int32) ([]dto.DatasetExperimentLink, int64, error)
	GetDatasetYTURL(ctx context.Context, datasetID int32) (string, error)
	GetAvailableClusters() []dto.Cluster
}

type IProjectService interface {
	CreateProject(ctx context.Context, project dto.Project, namespaceID int32) (*dto.Project, error)
	UpdateProject(ctx context.Context, userID int32, project dto.Project) (*dto.Project, error)
	DeleteProject(ctx context.Context, userID int32, projectID int32) error
	ListProjects(ctx context.Context, namespaceID int32) ([]dto.Project, error)
	ListProject(ctx context.Context, r requests.ListProjectsRequestV2) (*[]dto.ProjectInfo, int64, error)
	GetProjectInfo(ctx context.Context, userID, projectID int32) (*dto.Project, error)
	GetProjectInfoV2(ctx context.Context, projectID, userID int32) (*dto.Project, bool, error)
	ListProjectsV2(ctx context.Context, params dbcore.SelectProjectsV2Params) ([]dto.ProjectInfo, int64, error)
	ListProjectConfigs(ctx context.Context, projectID int32) (*[]dto.ProjectConfigVersion, error)
	GetProjectConfig(ctx context.Context, configID int32) (*dto.ProjectConfig, error)

	// Pinned Projects
	AddPinnedProject(ctx context.Context, projectID, userID int32) (*dto.PinnedProject, error)
	ListPinnedProjects(ctx context.Context, userID int32) ([]dto.PinnedProject, error)
	DeletePinnedProject(ctx context.Context, projectID, userID int32) error

	// Project URLs
	GetProjectURLs(ctx context.Context, projectID, userID int32) ([]dto.ProjectURL, error)
}

type IAppService interface {
	CreateAppBanner(ctx context.Context, title, message, color, colorDark, bannerType string, active bool, starts, ends *time.Time) (int32, error)
	UpdateAppBanner(ctx context.Context, bannerID int32, title, message, color, colorDark string, bannerType *string, active *bool, starts, ends *time.Time) (*dto.AppBanner, error)
	DeleteAppBanner(ctx context.Context, bannerID int32) error
	ListAppBanners(ctx context.Context) ([]dto.AppBanner, error)
	GetAppBanner(ctx context.Context, bannerID int32) (*dto.AppBanner, error)
	GetActiveAppBanner(ctx context.Context) (*dto.AppBanner, error)
	GetCurrentAppBanner(ctx context.Context) (*dto.AppBanner, error)
	GetAvailableBannerTypes() []dto.BannerType
	IsExistsActiveBlockBanners(ctx context.Context) (bool, error)

	// App Updates methods
	CreateAppUpdate(ctx context.Context, title, description, content string, videoUrl, imageUrl *string, releaseDate time.Time, isPublished bool) (*dto.AppUpdate, error)
	UpdateAppUpdate(ctx context.Context, updateID int32, title, description, content string, videoUrl, imageUrl *string, releaseDate *time.Time, isPublished *bool) (*dto.AppUpdate, error)
	DeleteAppUpdate(ctx context.Context, updateID int32) error
	ListAppUpdates(ctx context.Context, isAdmin bool, limit int32, offset int32) ([]dto.AppUpdate, int64, error)
	GetAppUpdate(ctx context.Context, updateID int32) (*dto.AppUpdate, error)

	// App Upcoming methods
	GetAppUpcoming(ctx context.Context) (*dto.AppUpcoming, error)
	UpdateAppUpcoming(ctx context.Context, content string) (*dto.AppUpcoming, error)

	// App About methods
	GetAppAbout(ctx context.Context) (*dto.AppAbout, error)
	UpdateAppAbout(ctx context.Context, content, links *string) (*dto.AppAbout, error)
}

type IUserService interface {
	GetUserIDByName(ctx context.Context, username string) (int32, error)
	CreateUser(ctx context.Context, name string) (int32, error)
	CreateUserGroup(ctx context.Context, name string) (int32, error)
	UpdateUserGroup(ctx context.Context, groupID int32, name string) error
	ListUsersInGroup(ctx context.Context, userGroupID int32) ([]dto.User, error)
	ListUserGroups(ctx context.Context) ([]dto.UserGroup, error)
}

type IACLService interface {
	CheckPermission(ctx context.Context, token string, objectType acl.ObjectType, objectAttribute acl.ObjectAttribute, action acl.Action, userInfo *user.UserInfo, objectID int32) (bool, error)
	GetObjectRights(ctx context.Context, objectType string, objectID int32, username string) ([]acl.Right, error)
	GetUsersPermissions(ctx context.Context, objectType string, objectID int32, search string, limit, offset int32) ([]dto.UserRights, int64, error)
	CheckUserPermissions(ctx context.Context, userID int32, objectType, objectAttribute string, objectID int32) ([]dto.Permission, error)
	Grant(ctx context.Context, userID, userGroupID, roleID, ruleID *int32) error
	Disclaim(ctx context.Context, userID, userGroupID, roleID, ruleID *int32) error
	AddUserToGroup(ctx context.Context, userID, userGroupID int32) error
	RemoveUserFromGroup(ctx context.Context, userID, userGroupID int32) error
	AddRuleToRole(ctx context.Context, ruleID, roleID int32) error
	RemoveRuleFromRole(ctx context.Context, ruleID, roleID int32) error
	ListUserMatches(ctx context.Context, userID int32) ([]dto.MatchedRule, error)
	ListUserGroupMatches(ctx context.Context, userGroupID int32) ([]dto.MatchedRule, error)
	CreateRole(ctx context.Context, name, description string, idmID string) (int32, error)
	UpdateRole(ctx context.Context, roleID int32, name, description string) error
	ListRoles(ctx context.Context) ([]dto.Role, error)
	ListUserRoles(ctx context.Context, userID int32) ([]dto.Role, error)
	CreateRule(ctx context.Context, objectType, objectAttribute, action string, objectID int32) (int32, error)
	ListRoleRules(ctx context.Context, roleID int32) ([]dto.Rule, error)

	// Rights retrieval methods
	GetExperimentRights(ctx context.Context, userInfo *user.UserInfo, experimentID int32) ([]acl.Right, error)
	GetDatasetRights(ctx context.Context, userInfo *user.UserInfo, datasetID int32) ([]acl.Right, error)
	GetProjectRights(ctx context.Context, userInfo *user.UserInfo, projectID int32) ([]acl.Right, error)
	GetNamespaceRights(ctx context.Context, userInfo *user.UserInfo, namespaceID int32) ([]acl.Right, error)
}

type ISchemaService interface {
	GetConfigSchema(ctx context.Context, configType string) (string, error)
}

type IGraphService interface {
	GetProjectGraph(ctx context.Context, projectID int32) (*graphService.Graph, error)
}

type IFormService interface {
	GetDatasetFormParams(ctx context.Context, dsType string, managed bool) ([]params.Param, error)
	GetProjectFormParams(ctx context.Context) ([]params.Param, error)
	GetPipelintFormsParams(ctx context.Context) ([]params.Param, error)
}

type IValidationService interface {
	ValidateProjectConfig(ctx context.Context, projectConfig string) error
	ValidateDatasetConfig(ctx context.Context, datasetConfig string) error
	ValidateExperimentConfig(ctx context.Context, experimentConfig string, experimentID int32) error
	GetExperimentConfigMap(ctx context.Context, experimentID int32, experimentConfig string) (map[string]interface{}, error)
	ValidateExperimentFast(ctx context.Context, config map[string]interface{}, shouldWriteLogs bool) (*dto.ValidationResponse, error)
	ValidateExperimentRun(ctx context.Context, config map[string]interface{}, shouldWriteLogs bool, dataSets *[][]dto.ValidationRequestDataItem, shouldReadYtSample *bool) (*dto.ValidationResponseWithRun, error)
}

type IVersionService interface {
	// Experiment Versions
	ListExperimentVersions(ctx context.Context, experimentID int32, limit, offset int32) ([]dto.ExperimentVersion, int64, error)
	GetExperimentVersion(ctx context.Context, versionID int32) (*dto.ExperimentTemplate, error)
	GetExperimentCurrentVersion(ctx context.Context, experimentID int32) (int32, error)
	GetExperimentAppliedVersion(ctx context.Context, experimentID int32) (int32, string, error)
	SetExperimentAppliedVersion(ctx context.Context, experimentID, versionID int32, orchConfig string) error
	UpdateExperimentVersionComment(ctx context.Context, versionID int32, comment, username string) (*dto.ExperimentTemplate, error)
	UpdateExperimentVersion(ctx context.Context, experimentID, versionID int32, comment, username string) (*dto.CompleteExperiment, error)

	// Experiment Variable Versions
	ListExperimentVariableVersions(ctx context.Context, variableID int32, experimentID int32, limit, offset int32) ([]dto.ExperimentVariableVersion, int64, error)
	GetExperimentVariableVersion(ctx context.Context, versionID int32) (*dto.ExperimentVariableVersionTemplate, error)
	GetExperimentVariableCurrentVersion(ctx context.Context, variableID int32) (int32, error)
	UpdateExperimentVariableVersionComment(ctx context.Context, versionID int32, comment, username string) (*dto.ExperimentVariableVersionTemplate, error)
	UpdateExperimentVariableVersion(ctx context.Context, variableID, versionID int32, comment, username string) (*dto.ExperimentVariable, *dto.ExperimentVariable, int32, error)

	// Dataset Versions
	ListDatasetVersions(ctx context.Context, datasetID int32, limit, offset int32) ([]dto.DatasetVersion, int64, error)
	GetDatasetVersion(ctx context.Context, versionID int32) (*dto.DatasetVersionTemplate, error)
	GetDatasetCurrentVersion(ctx context.Context, datasetID int32) (int32, error)
	UpdateDatasetVersionComment(ctx context.Context, versionID int32, comment, username string) (*dto.DatasetVersionTemplate, error)
	UpdateDatasetVersion(ctx context.Context, datasetID, versionID int32, comment, username string) (*dto.Dataset, error)
}

type IUpdateLogService interface {
	// Log Creation
	LogExperimentChange(ctx context.Context, projectID int32, experimentID int32, username, comment string, act update_log.Action, details update_log.ExperimentUpdateLog)
	LogProjectChange(ctx context.Context, namespaceID int32, projectID int32, username, comment string, act update_log.Action, details update_log.ProjectUpdateLog)
	LogDatasetChange(ctx context.Context, namespaceID int32, projectID pgtype.Int4, datasetID int32, username, comment string, act update_log.Action, details update_log.DatasetUpdateLog)
	LogNamespaceChange(ctx context.Context, namespaceID int32, username, comment string, act update_log.Action, details update_log.NamespaceUpdateLog)

	// Namespace Logs
	ListNamespaceUpdateLogs(ctx context.Context, namespaceID int32, limit, offset int32) ([]dto.NamespaceUpdateLog, int64, error)
	GetNamespaceLog(ctx context.Context, logID int32) (*dto.NamespaceUpdateLog, update_log.NamespaceUpdateLog, int32, error)
	UpdateNamespaceLogComment(ctx context.Context, logID int32, newComment, username string) error

	// Project Logs
	ListProjectUpdateLogs(ctx context.Context, projectID, namespaceID int32, limit, offset int32) ([]dto.ProjectUpdateLog, int64, error)
	GetProjectLog(ctx context.Context, logID int32) (*dto.ProjectUpdateLog, update_log.ProjectUpdateLog, int32, int32, error)
	UpdateProjectLogComment(ctx context.Context, logID int32, newComment, username string) error

	// Experiment Logs
	ListExperimentUpdateLogs(ctx context.Context, experimentID, projectID int32, limit, offset int32) ([]dto.ExperimentUpdateLog, int64, error)
	GetExperimentLog(ctx context.Context, logID int32) (*dto.ExperimentUpdateLog, update_log.ExperimentUpdateLog, int32, int32, error)
	UpdateExperimentLogComment(ctx context.Context, logID int32, newComment, username string) error

	// Dataset Logs
	ListDatasetUpdateLogsByNamespace(ctx context.Context, datasetID, namespaceID int32, limit, offset int32) ([]dto.DatasetUpdateLog, int64, error)
	ListDatasetUpdateLogsByProject(ctx context.Context, datasetID, projectID int32, limit, offset int32) ([]dto.DatasetUpdateLog, int64, error)
	GetDatasetLog(ctx context.Context, logID int32) (*dto.DatasetUpdateLog, update_log.DatasetUpdateLog, int32, int32, error)
	UpdateDatasetLogComment(ctx context.Context, logID int32, newComment, username string) error
}

type ICubeService interface {
	CreateCube(ctx context.Context, cube *dto.Cube) (*dto.Cube, error)
	UpdateCube(ctx context.Context, cube *dto.Cube) (*dto.Cube, error)
	ListCubes(ctx context.Context) ([]dto.Cube, error)
	ListCubesByIDs(ctx context.Context, ids []int32) ([]dto.Cube, error)
	GetCubeByName(ctx context.Context, name string) (*dto.Cube, error)
	GetCubeByID(ctx context.Context, ID int32) (*dto.Cube, error)
}

type Service struct {
	Repo *repository.Repository
	IAuthService
	INamespaceService
	IExperimentService
	IDatasetService
	IProjectService
	IVersionService
	IUpdateLogService
	IAppService
	IUserService
	IACLService
	ISchemaService
	IGraphService
	IFormService
	IValidationService
	ICubeService
}

func NewService(repo *repository.Repository) *Service {
	experimentSvc := experimentService.NewExperimentService(repo)
	graphSvc := graphService.NewGraphService(repo, experimentSvc)

	return &Service{
		Repo:               repo,
		IAuthService:       authService.NewAuthService(repo),
		INamespaceService:  namespaceService.NewNamespaceService(repo),
		IExperimentService: experimentSvc,
		IDatasetService:    datasetService.NewDatasetService(repo),
		IProjectService:    projectService.NewProjectService(repo),
		IVersionService:    versionService.NewVersionService(repo),
		IUpdateLogService:  updateLogService.NewUpdateLogService(repo),
		IAppService:        appService.NewAppService(repo),
		IUserService:       userService.NewUserService(repo),
		IACLService:        aclService.NewACLService(repo),
		ISchemaService:     schemaService.NewSchemaService(repo),
		IGraphService:      graphSvc,
		IFormService:       formService.NewFormService(repo),
		IValidationService: validationService.NewValidationService(repo),
		ICubeService:       cubeService.NewCubeService(repo),
	}
}

// GetVersion returns application version
func (s *Service) GetVersion() string {
	return s.Repo.Version
}

// GetLogger returns logger instance
func (s *Service) GetLogger() *logger.Logger {
	return s.Repo.Logger
}

// GetAuthToken returns authentication token
func (s *Service) GetAuthToken() string {
	return s.Repo.Config.AuthToken
}

// GetACLToken returns ACL superuser token
func (s *Service) GetACLToken() string {
	return s.Repo.Config.ACL.Token
}

// IsTestEnvironment проверяет, запущено ли приложение в тестовом окружении
func (s *Service) IsTestEnvironment() bool {
	return s.Repo.Config.IsTestEnv
}

// GetOrchestratorClient returns orchestrator client
func (s *Service) GetOrchestratorClient() interface{} {
	return s.Repo.Clients.Orchestrator.Client
}

// CheckExperimentQuota проверяет квоту пайплайна
func (s *Service) CheckExperimentQuota(ctx context.Context, experimentID int32) (bool, error) {
	unlimited, err := s.Repo.DB.CheckExperimentLimit(ctx, experimentID)
	if err != nil {
		return false, err
	}
	return unlimited > 0, nil
}

// GetCompleteExperimentInfo возвращает полную информацию о пайплайне для генерации конфига оркестратора
func (s *Service) GetCompleteExperimentInfo(ctx context.Context, experimentID int32) (interface{}, error) {
	return s.Repo.DB.CompleteExperimentInfo(ctx, experimentID)
}

// GetExperimentURLsConfig возвращает конфигурацию URL для experiment
func (s *Service) GetExperimentURLsConfig() map[string]struct {
	URL     string `yaml:"url"`
	Name    string `yaml:"name"`
	Enabled bool   `yaml:"enabled"`
} {
	return s.Repo.Config.ExperimentURLs
}

// GetDB returns database instance (temporary method for legacy code)
func (s *Service) GetDB() interface{} {
	return s.Repo.DB
}
