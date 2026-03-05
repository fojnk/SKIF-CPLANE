package acl

import (
	"context"
	"fmt"
	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
)

func addRights(rights map[int32]RightOutput, userRights map[int32]UserInfo, rightsToAdd ...Right) {
	for user, info := range rights {
		if info.Count > 0 {
			if _, ok := userRights[user]; !ok {
				userRights[user] = UserInfo{
					Username: info.Username,
					Rights:   make([]Right, 0),
				}
			}

			userRights[user] = UserInfo{Rights: append(userRights[user].Rights, rightsToAdd...),
				Username: info.Username}
		}
	}
}

type UserInfo struct {
	Username string
	Rights   []Right
}

type RightOutput struct {
	Count    int64
	Username string
}

func GetExperimentUsersRights(
	ctx context.Context,
	l *logger.Logger,
	search string,
	db db.DB,
	experimentID int32,
) (map[int32]UserInfo, error) {
	userRights := make(map[int32]UserInfo)

	usersCanEditMeta, err := CheckPermissionForUsers(ctx, l, search, db, Experiment, MetaAttribute, Edit, experimentID)
	if err != nil {
		l.Error("failed to get rights", err)
	}
	addRights(usersCanEditMeta, userRights, RightEditConfig, RightEditName, RightEditVariable)

	usersCanEditState, err := CheckPermissionForUsers(ctx, l, search, db, Experiment, ExperimentStateAttribute, Edit, experimentID)
	if err != nil {
		l.Error("failed to get rights", err)
	}
	addRights(usersCanEditState, userRights, RightStartExperiment, RightStopExperiment, RightApplyExperiment)

	usersCanDeleteExperiment, err := CheckPermissionForUsers(ctx, l, search, db, Experiment, NoAttribute, Delete, experimentID)
	if err != nil {
		l.Error("failed to get rights", err)
	}
	addRights(usersCanDeleteExperiment, userRights, RightDeleteExperiment)

	usersCanCreateDataset, err := CheckPermissionForUsers(ctx, l, search, db, Experiment, DatasetAttribute, Create, experimentID)
	if err != nil {
		l.Error("failed to check permission to create dataset", err)
	}
	addRights(usersCanCreateDataset, userRights, RightCreateDataset)

	usersCanDeleteDataset, err := CheckPermissionForUsers(ctx, l, search, db, Experiment, DatasetAttribute, Delete, experimentID)
	if err != nil {
		l.Error("failed to check permission to delete dataset", err)
	}
	addRights(usersCanDeleteDataset, userRights, RightDeleteDataset)

	usersCanCreateVariable, err := CheckPermissionForUsers(ctx, l, search, db, Experiment, MetaAttribute, Create, experimentID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to check permission to create variable")
	}
	addRights(usersCanCreateVariable, userRights, RightCreateVariable)

	usersCanDeleteVariable, err := CheckPermissionForUsers(ctx, l, search, db, Experiment, MetaAttribute, Delete, experimentID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to check permission to delete variable")
	}
	addRights(usersCanDeleteVariable, userRights, RightDeleteVariable)

	return userRights, nil
}

func GetDatasetUsersRights(
	ctx context.Context,
	l *logger.Logger,
	search string,
	db db.DB,
	datasetID int32,
) (map[int32]UserInfo, error) {
	usersRights := make(map[int32]UserInfo)

	usersCanEditMeta, err := CheckPermissionForUsers(ctx, l, search, db, Dataset, MetaAttribute, Edit, datasetID)
	if err != nil {
		l.Error("failed to get rights", err)
	}
	addRights(usersCanEditMeta, usersRights, RightEditConfig, RightEditSchema, RightEditName)

	usersCanDeleteDataset, err := CheckPermissionForUsers(ctx, l, search, db, Dataset, NoAttribute, Delete, datasetID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to check permission to delete variable")
	}
	addRights(usersCanDeleteDataset, usersRights, RightDeleteDataset)

	return usersRights, nil
}

func GetProjectUsersRights(
	ctx context.Context,
	l *logger.Logger,
	search string,
	db db.DB,
	projectID int32,
) (map[int32]UserInfo, error) {
	usersRights := make(map[int32]UserInfo)

	usersCanEditMeta, err := CheckPermissionForUsers(ctx, l, search, db, Project, MetaAttribute, Edit, projectID)
	if err != nil {
		l.Error("failed to get rights", err)
	}
	addRights(usersCanEditMeta, usersRights, RightEditConfig, RightEditName)

	usersCanCreateExperiment, err := CheckPermissionForUsers(ctx, l, search, db, Project, ExperimentAttribute, Create, projectID)
	if err != nil {
		l.Error("failed to get rights", err)
	}
	addRights(usersCanCreateExperiment, usersRights, RightCreateExperiment)

	usersCanCreateDataset, err := CheckPermissionForUsers(ctx, l, search, db, Project, DatasetAttribute, Create, projectID)
	if err != nil {
		l.Error("failed to get rights", err)
	}
	addRights(usersCanCreateDataset, usersRights, RightCreateDataset)

	usersCanDeleteProject, err := CheckPermissionForUsers(ctx, l, search, db, Project, NoAttribute, Delete, projectID)
	if err != nil {
		l.Error("failed to get rights", err)
	}
	addRights(usersCanDeleteProject, usersRights, RightDeleteProject)

	return usersRights, nil
}

func GetNamespaceUserRights(
	ctx context.Context,
	l *logger.Logger,
	search string,
	db db.DB,
	namespaceID int32,
) (map[int32]UserInfo, error) {
	usersRights := make(map[int32]UserInfo)

	userCanEditMeta, err := CheckPermissionForUsers(ctx, l, search, db, Namespace, MetaAttribute, Edit, namespaceID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}
	addRights(userCanEditMeta, usersRights, RightEditConfig, RightEditName)

	userCanCreateProject, err := CheckPermissionForUsers(ctx, l, search, db, Namespace, ProjectAttribute, Create, namespaceID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}
	addRights(userCanCreateProject, usersRights, RightCreateProject)

	userCanDeleteNamespace, err := CheckPermissionForUsers(ctx, l, search, db, Namespace, NoAttribute, Delete, namespaceID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get rights")
	}
	addRights(userCanDeleteNamespace, usersRights, RightDeleteNamespace)

	return usersRights, nil
}

func CheckPermissionForUsers(
	ctx context.Context,
	l *logger.Logger,
	search string,
	db db.DB,
	objectType ObjectType,
	objectAttribute ObjectAttribute,
	permissionType Action,
	objectID int32,
) (map[int32]RightOutput, error) {

	check := func(objectType ObjectType, objectAttribute ObjectAttribute, objectID int32) (map[int32]RightOutput, error) {
		listing, err := db.GetUsersThatHasRights(ctx, core.GetUsersThatHasRightsParams{
			ObjectID:        objectID,
			ObjectType:      string(objectType),
			ObjectAttribute: string(objectAttribute),
			Action:          string(permissionType),
			Search:          search,
		})

		users := make(map[int32]RightOutput, len(listing))

		for _, userInfo := range listing {
			users[userInfo.UserID] = RightOutput{
				Username: userInfo.Name.String,
				Count:    userInfo.UniqueActionCount,
			}
		}

		return users, err
	}

	checkNamespace := func(objectAttribute ObjectAttribute, objectID int32) (map[int32]RightOutput, error) {
		users, err := check(Namespace, objectAttribute, objectID)
		if err != nil {
			return nil, err
		}

		nsListing, err := check(Root, NamespaceAttribute, 0)
		if err != nil {
			return nil, err
		}
		for userID, info := range nsListing {
			_, ok := users[userID]
			if !ok {
				users[userID] = RightOutput{Count: 0, Username: info.Username}
			}
			users[userID] = RightOutput{Count: users[userID].Count + info.Count, Username: info.Username}
		}

		return users, nil
	}

	checkProject := func(objectAttribute ObjectAttribute, objectID int32) (map[int32]RightOutput, error) {
		users, err := check(Project, objectAttribute, objectID)
		if err != nil {
			return nil, err
		}

		ns, err := db.GetProjectNamespace(ctx, objectID)
		if err != nil {
			return nil, errors.Wrap(err, fmt.Sprintf("failed to get project namespace for project id %d", objectID))
		}

		newUsers, err := checkNamespace(ProjectAttribute, ns.ID)
		if err != nil {
			return nil, err
		}

		for userID, info := range newUsers {
			_, ok := users[userID]
			if !ok {
				users[userID] = RightOutput{Count: 0, Username: info.Username}
			}
			users[userID] = RightOutput{Count: users[userID].Count + info.Count, Username: info.Username}
		}

		return users, nil
	}

	switch objectType {
	case Root:
		return check(Root, objectAttribute, 0)
	case Namespace:
		return checkNamespace(objectAttribute, objectID)
	case Project:
		return checkProject(objectAttribute, objectID)
	case Experiment:
		users, err := check(Experiment, objectAttribute, objectID)
		if err != nil {
			return nil, err
		}

		pr, err := db.GetExperimentProject(ctx, objectID)
		if err != nil {
			return nil, errors.Wrap(err, fmt.Sprintf("failed to get experiment project for experiment id %d", objectID))
		}

		newUsers, err := checkProject(ExperimentAttribute, pr)
		if err != nil {
			return nil, err
		}

		for userID, info := range newUsers {
			_, ok := users[userID]
			if !ok {
				users[userID] = RightOutput{Count: 0, Username: info.Username}
			}
			users[userID] = RightOutput{Count: users[userID].Count + info.Count, Username: info.Username}
		}

		return users, nil
	case Dataset:
		users, err := check(Dataset, objectAttribute, objectID)
		if err != nil {
			return nil, err
		}

		pr, err := db.GetDatasetProject(ctx, objectID)
		if err != nil {
			return nil, errors.Wrap(err, fmt.Sprintf("failed to get dataset project for dataset id %d", objectID))
		}

		newUsers, err := checkProject(DatasetAttribute, pr.ID)
		if err != nil {
			return nil, err
		}

		for userID, info := range newUsers {
			_, ok := users[userID]
			if !ok {
				users[userID] = RightOutput{Count: 0, Username: info.Username}
			}
			users[userID] = RightOutput{Count: users[userID].Count + info.Count, Username: info.Username}
		}

		return users, nil
	case Cube:
		return check(Cube, CubeAttribute, objectID)
	}

	return nil, fmt.Errorf("unknown object type %s", objectType)
}
