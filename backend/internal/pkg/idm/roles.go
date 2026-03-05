package idm_roles

import (
	"context"
	"fmt"
	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	"path/filepath"
	"strconv"
)

var workflowProjectOwner clients.Workflow = []clients.WorkflowStep{
	{Name: "system", Order: 1, Status: false},
	{Name: "security", Order: 2, Status: false},
	{Name: "resource", Order: 3, Status: true},
}

var workflowNamespaceOwner clients.Workflow = []clients.WorkflowStep{
	{Name: "system", Order: 1, Status: false},
	{Name: "security", Order: 2, Status: false},
	{Name: "resource", Order: 3, Status: true},
}

func CreateProjectOwnerRole(ctx context.Context, repo *repository.Repository, l *logger.Logger, projectID int32, _ int, u *user.UserInfo) error {
	userInfo, err := repo.DB.GetUserInfoByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user", err)
		return err
	}

	project, err := repo.DB.SelectProject(ctx, dbcore.SelectProjectParams{
		ID:     projectID,
		UserID: userInfo.ID,
	})
	if err != nil {
		l.Error("failed to select project", err)
		return err
	}

	fullPath := filepath.Join("StreamFlow", "Неймспейс: "+project.NamespaceName, "Проект: "+project.Name)

	role, err := repo.DB.InsertRole(ctx, dbcore.InsertRoleParams{
		Name:        fmt.Sprintf("StreamFlow: роль owner в проекте \"%s\" в \"%s\"", project.Name, project.NamespaceName),
		Description: fmt.Sprintf("StreamFlow: роль owner в проекте \"%s\" в \"%s\"", project.Name, project.NamespaceName),
		IdmID:       "project_owner__" + strconv.Itoa(int(projectID)),
	})
	if err != nil {
		l.Error("failed to insert role for project owner", err)
		return err
	}

	rule, err := repo.DB.InsertRule(ctx, dbcore.InsertRuleParams{
		ObjectType:      "project",
		ObjectID:        project.ID,
		ObjectAttribute: ".*",
		Action:          string(acl.Delete),
	})
	if err != nil {
		l.Error("failed to insert rule for project owner", err)
		return err
	}

	err = repo.DB.AddRuleToRole(ctx, dbcore.AddRuleToRoleParams{
		RuleID: rule,
		RoleID: role.ID,
	})
	if err != nil {
		l.Error("failed to insert rule for project owner", err)
		return err
	}

	_, err = repo.DB.InsertRoleOwner(ctx, dbcore.InsertRoleOwnerParams{
		RoleID: role.ID,
		UserID: userInfo.ID,
	})
	if err != nil {
		l.Error("failed to insert owner", err)
		return err
	}

	_, err = repo.DB.InsertRoleObjectMatch(ctx, dbcore.InsertRoleObjectMatchParams{
		RoleID:     role.ID,
		ObjectType: "project",
		ObjectID:   projectID,
		RoleType:   "owner",
	})
	if err != nil {
		l.Error("failed to insert object match", err)
		return err
	}

	roleIdm := clients.Role{
		ID:          role.IdmID,
		Name:        role.Name,
		Description: role.Description,
		Owners:      []string{userInfo.Name},
		Params: clients.Params{
			FullPath: fullPath,
			Workflow: workflowProjectOwner,
		},
	}

	err = repo.Clients.IDM.PushRoles([]clients.Role{
		roleIdm,
	})
	if err != nil {
		l.Error("failed to push roles to idm", err)
		return err
	}

	return nil
}

func SyncProjectOwnerRole(ctx context.Context, repo *repository.Repository, l *logger.Logger, projectID int32, u *user.UserInfo) error {
	userInfo, err := repo.DB.GetUserInfoByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user", err)
		return errors.Wrap(err, "failed to get user: ")
	}

	project, err := repo.DB.SelectProjectWithDeleted(ctx, dbcore.SelectProjectWithDeletedParams{
		ID:     projectID,
		UserID: userInfo.ID,
	})
	if err != nil {
		l.Error("failed to select project", err)
		return errors.Wrap(err, "failed to select project: ")
	}

	role, err := repo.DB.GetRolesByObjectAndType(ctx, dbcore.GetRolesByObjectAndTypeParams{
		ObjectType: "project",
		ObjectID:   project.ID,
		RoleType:   "owner",
	})
	if err != nil {
		l.Error("failed to select roles for project owner", err)
		return errors.Wrap(err, "failed to select roles for project owner: ")
	}

	fullPath := filepath.Join("StreamFlow", "Неймспейс: "+project.NamespaceName, "Проект: "+project.Name)

	updatedRole, err := repo.DB.UpdateRoleForIdm(ctx, dbcore.UpdateRoleForIdmParams{
		ID:          role.RoleID,
		Name:        fmt.Sprintf("StreamFlow: роль owner в проекте \"%s\" в \"%s\"", project.Name, project.NamespaceName),
		Description: fmt.Sprintf("StreamFlow: роль owner в проекте \"%s\" в \"%s\"", project.Name, project.NamespaceName),
	})
	if err != nil {
		l.Error("failed to update role for project owner", err)
		return errors.Wrap(err, "failed to update role for project owner: ")
	}

	markedForDeletion := 0
	if project.Deleted {
		markedForDeletion = 2
	}

	roleIdm := clients.Role{
		ID:          updatedRole.IdmID,
		Name:        updatedRole.Name,
		Description: updatedRole.Description,
		Owners:      []string{userInfo.Name},
		Params: clients.Params{
			FullPath: fullPath,
			Workflow: workflowProjectOwner,
		},
		MarkedForDeletion: int32(markedForDeletion),
	}

	err = repo.Clients.IDM.PushRoles([]clients.Role{
		roleIdm,
	})
	if err != nil {
		l.Error("failed to push roles to idm", err)
		l.Info(fmt.Sprintf("failed to push roles to idm: %v", roleIdm))
		return errors.Wrap(err, "failed to push roles to idm: ")
	}

	return nil
}

func CreateNamespaceOwnerRole(ctx context.Context, repo *repository.Repository, l *logger.Logger, namespaceID int32, u *user.UserInfo) error {
	userInfo, err := repo.DB.GetUserInfoByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user", err)
		return err
	}

	namespace, err := repo.DB.SelectNamespace(ctx, namespaceID)
	if err != nil {
		l.Error("failed to select namespace", err)
		return err
	}

	fullPath := filepath.Join("StreamFlow", "Неймспейс: "+namespace.Name)

	role, err := repo.DB.InsertRole(ctx, dbcore.InsertRoleParams{
		IdmID:       "namespace_owner__" + strconv.Itoa(int(namespaceID)),
		Name:        fmt.Sprintf("StreamFlow: роль owner в неймспейсе \"%s\"", namespace.Name),
		Description: fmt.Sprintf("StreamFlow: роль owner в неймспейсе \"%s\"", namespace.Name),
	})
	if err != nil {
		l.Error("failed to insert role for namespace owner", err)
		return err
	}

	rule, err := repo.DB.InsertRule(ctx, dbcore.InsertRuleParams{
		ObjectType:      "namespace",
		ObjectID:        namespace.ID,
		ObjectAttribute: "project|dataset",
		Action:          string(acl.Delete),
	})
	if err != nil {
		l.Error("failed to insert rule for project owner", err)
		return err
	}

	err = repo.DB.AddRuleToRole(ctx, dbcore.AddRuleToRoleParams{
		RuleID: rule,
		RoleID: role.ID,
	})
	if err != nil {
		l.Error("failed to insert rule for project owner", err)
		return err
	}

	_, err = repo.DB.InsertRoleOwner(ctx, dbcore.InsertRoleOwnerParams{
		RoleID: role.ID,
		UserID: userInfo.ID,
	})
	if err != nil {
		l.Error("failed to insert owner", err)
		return err
	}

	_, err = repo.DB.InsertRoleObjectMatch(ctx, dbcore.InsertRoleObjectMatchParams{
		RoleID:     role.ID,
		ObjectType: "namespace",
		ObjectID:   namespace.ID,
		RoleType:   "owner",
	})
	if err != nil {
		l.Error("failed to insert object match", err)
		return err
	}

	err = repo.Clients.IDM.PushRoles([]clients.Role{
		{
			ID:          role.IdmID,
			Name:        role.Name,
			Description: role.Description,
			Owners:      []string{userInfo.Name},
			Params: clients.Params{
				FullPath: fullPath,
				Workflow: workflowNamespaceOwner,
			},
		},
	})
	if err != nil {
		l.Error("failed to push roles to idm", err)
		return err
	}

	return nil
}

func SyncNamespaceOwnerRole(ctx context.Context, repo *repository.Repository, l *logger.Logger, namespaceID int32, u *user.UserInfo) error {
	userInfo, err := repo.DB.GetUserInfoByName(ctx, u.Username)
	if err != nil {
		l.Error("failed to get user", err)
		return errors.Wrap(err, "failed to get user")
	}

	namespace, err := repo.DB.SelectNamespaceWithDeleted(ctx, namespaceID)
	if err != nil {
		l.Error("failed to select namespace", err)
		return errors.Wrap(err, "failed to select namespace")
	}

	role, err := repo.DB.GetRolesByObjectAndType(ctx, dbcore.GetRolesByObjectAndTypeParams{
		ObjectType: "namespace",
		ObjectID:   namespace.ID,
		RoleType:   "owner",
	})
	if err != nil {
		l.Error("failed to select roles for namespace owner", err)
		return errors.Wrap(err, "failed to select roles for namespace owner")
	}

	fullPath := filepath.Join("StreamFlow", "Неймспейс: "+namespace.Name)

	updatedRole, err := repo.DB.UpdateRoleForIdm(ctx, dbcore.UpdateRoleForIdmParams{
		ID:          role.RoleID,
		Name:        fmt.Sprintf("StreamFlow: роль owner в неймспейсе \"%s\"", namespace.Name),
		Description: fmt.Sprintf("StreamFlow: роль owner в неймспейсе \"%s\"", namespace.Name),
	})
	if err != nil {
		l.Error("failed to update role for namespace owner", err)
		return errors.Wrap(err, "failed to update role for namespace owner")
	}

	markedForDeletion := 0
	if namespace.Deleted {
		markedForDeletion = 2
	}

	roleIdm := clients.Role{
		ID:          updatedRole.IdmID,
		Name:        updatedRole.Name,
		Description: updatedRole.Description,
		Owners:      []string{userInfo.Name},
		Params: clients.Params{
			FullPath: fullPath,
			Workflow: workflowProjectOwner,
		},
		MarkedForDeletion: int32(markedForDeletion),
	}

	err = repo.Clients.IDM.PushRoles([]clients.Role{
		roleIdm,
	})
	if err != nil {
		l.Error("failed to push roles to idm", err)
		l.Info(fmt.Sprintf("failed to push roles to idm: %v", roleIdm))
		return errors.Wrap(err, "failed to push roles to idm")
	}

	projects, err := repo.DB.SelectProjectsWithDeleted(ctx, namespaceID)
	if err != nil {
		l.Error("failed to select projects", err)
		return errors.Wrap(err, "failed to select projects")
	}

	for _, project := range projects {
		err := SyncProjectOwnerRole(ctx, repo, l, project.ID, u)
		if err != nil {
			l.Error("failed to sync project owner", err)
		}
	}

	return nil
}
