package service

import (
	"context"
	"database/sql"
	"encoding/json"
	"regexp"

	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/libs/models/experiment"
)

type NamespaceService struct {
	repo *repository.Repository
}

func NewNamespaceService(repo *repository.Repository) *NamespaceService {
	return &NamespaceService{repo: repo}
}

var namespaceRegExp = regexp.MustCompile(`^[a-z0-9\-]{1,10}$`)

func checkNamespaceName(name string) string {
	if !namespaceRegExp.MatchString(name) {
		return "invalid namespace name"
	}

	return ""
}

func (n *NamespaceService) CreateNamespace(ctx context.Context, name string) (int32, error) {
	if errMsg := checkNamespaceName(name); errMsg != "" {
		n.repo.Logger.Error("bad namespace name", nil)
		return 0, serviceerrors.NewEntityBadRequestError(
			serviceerrors.EntityNamespace,
			"Некорректное имя namespace: должно содержать только строчные буквы, цифры и дефис (1-10 символов)",
			nil,
		)
	}

	id, err := n.repo.DB.InsertNamespace(ctx, name)
	if err != nil {
		n.repo.Logger.Error("failed to insert namespace", err)
		// Автоматически обрабатывает unique constraint violations
		return 0, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespace)
	}

	versionID, err := n.repo.DB.InsertNamespaceConfig(ctx, dbcore.InsertNamespaceConfigParams{
		NamespaceID: id,
		Config:      []byte(`{}`),
	})
	if err != nil {
		n.repo.Logger.Error("failed to insert namespace config", err)
		return 0, serviceerrors.NewEntityInternalError(
			serviceerrors.EntityNamespaceConfig,
			"Не удалось создать конфигурацию namespace",
			err,
		)
	}

	err = n.repo.DB.UpdateCurrentNamespaceConfig(ctx, dbcore.UpdateCurrentNamespaceConfigParams{
		ID:                 id,
		NamespaceVersionID: pgtype.Int4{Int32: versionID, Valid: true},
	})
	if err != nil {
		n.repo.Logger.Error("failed to update namespace version", err)
		return 0, serviceerrors.NewEntityInternalError(
			serviceerrors.EntityNamespaceConfig,
			"Не удалось обновить версию namespace",
			err,
		)
	}

	return id, nil
}

func (n *NamespaceService) DeleteNamespace(ctx context.Context, id int32) error {
	_, err := n.repo.DB.SelectNamespace(ctx, id)
	if err != nil {
		n.repo.Logger.Error("failed to select namespace", err)
		// Автоматически определяет NotFound для pgx.ErrNoRows
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespace)
	}

	projectsCount, err := n.repo.DB.GetProjectsCount(ctx, id)
	if err != nil {
		n.repo.Logger.Error("failed to get projects count", err)
		return serviceerrors.NewEntityInternalError(
			serviceerrors.EntityNamespace,
			"Не удалось получить количество проектов",
			err,
		)
	}

	if projectsCount > 0 {
		return serviceerrors.NewEntityConflictError(
			serviceerrors.EntityNamespace,
			"Невозможно удалить namespace: в нем существуют проекты",
			nil,
		)
	}

	datasetsCount, err := n.repo.DB.GetDatasetsCount(ctx, pgtype.Int4{Int32: id, Valid: true})
	if err != nil {
		n.repo.Logger.Error("failed to get datasets count", err)
		return serviceerrors.NewEntityInternalError(
			serviceerrors.EntityNamespace,
			"Не удалось получить количество datasets",
			err,
		)
	}

	if datasetsCount > 0 {
		return serviceerrors.NewEntityConflictError(
			serviceerrors.EntityNamespace,
			"Невозможно удалить namespace: в нем существуют datasets",
			nil,
		)
	}

	err = n.repo.DB.DeleteNamespace(ctx, id)
	if err != nil {
		n.repo.Logger.Error("failed to delete namespace", err)
		return serviceerrors.NewEntityInternalError(
			serviceerrors.EntityNamespace,
			"Не удалось удалить namespace",
			err,
		)
	}

	return nil
}

func (n *NamespaceService) UpdateNamespace(ctx context.Context, id int32, name string, config string) (*dto.NamespaceInfo, error) {
	if errMsg := checkNamespaceName(name); name != "" && errMsg != "" {
		return nil, serviceerrors.NewBadRequestError("Некорректное имя namespace: "+errMsg, nil)
	}

	err := n.repo.DB.UpdateNamespace(ctx, dbcore.UpdateNamespaceParams{
		ID:   id,
		Name: name,
	})
	if err != nil {
		n.repo.Logger.Error("failed to update namespace", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespace)
	}

	var versionID int32

	if config != "" {
		var experimentConfig experiment.ExperimentConfig
		err = json.Unmarshal([]byte(config), &experimentConfig)
		if err != nil {
			n.repo.Logger.Error("failed to unmarshal config", err)
			return nil, serviceerrors.NewBadRequestError("Некорректный формат конфигурации", err)
		}

		versionID, err = n.repo.DB.InsertNamespaceConfig(ctx, dbcore.InsertNamespaceConfigParams{
			NamespaceID: id,
			Config:      []byte(config),
		})
		if err != nil {
			n.repo.Logger.Error("failed to insert config", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespaceConfig)
		}

		err = n.repo.DB.UpdateCurrentNamespaceConfig(ctx, dbcore.UpdateCurrentNamespaceConfigParams{
			ID:                 id,
			NamespaceVersionID: pgtype.Int4{Int32: versionID, Valid: true},
		})
		if err != nil {
			n.repo.Logger.Error("failed to update current namespace", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespaceConfig)
		}
	}

	namespace, err := n.repo.DB.SelectNamespace(ctx, id)
	if err != nil {
		n.repo.Logger.Error("failed to select namespace", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespace)
	}

	return &dto.NamespaceInfo{
		ID:               namespace.ID,
		Name:             namespace.Name,
		Config:           string(namespace.Config),
		CurrentVersionID: namespace.ConfigVersionID,
	}, nil
}

func (n *NamespaceService) ListNamespacesWithRights(ctx context.Context, username string) (*[]dto.Namespace, error) {
	namespaces, err := n.repo.DB.SelectNamespaces(ctx)
	if err != nil {
		n.repo.Logger.Error("failed to list namespaces", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespace)
	}

	userInfo := &user.UserInfo{
		Username: username,
	}

	result := make([]dto.Namespace, len(namespaces))
	for i, namespace := range namespaces {

		rights, err := acl.GetNamespaceRights(ctx, &n.repo.Config.ACL, n.repo.Logger, n.repo.DB, "", userInfo, namespace.ID)
		if err != nil {
			n.repo.Logger.Error("failed to get namespace rights", err)
		}

		result[i] = dto.Namespace{
			ID:     namespace.ID,
			Name:   namespace.Name,
			Rights: rights,
		}
	}

	return &result, nil
}

func (n *NamespaceService) GetNamespace(ctx context.Context, id int32, username string) (*dto.NamespaceInfo, error) {
	namespaceBasic, err := n.repo.DB.SelectNamespace(ctx, id)
	if err != nil {
		n.repo.Logger.Error("failed to select namespace", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespace)
	}

	config, err := n.repo.DB.SelectCurrentNamespaceConfig(ctx, id)
	if err != nil && err != sql.ErrNoRows {
		n.repo.Logger.Error("failed to select current namespace", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespaceConfig)
	}

	userInfo := &user.UserInfo{
		Username: username,
	}

	rights, err := acl.GetNamespaceRights(ctx, &n.repo.Config.ACL, n.repo.Logger, n.repo.DB, "", userInfo, id)
	if err != nil {
		n.repo.Logger.Error("failed to get namespace rights", err)
	}

	return &dto.NamespaceInfo{
		ID:               namespaceBasic.ID,
		Name:             namespaceBasic.Name,
		Config:           string(config.Config),
		CurrentVersionID: namespaceBasic.ConfigVersionID,
		Rights:           rights,
	}, nil
}

func (n *NamespaceService) ListNamespaceConfigs(ctx context.Context, namespaceID int32) (*[]dto.NamespaceConfigVersion, error) {
	configs, err := n.repo.DB.SelectNamespaceConfigVersions(ctx, namespaceID)
	if err != nil {
		n.repo.Logger.Error("failed to list namespace configs", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespaceConfig)
	}

	result := make([]dto.NamespaceConfigVersion, len(configs))
	for i, config := range configs {
		result[i] = dto.NamespaceConfigVersion{
			ID:        config.ID,
			CreatedAt: config.CreatedAt.Time,
		}
	}

	return &result, nil
}

func (n *NamespaceService) GetNamespaceConfig(ctx context.Context, configID int32) (*dto.NamespaceConfig, error) {
	config, err := n.repo.DB.SelectNamespaceConfig(ctx, configID)
	if err != nil {
		n.repo.Logger.Error("failed to get namespace config", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespaceConfig)
	}

	return &dto.NamespaceConfig{
		ID:        config.ID,
		CreatedAt: config.CreatedAt.Time,
		Config:    string(config.Config),
	}, nil
}

func (n *NamespaceService) ListNamespacesV2(ctx context.Context) (*[]dto.NamespaceShort, error) {
	namespaces, err := n.repo.DB.SelectNamespaces(ctx)
	if err != nil {
		n.repo.Logger.Error("failed to list namespaces", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityNamespace)
	}

	result := make([]dto.NamespaceShort, len(namespaces))
	for i, namespace := range namespaces {
		result[i] = dto.NamespaceShort{
			ID:   namespace.ID,
			Name: namespace.Name,
		}
	}

	return &result, nil
}
