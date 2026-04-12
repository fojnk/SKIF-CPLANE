package acl

import (
	"context"
	"fmt"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
)

type PermissionCheckConfig struct {
	Token          string `yaml:"token"`
	ReadonlyForAll bool   `yaml:"readonly_for_all"`
}

func CheckPermission(
	ctx context.Context,
	c *PermissionCheckConfig,
	l *logger.Logger,
	db db.DB,
	token string,
	objectType ObjectType,
	objectAttribute ObjectAttribute,
	permissionType Action,
	userInfo *user.UserInfo,
	objectID int32,
) (bool, error) {
	permissionLogger := l.With("object_type", string(objectType)).With("object_id", strconv.Itoa(int(objectID))).With("user_name", userInfo.Username).With("permission_type", string(permissionType)).With("object_attribute", string(objectAttribute))
	permissionLogger.Info("checking permission")

	if c.ReadonlyForAll && permissionType == Read {
		return true, nil
	}

	if c.Token == token {
		l.Info("superuser token approved, granting permission")
		return true, nil
	}

	userID, err := db.GetUserByName(ctx, userInfo.Username)

	// create user  (if not found)
	if errors.Is(err, pgx.ErrNoRows) {
		newUserID, err2 := db.InsertUser(ctx, userInfo.Username)
		if err2 == nil {
			userID = newUserID
			if errG := db.AddUserToGlobalReaderGroup(ctx, newUserID); errG != nil {
				l.Error("failed to add user to global reader group", errG)
			}
		} else {
			permissionLogger.Info("failed to create new user")
			return false, errors.Wrap(err, "failed to create user")
		}
	} else if err != nil {
		permissionLogger.Info("failed to get user id")
		return false, errors.Wrap(err, "failed to get user id")
	}

	check := func(objectType ObjectType, objectAttribute ObjectAttribute, objectID int32) (bool, error) {
		hasRight, err := db.CheckUserHasRight(ctx, core.CheckUserHasRightParams{
			UserID:          userID,
			ObjectID:        objectID,
			ObjectType:      string(objectType),
			ObjectAttribute: string(objectAttribute),
			Action:          string(permissionType),
		})

		return hasRight > 0, errors.Wrap(err, fmt.Sprintf("failed to check user has right for object type %s, object attribute %s, object id %d", objectType, objectAttribute, objectID))
	}

	checkNamespace := func(objectAttribute ObjectAttribute, objectID int32) (bool, error) {
		found, err := check(Namespace, objectAttribute, objectID)
		if err != nil {
			return false, err
		}

		if found {
			return true, nil
		}

		return check(Root, NamespaceAttribute, 0)
	}

	checkProject := func(objectAttribute ObjectAttribute, objectID int32) (bool, error) {
		found, err := check(Project, objectAttribute, objectID)
		if err != nil {
			return false, err
		}

		if found {
			return true, nil
		}

		ns, err := db.GetProjectNamespace(ctx, objectID)
		if err != nil {
			return false, errors.Wrap(err, fmt.Sprintf("failed to get project namespace for project id %d", objectID))
		}

		return checkNamespace(ProjectAttribute, ns.ID)
	}

	switch objectType {
	case Root:
		return check(Root, objectAttribute, 0)
	case Namespace:
		return checkNamespace(objectAttribute, objectID)
	case Project:
		return checkProject(objectAttribute, objectID)
	case Experiment:
		found, err := check(Experiment, objectAttribute, objectID)
		if err != nil {
			return false, err
		}

		if found {
			return true, nil
		}

		pr, err := db.GetExperimentProject(ctx, objectID)
		if err != nil {
			return false, errors.Wrap(err, fmt.Sprintf("failed to get experiment project for experiment id %d", objectID))
		}

		return checkProject(ExperimentAttribute, pr)
	case Dataset:
		found, err := check(Dataset, objectAttribute, objectID)
		if err != nil {
			return false, err
		}

		if found {
			return true, nil
		}

		pj, err := db.GetDatasetProject(ctx, objectID)
		if err != nil {
			return false, errors.Wrap(err, fmt.Sprintf("failed to get dataset project for dataset id %d", objectID))
		}
		return checkProject(DatasetAttribute, pj.ID)
	case Cube:
		return check(Cube, CubeAttribute, objectID)
	}

	return false, fmt.Errorf("unknown object type %s", objectType)
}

func GetGlobalRights(
	ctx context.Context,
	c *PermissionCheckConfig,
	l *logger.Logger,
	db db.DB,
	token string,
	userInfo *user.UserInfo,
) ([]Right, error) {
	canCreateNamespace, err := CheckPermission(ctx, c, l, db, token, Root, NamespaceAttribute, Create, userInfo, 0)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	rights := []Right{}
	if canCreateNamespace {
		rights = append(rights, RightCreateNamespace)
	}

	return rights, nil
}

func GetNamespaceRights(
	ctx context.Context,
	c *PermissionCheckConfig,
	l *logger.Logger,
	db db.DB,
	token string,
	userInfo *user.UserInfo,
	namespaceID int32,
) ([]Right, error) {
	canEditMeta, err := CheckPermission(ctx, c, l, db, token, Namespace, MetaAttribute, Edit, userInfo, namespaceID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	rights := []Right{}
	if canEditMeta {
		rights = append(rights, RightEditConfig, RightEditName)
	}

	canCreateProject, err := CheckPermission(ctx, c, l, db, token, Namespace, ProjectAttribute, Create, userInfo, namespaceID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	if canCreateProject {
		rights = append(rights, RightCreateProject)
	}

	canDeleteNamespace, err := CheckPermission(ctx, c, l, db, token, Namespace, NoAttribute, Delete, userInfo, namespaceID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	if canDeleteNamespace {
		rights = append(rights, RightDeleteNamespace)
	}

	return rights, nil
}

func GetProjectRights(
	ctx context.Context,
	c *PermissionCheckConfig,
	l *logger.Logger,
	db db.DB,
	token string,
	userInfo *user.UserInfo,
	projectID int32,
) ([]Right, error) {
	canEditMeta, err := CheckPermission(ctx, c, l, db, token, Project, MetaAttribute, Edit, userInfo, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	rights := []Right{}
	if canEditMeta {
		rights = append(rights, RightEditConfig, RightEditName)
	}

	canCreateExperiment, err := CheckPermission(ctx, c, l, db, token, Project, ExperimentAttribute, Create, userInfo, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	if canCreateExperiment {
		rights = append(rights, RightCreateExperiment)
	}

	canCreateDataset, err := CheckPermission(ctx, c, l, db, token, Project, DatasetAttribute, Create, userInfo, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	if canCreateDataset {
		rights = append(rights, RightCreateDataset)
	}

	canDeleteProject, err := CheckPermission(ctx, c, l, db, token, Project, NoAttribute, Delete, userInfo, projectID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	if canDeleteProject {
		rights = append(rights, RightDeleteProject)
	}

	return rights, nil
}

func GetDatasetRights(
	ctx context.Context,
	c *PermissionCheckConfig,
	l *logger.Logger,
	db db.DB,
	token string,
	userInfo *user.UserInfo,
	datasetID int32,
) ([]Right, error) {
	canEditMeta, err := CheckPermission(ctx, c, l, db, token, Dataset, MetaAttribute, Edit, userInfo, datasetID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	rights := []Right{}
	if canEditMeta {
		rights = append(rights, RightEditConfig, RightEditSchema, RightEditName)
	}

	canDeleteDataset, err := CheckPermission(ctx, c, l, db, token, Dataset, NoAttribute, Delete, userInfo, datasetID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	if canDeleteDataset {
		rights = append(rights, RightDeleteDataset)
	}

	return rights, nil
}

func GetExperimentRights(
	ctx context.Context,
	c *PermissionCheckConfig,
	l *logger.Logger,
	db db.DB,
	token string,
	userInfo *user.UserInfo,
	experimentID int32,
) ([]Right, error) {
	canEditMeta, err := CheckPermission(ctx, c, l, db, token, Experiment, MetaAttribute, Edit, userInfo, experimentID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	rights := []Right{}
	if canEditMeta {
		rights = append(rights, RightEditConfig, RightEditName)
	}

	canEditState, err := CheckPermission(ctx, c, l, db, token, Experiment, ExperimentStateAttribute, Edit, userInfo, experimentID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	if canEditState {
		rights = append(rights, RightStartExperiment, RightStopExperiment, RightApplyExperiment)
	}

	canDeleteExperiment, err := CheckPermission(ctx, c, l, db, token, Experiment, NoAttribute, Delete, userInfo, experimentID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}

	if canDeleteExperiment {
		rights = append(rights, RightDeleteExperiment)
	}

	canCreateDataset, err := CheckPermission(ctx, c, l, db, token, Experiment, DatasetAttribute, Create, userInfo, experimentID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to check permission to create dataset")
	}

	if canCreateDataset {
		rights = append(rights, RightCreateDataset)
	}

	canDeleteDataset, err := CheckPermission(ctx, c, l, db, token, Experiment, DatasetAttribute, Delete, userInfo, experimentID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to check permission to delete dataset")
	}

	if canDeleteDataset {
		rights = append(rights, RightDeleteDataset)
	}

	canCreateVariable, err := CheckPermission(ctx, c, l, db, token, Experiment, MetaAttribute, Edit, userInfo, experimentID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to check permission to create variable")
	}

	if canCreateVariable {
		rights = append(rights, RightCreateVariable)
	}

	canEditVariable, err := CheckPermission(ctx, c, l, db, token, Experiment, MetaAttribute, Edit, userInfo, experimentID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to check permission to edit variable")
	}

	if canEditVariable {
		rights = append(rights, RightEditVariable)
	}

	canDeleteVariable, err := CheckPermission(ctx, c, l, db, token, Experiment, MetaAttribute, Delete, userInfo, experimentID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to check permission to delete variable")
	}

	if canDeleteVariable {
		rights = append(rights, RightDeleteVariable)
	}

	return rights, nil
}
