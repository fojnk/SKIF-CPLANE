package owner_roles

import (
	"context"
	"fmt"
	"strconv"

	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
)

// CreateProjectOwnerRole creates the project owner role, rules and ACL bindings in cplane only.
func CreateProjectOwnerRole(ctx context.Context, repo *repository.Repository, l *logger.Logger, projectID int32, u *user.UserInfo) error {
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

	role, err := repo.DB.InsertRole(ctx, dbcore.InsertRoleParams{
		Name: fmt.Sprintf("StreamFlow: роль owner в проекте \"%s\" в \"%s\" (#%d)",
			project.Name, project.NamespaceName, projectID),
		Description: fmt.Sprintf("StreamFlow: роль owner в проекте \"%s\" в \"%s\" (#%d)",
			project.Name, project.NamespaceName, projectID),
		IdmID: "project_owner__" + strconv.Itoa(int(projectID)),
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

	err = repo.DB.GrantUserRole(ctx, dbcore.GrantUserRoleParams{
		UserID: pgtype.Int4{Int32: userInfo.ID, Valid: true},
		RoleID: pgtype.Int4{Int32: role.ID, Valid: true},
	})
	if err != nil {
		l.Error("failed to grant project owner role to user", err)
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

	return nil
}

// CreateNamespaceOwnerRole creates the namespace owner role, rules and ACL bindings in cplane only.
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

	role, err := repo.DB.InsertRole(ctx, dbcore.InsertRoleParams{
		IdmID: "namespace_owner__" + strconv.Itoa(int(namespaceID)),
		Name: fmt.Sprintf("StreamFlow: роль owner в неймспейсе \"%s\" (#%d)",
			namespace.Name, namespace.ID),
		Description: fmt.Sprintf("StreamFlow: роль owner в неймспейсе \"%s\" (#%d)",
			namespace.Name, namespace.ID),
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

	err = repo.DB.GrantUserRole(ctx, dbcore.GrantUserRoleParams{
		UserID: pgtype.Int4{Int32: userInfo.ID, Valid: true},
		RoleID: pgtype.Int4{Int32: role.ID, Valid: true},
	})
	if err != nil {
		l.Error("failed to grant namespace owner role to user", err)
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

	return nil
}
