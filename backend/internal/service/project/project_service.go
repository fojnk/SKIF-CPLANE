package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type ProjectService struct {
	repo *repository.Repository
}

func NewProjectService(repo *repository.Repository) *ProjectService {
	return &ProjectService{repo: repo}
}

func (s *ProjectService) CreateProject(ctx context.Context, project dto.Project, namespaceID int32) (*dto.Project, error) {
	inserted, err := s.repo.DB.InsertProject(ctx, dbcore.InsertProjectParams{
		NamespaceID:  namespaceID,
		Name:         project.Name,
		Description:  project.Description,
		AbcProductID: "",
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert project", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	versionID, err := s.repo.DB.InsertProjectConfig(ctx, dbcore.InsertProjectConfigParams{
		ProjectID: inserted.ID,
		Config:    []byte(`{}`),
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert project config", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	err = s.repo.DB.UpdateCurrentProjectConfig(ctx, dbcore.UpdateCurrentProjectConfigParams{
		ID:               inserted.ID,
		ProjectVersionID: pgtype.Int4{Int32: versionID, Valid: true},
	})
	if err != nil {
		s.repo.Logger.Error("failed to update project config", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	return &dto.Project{
		ID:          inserted.ID,
		Name:        inserted.Name,
		Description: inserted.Description,
	}, nil
}

func (s *ProjectService) UpdateProject(ctx context.Context, userID int32, project dto.Project) (*dto.Project, error) {
	_, err := s.repo.DB.UpdateProject(ctx, dbcore.UpdateProjectParams{
		ID:          project.ID,
		Name:        project.Name,
		Description: project.Description,
	})
	if err != nil {
		s.repo.Logger.Error("failed to update project", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	var versionID int32
	if project.Config != "" {
		// Validate that it's valid JSON, but don't enforce strict structure
		// as the config can be in old format (ExperimentMeta) or new format (with MainCluster/ReplicaClusters)
		var jsonCheck any
		err = json.Unmarshal([]byte(project.Config), &jsonCheck)
		if err != nil {
			s.repo.Logger.Error("failed to update project config", err)
			return nil, serviceerrors.NewBadRequestError("Некорректный формат конфигурации проекта", err)
		}

		versionID, err = s.repo.DB.InsertProjectConfig(ctx, dbcore.InsertProjectConfigParams{
			ProjectID: project.ID,
			Config:    []byte(project.Config),
		})
		if err != nil {
			s.repo.Logger.Error("failed to update project config", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
		}

		err = s.repo.DB.UpdateCurrentProjectConfig(ctx, dbcore.UpdateCurrentProjectConfigParams{
			ID:               project.ID,
			ProjectVersionID: pgtype.Int4{Int32: versionID, Valid: true},
		})
		if err != nil {
			s.repo.Logger.Error("failed to update project config", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
		}
	}

	selProject, err := s.repo.DB.SelectProject(ctx, dbcore.SelectProjectParams{
		ID:     project.ID,
		UserID: userID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to select project variable", err)
		return nil, serviceerrors.NewNotFoundError("Проект не найден", err)
	}

	return &dto.Project{
		ID:          selProject.ID,
		Name:        selProject.Name,
		Description: selProject.Description,
		Config:      string(selProject.Config),
	}, nil
}

func (s *ProjectService) DeleteProject(ctx context.Context, userID int32, projectID int32) error {

	_, err := s.repo.DB.SelectProject(ctx, dbcore.SelectProjectParams{
		ID:     projectID,
		UserID: userID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to select project variable", err)
		return serviceerrors.NewNotFoundError("Проект не найден", err)
	}

	experimentsCount, err := s.repo.DB.GetExperimentsCount(ctx, projectID)
	if err != nil {
		s.repo.Logger.Error("failed to select project experiment count", err)
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	if experimentsCount > 0 {
		return serviceerrors.NewConflictError("Невозможно удалить проект: существуют пайплайны", nil)
	}

	datasetCount, err := s.repo.DB.GetDatasetsCountInProject(ctx, pgtype.Int4{Int32: projectID, Valid: true})
	if err != nil {
		s.repo.Logger.Error("failed to select project dataset count", err)
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	if datasetCount > 0 {
		return serviceerrors.NewConflictError("Невозможно удалить проект: существуют датасорсы", nil)
	}

	err = s.repo.DB.DeleteProject(ctx, projectID)
	if err != nil {
		s.repo.Logger.Error("failed to delete project", err)
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	return nil
}

func (s *ProjectService) ListProjects(ctx context.Context, namespaceID int32) ([]dto.Project, error) {
	projects, err := s.repo.DB.SelectProjects(ctx, namespaceID)
	if err != nil {
		s.repo.Logger.Error("failed to select projects", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	result := make([]dto.Project, len(projects))
	for i, project := range projects {
		result[i] = dto.Project{
			ID:          project.ID,
			Name:        project.Name,
			Description: project.Description,
		}
	}

	return result, nil
}

func (s *ProjectService) ListProject(ctx context.Context, r requests.ListProjectsRequestV2) (*[]dto.ProjectInfo, int64, error) {
	projects, err := s.repo.DB.SelectProjectsV2(ctx, dbcore.SelectProjectsV2Params{
		Limit:     r.Limit,
		Offset:    *r.Offset,
		Search:    r.Search,
		Namespace: r.NamespaceID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to select project list", err)
		return nil, 0, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	var total int64

	res := make([]dto.ProjectInfo, len(projects))
	for i, project := range projects {
		total = project.Total

		res[i] = dto.ProjectInfo{
			ID:              project.ID,
			Name:            project.Name,
			Description:     project.Description,
			NamespaceID:     project.NamespaceID.Int32,
			NamespaceName:   project.NamespaceName.String,
			ExperimentCount: project.ExperimentCount,
			DatasetCount:    project.DatasetCount,
		}
	}

	return &res, total, nil
}

func (s *ProjectService) GetProjectInfo(ctx context.Context, userID, projectID int32) (*dto.Project, error) {

	project, err := s.repo.DB.SelectProject(ctx, dbcore.SelectProjectParams{
		ID:     projectID,
		UserID: userID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to select project variable", err)
		return nil, serviceerrors.NewNotFoundError("Проект не найден", err)
	}

	config, err := s.repo.DB.SelectCurrentProjectConfig(ctx, projectID)
	if err != nil {
		s.repo.Logger.Error("failed to select project config", err)
		if err == sql.ErrNoRows {
			config.Config = []byte("")
		} else {
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
		}
	}

	configStr := string(project.Config)
	if len(config.Config) > 0 {
		configStr = string(config.Config)
	}

	isPinned := project.IsPinned != nil && *project.IsPinned

	return &dto.Project{
		ID:            project.ID,
		Name:          project.Name,
		Description:   project.Description,
		Config:        configStr,
		NamespaceID:   project.NamespaceID,
		NamespaceName: project.NamespaceName,
		IsPinned:      isPinned,
	}, nil
}

func (s *ProjectService) ListProjectConfigs(ctx context.Context, projectID int32) (*[]dto.ProjectConfigVersion, error) {
	configs, err := s.repo.DB.SelectProjectConfigVersions(ctx, projectID)
	if err != nil {
		s.repo.Logger.Error("failed to select project configs", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	result := make([]dto.ProjectConfigVersion, len(configs))
	for i, config := range configs {
		result[i] = dto.ProjectConfigVersion{
			ID:        config.ID,
			CreatedAt: config.CreatedAt.Time,
		}
	}

	return &result, nil
}

func (s *ProjectService) GetProjectConfig(ctx context.Context, configID int32) (*dto.ProjectConfig, error) {
	config, err := s.repo.DB.SelectProjectConfig(ctx, configID)
	if err != nil {
		s.repo.Logger.Error("failed to select project config", err)
		return nil, serviceerrors.NewNotFoundError("Конфигурация проекта не найдена", err)
	}

	return &dto.ProjectConfig{
		ID:        config.ID,
		CreatedAt: config.CreatedAt.Time,
		Config:    string(config.Config),
	}, nil
}

// AddPinnedProject добавляет проект в закрепленные для пользователя
func (s *ProjectService) AddPinnedProject(ctx context.Context, projectID, userID int32) (*dto.PinnedProject, error) {
	project, err := s.repo.DB.SelectProject(ctx, dbcore.SelectProjectParams{
		ID:     projectID,
		UserID: userID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to select project", err)
		return nil, serviceerrors.NewNotFoundError("Проект не найден", err)
	}

	projectInfo, err := s.repo.DB.InsertPinnedProject(ctx, dbcore.InsertPinnedProjectParams{
		ProjectID: projectID,
		UserID:    userID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert pinned project", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	return &dto.PinnedProject{
		ID:          projectInfo.ID,
		ProjectID:   projectInfo.ProjectID,
		ProjectName: project.Name,
	}, nil
}

// ListPinnedProjects возвращает список закрепленных проектов пользователя
func (s *ProjectService) ListPinnedProjects(ctx context.Context, userID int32) ([]dto.PinnedProject, error) {
	projects, err := s.repo.DB.GetUserPinnedProjects(ctx, userID)
	if err != nil {
		s.repo.Logger.Error("failed to select pinned project list", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	result := make([]dto.PinnedProject, len(projects))
	for i, project := range projects {
		result[i] = dto.PinnedProject{
			ID:          project.ID,
			ProjectID:   project.ProjectID,
			ProjectName: project.ProjectName,
		}
	}

	return result, nil
}

// DeletePinnedProject удаляет проект из закрепленных
func (s *ProjectService) DeletePinnedProject(ctx context.Context, projectID, userID int32) error {
	project, err := s.repo.DB.SelectProject(ctx, dbcore.SelectProjectParams{
		ID:     projectID,
		UserID: userID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to select project", err)
		return serviceerrors.NewNotFoundError("Проект не найден", err)
	}

	err = s.repo.DB.DeletePinnedProject(ctx, dbcore.DeletePinnedProjectParams{
		ProjectID: project.ID,
		UserID:    userID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to delete pinned project", err)
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	return nil
}

// GetProjectInfoV2 получает полную информацию о проекте включая права и pinned статус
func (s *ProjectService) GetProjectInfoV2(ctx context.Context, projectID, userID int32) (*dto.Project, bool, error) {
	project, err := s.repo.DB.SelectProject(ctx, dbcore.SelectProjectParams{
		ID:     projectID,
		UserID: userID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to select project", err)
		return nil, false, serviceerrors.NewNotFoundError("Проект не найден", err)
	}

	pinned := false
	if project.IsPinned != nil && *project.IsPinned {
		pinned = true
	}

	config, err := s.repo.DB.SelectCurrentProjectConfig(ctx, projectID)
	configStr := string(project.Config)
	if err != nil {
		s.repo.Logger.Error("failed to select project config", err)
		if err != sql.ErrNoRows {
			return nil, false, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
		}
	} else if len(config.Config) > 0 {
		configStr = string(config.Config)
	}

	return &dto.Project{
		ID:            project.ID,
		Name:          project.Name,
		Description:   project.Description,
		Config:        configStr,
		NamespaceID:   project.NamespaceID,
		NamespaceName: project.NamespaceName,
		IsPinned:      pinned,
	}, pinned, nil
}

// ListProjectsV2 возвращает список проектов с фильтрацией и пагинацией
func (s *ProjectService) ListProjectsV2(ctx context.Context, params dbcore.SelectProjectsV2Params) ([]dto.ProjectInfo, int64, error) {
	projects, err := s.repo.DB.SelectProjectsV2(ctx, params)
	if err != nil {
		s.repo.Logger.Error("failed to select project list", err)
		return nil, 0, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	var total int64
	result := make([]dto.ProjectInfo, len(projects))
	for i, project := range projects {
		total = project.Total

		pinned := false
		if project.IsPinned != nil && *project.IsPinned {
			pinned = true
		}

		result[i] = dto.ProjectInfo{
			ID:              project.ID,
			Name:            project.Name,
			Description:     project.Description,
			NamespaceID:     project.NamespaceID.Int32,
			NamespaceName:   project.NamespaceName.String,
			ExperimentCount: project.ExperimentCount,
			DatasetCount:    project.DatasetCount,
			CreatedAt:       project.CreatedAt.Time,
			UpdatedAt:       project.UpdatedAt.Time,
			IsPinned:        pinned,
		}
	}

	return result, total, nil
}

type clusterInfo struct {
	ClusterURL string
	Name       string
}

func extractClustersFromConfig(configJSON []byte) ([]clusterInfo, string, string, error) {
	var config map[string]any
	if err := json.Unmarshal(configJSON, &config); err != nil {
		return nil, "", "", err
	}

	ytConfig, ok := config["YT"].(map[string]any)
	if !ok {
		return nil, "", "", nil
	}

	var clusters []clusterInfo
	var workDir string
	var tabletCellBundle string

	// Получаем WorkDir и TabletCellBundle
	if wd, ok := ytConfig["WorkDir"].(string); ok {
		workDir = wd
	}

	// Проверяем новый формат с MainCluster и ReplicaClusters
	if mainCluster, ok := ytConfig["MainCluster"].(map[string]any); ok {
		// Новый формат
		if clusterURL, ok := mainCluster["ClusterUrl"].(string); ok {
			clusters = append(clusters, clusterInfo{
				ClusterURL: clusterURL,
				Name:       "Main",
			})
			if bundle, ok := mainCluster["TabletCellBundle"].(string); ok && tabletCellBundle == "" {
				tabletCellBundle = bundle
			}
		}

		// Обрабатываем реплики
		if replicaClusters, ok := ytConfig["ReplicaClusters"].([]any); ok {
			for i, replica := range replicaClusters {
				if replicaMap, ok := replica.(map[string]any); ok {
					if clusterURL, ok := replicaMap["ClusterUrl"].(string); ok {
						clusters = append(clusters, clusterInfo{
							ClusterURL: clusterURL,
							Name:       fmt.Sprintf("Replica %d", i+1),
						})
						if bundle, ok := replicaMap["TabletCellBundle"].(string); ok && tabletCellBundle == "" {
							tabletCellBundle = bundle
						}
					}
				}
			}
		}
	} else if cluster, ok := ytConfig["Cluster"].(string); ok {
		// Старый формат для обратной совместимости
		clusters = append(clusters, clusterInfo{
			ClusterURL: cluster,
			Name:       "Main",
		})
		if bundle, ok := ytConfig["TabletCellBundle"].(string); ok {
			tabletCellBundle = bundle
		}
	}

	return clusters, workDir, tabletCellBundle, nil
}

func extractClusterName(clusterURL string) string {
	parts := strings.Split(clusterURL, ".")
	if len(parts) > 0 {
		return parts[0]
	}
	return clusterURL
}

// GetProjectURLs генерирует URLs для проекта
func (s *ProjectService) GetProjectURLs(ctx context.Context, projectID, userID int32) ([]dto.ProjectURL, error) {
	meta, err := orch.GetMetaInfo(ctx, s.repo.DB, projectID, userID)
	if err != nil {
		s.repo.Logger.Error("failed to get meta project info", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	// Получаем сырой конфиг проекта для извлечения информации о кластерах
	projectData, err := s.repo.DB.SelectProject(ctx, dbcore.SelectProjectParams{
		ID:     projectID,
		UserID: userID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to get project data", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityProject)
	}

	clusters, workDir, tabletCellBundle, err := extractClustersFromConfig(projectData.Config)
	if err != nil {
		s.repo.Logger.Error("failed to extract clusters from config", err)
		// Fallback на старую логику
		clusters = []clusterInfo{}
	}

	// Если не удалось извлечь кластеры из нового формата, используем старый формат
	if len(clusters) == 0 {
		if meta.YT.Cluster != "" {
			clusters = append(clusters, clusterInfo{
				ClusterURL: meta.YT.Cluster,
				Name:       "Main",
			})
		}
		if workDir == "" {
			workDir = meta.YT.WorkDir
		}
		if tabletCellBundle == "" {
			tabletCellBundle = meta.YT.TabletCellBundle
		}
	}

	responseURLs := make([]dto.ProjectURL, 0)
	urlsWithoutCluster := make(map[string]bool) // Для отслеживания URLs без CLUSTER_NAME

	// Генерируем URLs для каждого кластера
	for _, cluster := range clusters {
		clusterName := extractClusterName(cluster.ClusterURL)

		for _, url := range s.repo.Config.ProjectURLs {
			newURL := url.URL
			urlName := url.Name
			hasClusterName := strings.Contains(newURL, "CLUSTER_NAME")

			// Если URL не содержит CLUSTER_NAME и уже был добавлен, пропускаем
			if !hasClusterName {
				if urlsWithoutCluster[url.URL] {
					continue
				}
				urlsWithoutCluster[url.URL] = true
			} else {
				// Если это не единственный кластер, добавляем суффикс к имени
				if len(clusters) > 1 {
					urlName = fmt.Sprintf("%s (%s)", url.Name, cluster.Name)
				}
			}

			if hasClusterName {
				if clusterName != "" {
					newURL = strings.ReplaceAll(newURL, "CLUSTER_NAME", clusterName)
				} else {
					continue
				}
			}
			if strings.Contains(newURL, "BUNDLE_NAME") {
				if tabletCellBundle != "" {
					newURL = strings.ReplaceAll(newURL, "BUNDLE_NAME", tabletCellBundle)
				} else {
					continue
				}
			}
			if strings.Contains(newURL, "YT_WORK_DIR") {
				if workDir != "" {
					newURL = strings.ReplaceAll(newURL, "YT_WORK_DIR", workDir)
				} else {
					continue
				}
			}

			responseURLs = append(responseURLs, dto.ProjectURL{
				URL:  newURL,
				Name: urlName,
			})
		}
	}

	return responseURLs, nil
}
