package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
	"sort"
)

type ACLService struct {
	repo *repository.Repository
}

func NewACLService(repo *repository.Repository) *ACLService {
	return &ACLService{repo: repo}
}

// CheckPermission проверяет наличие разрешения у пользователя
func (s *ACLService) CheckPermission(ctx context.Context, token string, objectType acl.ObjectType, objectAttribute acl.ObjectAttribute, action acl.Action, userInfo *user.UserInfo, objectID int32) (bool, error) {
	return acl.CheckPermission(ctx, &s.repo.Config.ACL, s.repo.Logger, s.repo.DB, token, objectType, objectAttribute, action, userInfo, objectID)
}

// GetObjectRights возвращает права пользователя на объект
func (s *ACLService) GetObjectRights(ctx context.Context, objectType string, objectID int32, username string) ([]acl.Right, error) {
	var rights []acl.Right
	var err error

	// Создаем минимальный UserInfo для проверки прав
	userInfo := &user.UserInfo{
		Username: username,
	}

	switch objectType {
	case "experiment":
		rights, err = acl.GetExperimentRights(ctx, &s.repo.Config.ACL, s.repo.Logger, s.repo.DB, "", userInfo, objectID)
	case "dataset":
		rights, err = acl.GetDatasetRights(ctx, &s.repo.Config.ACL, s.repo.Logger, s.repo.DB, "", userInfo, objectID)
	case "project":
		rights, err = acl.GetProjectRights(ctx, &s.repo.Config.ACL, s.repo.Logger, s.repo.DB, "", userInfo, objectID)
	case "namespace":
		rights, err = acl.GetNamespaceRights(ctx, &s.repo.Config.ACL, s.repo.Logger, s.repo.DB, "", userInfo, objectID)
	default:
		rights = make([]acl.Right, 0)
	}

	if err != nil {
		s.repo.Logger.Error("failed to get object rights", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить права на объект", err)
	}

	return rights, nil
}

// GetUsersPermissions возвращает список пользователей и их прав на объект
func (s *ACLService) GetUsersPermissions(ctx context.Context, objectType string, objectID int32, search string, limit, offset int32) ([]dto.UserRights, int64, error) {
	var rights map[int32]acl.UserInfo
	var err error

	switch objectType {
	case "experiment":
		rights, err = acl.GetExperimentUsersRights(ctx, s.repo.Logger, search, s.repo.DB, objectID)
	case "dataset":
		rights, err = acl.GetDatasetUsersRights(ctx, s.repo.Logger, search, s.repo.DB, objectID)
	case "project":
		rights, err = acl.GetProjectUsersRights(ctx, s.repo.Logger, search, s.repo.DB, objectID)
	case "namespace":
		rights, err = acl.GetNamespaceUserRights(ctx, s.repo.Logger, search, s.repo.DB, objectID)
	default:
		rights = make(map[int32]acl.UserInfo)
	}

	if err != nil {
		s.repo.Logger.Error("failed to get users permissions", err)
		return nil, 0, serviceerrors.NewInternalError("Не удалось получить права пользователей", err)
	}

	userRights := make([]dto.UserRights, 0, len(rights))
	for id, right := range rights {
		userRights = append(userRights, dto.UserRights{
			ID:     id,
			Name:   right.Username,
			Rights: right.Rights,
		})
	}

	// Сортируем по имени
	sort.Slice(userRights, func(i, j int) bool {
		return userRights[i].Name < userRights[j].Name
	})

	total := int64(len(userRights))

	// Применяем пагинацию
	start := int(offset)
	end := start + int(limit)

	if start < 0 {
		start = 0
	}
	if start > len(userRights) {
		start = len(userRights)
	}
	if end > len(userRights) {
		end = len(userRights)
	}

	return userRights[start:end], total, nil
}

// CheckUserPermissions проверяет разрешения пользователя
func (s *ACLService) CheckUserPermissions(ctx context.Context, userID int32, objectType, objectAttribute string, objectID int32) ([]dto.Permission, error) {
	permissions, err := s.repo.DB.SelectUserGrants(ctx, dbcore.SelectUserGrantsParams{
		UserID:          userID,
		ObjectType:      objectType,
		ObjectAttribute: objectAttribute,
		ObjectID:        objectID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to select user grants", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить разрешения пользователя", err)
	}

	result := make([]dto.Permission, len(permissions))
	for i, p := range permissions {
		result[i] = dto.Permission{
			ObjectType:      p.ObjectType,
			ObjectAttribute: p.ObjectAttribute,
			ObjectID:        p.ObjectID,
			Action:          p.Action,
		}
	}

	return result, nil
}

// Grant выдает права (роль или правило) пользователю или группе
func (s *ACLService) Grant(ctx context.Context, userID, userGroupID, roleID, ruleID *int32) error {
	var err error

	if userID != nil && ruleID != nil {
		err = s.repo.DB.GrantUserRule(ctx, dbcore.GrantUserRuleParams{
			UserID: pgtype.Int4{Int32: *userID, Valid: true},
			RuleID: pgtype.Int4{Int32: *ruleID, Valid: true},
		})
		if err != nil {
			s.repo.Logger.Error("failed to grant user rule", err)
			return serviceerrors.NewInternalError("Не удалось выдать правило пользователю", err)
		}
	}

	if userID != nil && roleID != nil {
		err = s.repo.DB.GrantUserRole(ctx, dbcore.GrantUserRoleParams{
			UserID: pgtype.Int4{Int32: *userID, Valid: true},
			RoleID: pgtype.Int4{Int32: *roleID, Valid: true},
		})
		if err != nil {
			s.repo.Logger.Error("failed to grant user role", err)
			return serviceerrors.NewInternalError("Не удалось выдать роль пользователю", err)
		}
	}

	if userGroupID != nil && roleID != nil {
		err = s.repo.DB.GrantUserGroupRole(ctx, dbcore.GrantUserGroupRoleParams{
			UserGroupID: pgtype.Int4{Int32: *userGroupID, Valid: true},
			RoleID:      pgtype.Int4{Int32: *roleID, Valid: true},
		})
		if err != nil {
			s.repo.Logger.Error("failed to grant user group role", err)
			return serviceerrors.NewInternalError("Не удалось выдать роль группе пользователей", err)
		}
	}

	if userGroupID != nil && ruleID != nil {
		err = s.repo.DB.GrantUserGroupRule(ctx, dbcore.GrantUserGroupRuleParams{
			UserGroupID: pgtype.Int4{Int32: *userGroupID, Valid: true},
			RuleID:      pgtype.Int4{Int32: *ruleID, Valid: true},
		})
		if err != nil {
			s.repo.Logger.Error("failed to grant user group rule", err)
			return serviceerrors.NewInternalError("Не удалось выдать правило группе пользователей", err)
		}
	}

	return nil
}

// Disclaim отбирает права (роль или правило) у пользователя или группы
func (s *ACLService) Disclaim(ctx context.Context, userID, userGroupID, roleID, ruleID *int32) error {
	var err error

	if userID != nil && ruleID != nil {
		err = s.repo.DB.DisclaimUserRule(ctx, dbcore.DisclaimUserRuleParams{
			UserID: pgtype.Int4{Int32: *userID, Valid: true},
			RuleID: pgtype.Int4{Int32: *ruleID, Valid: true},
		})
		if err != nil {
			s.repo.Logger.Error("failed to disclaim user rule", err)
			return serviceerrors.NewInternalError("Не удалось отобрать правило у пользователя", err)
		}
	}

	if userID != nil && roleID != nil {
		err = s.repo.DB.DisclaimUserRole(ctx, dbcore.DisclaimUserRoleParams{
			UserID: pgtype.Int4{Int32: *userID, Valid: true},
			RoleID: pgtype.Int4{Int32: *roleID, Valid: true},
		})
		if err != nil {
			s.repo.Logger.Error("failed to disclaim user role", err)
			return serviceerrors.NewInternalError("Не удалось отобрать роль у пользователя", err)
		}
	}

	if userGroupID != nil && roleID != nil {
		err = s.repo.DB.DisclaimUserGroupRole(ctx, dbcore.DisclaimUserGroupRoleParams{
			UserGroupID: pgtype.Int4{Int32: *userGroupID, Valid: true},
			RoleID:      pgtype.Int4{Int32: *roleID, Valid: true},
		})
		if err != nil {
			s.repo.Logger.Error("failed to disclaim user group role", err)
			return serviceerrors.NewInternalError("Не удалось отобрать роль у группы пользователей", err)
		}
	}

	if userGroupID != nil && ruleID != nil {
		err = s.repo.DB.DisclaimUserGroupRule(ctx, dbcore.DisclaimUserGroupRuleParams{
			UserGroupID: pgtype.Int4{Int32: *userGroupID, Valid: true},
			RuleID:      pgtype.Int4{Int32: *ruleID, Valid: true},
		})
		if err != nil {
			s.repo.Logger.Error("failed to disclaim user group rule", err)
			return serviceerrors.NewInternalError("Не удалось отобрать правило у группы пользователей", err)
		}
	}

	return nil
}

// AddUserToGroup добавляет пользователя в группу
func (s *ACLService) AddUserToGroup(ctx context.Context, userID, userGroupID int32) error {
	err := s.repo.DB.AddUserToGroup(ctx, dbcore.AddUserToGroupParams{
		UserID:      userID,
		UserGroupID: userGroupID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to add user to group", err)
		return serviceerrors.NewInternalError("Не удалось добавить пользователя в группу", err)
	}

	return nil
}

// RemoveUserFromGroup удаляет пользователя из группы
func (s *ACLService) RemoveUserFromGroup(ctx context.Context, userID, userGroupID int32) error {
	err := s.repo.DB.RemoveUserFromGroup(ctx, dbcore.RemoveUserFromGroupParams{
		UserID:      userID,
		UserGroupID: userGroupID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to remove user from group", err)
		return serviceerrors.NewInternalError("Не удалось удалить пользователя из группы", err)
	}

	return nil
}

// AddRuleToRole добавляет правило к роли
func (s *ACLService) AddRuleToRole(ctx context.Context, ruleID, roleID int32) error {
	err := s.repo.DB.AddRuleToRole(ctx, dbcore.AddRuleToRoleParams{
		RuleID: ruleID,
		RoleID: roleID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to add rule to role", err)
		return serviceerrors.NewInternalError("Не удалось добавить правило к роли", err)
	}

	return nil
}

// RemoveRuleFromRole удаляет правило из роли
func (s *ACLService) RemoveRuleFromRole(ctx context.Context, ruleID, roleID int32) error {
	err := s.repo.DB.RemoveRuleFromRole(ctx, dbcore.RemoveRuleFromRoleParams{
		RuleID: ruleID,
		RoleID: roleID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to remove rule from role", err)
		return serviceerrors.NewInternalError("Не удалось удалить правило из роли", err)
	}

	return nil
}

// ListUserMatches возвращает список правил для пользователя
func (s *ACLService) ListUserMatches(ctx context.Context, userID int32) ([]dto.MatchedRule, error) {
	matches, err := s.repo.DB.SelectACLMatchesForUser(ctx, userID)
	if err != nil {
		s.repo.Logger.Error("failed to select ACL matches for user", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить правила пользователя", err)
	}

	result := make([]dto.MatchedRule, len(matches))
	for i, match := range matches {
		result[i] = dto.MatchedRule{
			RuleID:          int32(match.RuleID.Int32),
			RoleID:          int32(match.RoleID.Int32),
			RoleName:        match.RoleName.String,
			ObjectType:      match.RuleObjectType.String,
			ObjectAttribute: match.RuleObjectAttribute.String,
			ObjectID:        int32(match.RuleObjectID.Int32),
			Action:          match.RuleAction.String,
		}
	}

	return result, nil
}

// ListUserGroupMatches возвращает список правил для группы пользователей
func (s *ACLService) ListUserGroupMatches(ctx context.Context, userGroupID int32) ([]dto.MatchedRule, error) {
	matches, err := s.repo.DB.SelectACLMatchesForUserGroup(ctx, pgtype.Int4{Int32: userGroupID, Valid: true})
	if err != nil {
		s.repo.Logger.Error("failed to select ACL matches for user group", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить правила группы пользователей", err)
	}

	result := make([]dto.MatchedRule, len(matches))
	for i, match := range matches {
		result[i] = dto.MatchedRule{
			RuleID:          int32(match.RuleID.Int32),
			RoleID:          int32(match.RoleID.Int32),
			RoleName:        match.RoleName.String,
			ObjectType:      match.RuleObjectType.String,
			ObjectAttribute: match.RuleObjectAttribute.String,
			ObjectID:        int32(match.RuleObjectID.Int32),
			Action:          match.RuleAction.String,
		}
	}

	return result, nil
}

// Role Management

// CreateRole создает новую роль
func (s *ACLService) CreateRole(ctx context.Context, name, description string, idmID string) (int32, error) {
	key := strings.TrimSpace(idmID)
	if key == "" {
		key = "cplane_" + uuid.NewString()
	}
	role, err := s.repo.DB.InsertRole(ctx, dbcore.InsertRoleParams{
		Name:        name,
		Description: description,
		IdmID:       key,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert role", err)
		return 0, serviceerrors.NewInternalError("Не удалось создать роль", err)
	}

	return role.ID, nil
}

// UpdateRole обновляет роль
func (s *ACLService) UpdateRole(ctx context.Context, roleID int32, name, description string) error {
	err := s.repo.DB.UpdateRole(ctx, dbcore.UpdateRoleParams{
		ID:          roleID,
		Name:        name,
		Description: description,
	})
	if err != nil {
		s.repo.Logger.Error("failed to update role", err)
		return serviceerrors.NewInternalError("Не удалось обновить роль", err)
	}

	return nil
}

// ListRoles возвращает список всех ролей
func (s *ACLService) ListRoles(ctx context.Context) ([]dto.Role, error) {
	roles, err := s.repo.DB.SelectRoles(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to select roles", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить список ролей", err)
	}

	result := make([]dto.Role, len(roles))
	for i, role := range roles {
		result[i] = dto.Role{
			ID:          role.ID,
			Name:        role.Name,
			Description: role.Description,
		}
	}

	return result, nil
}

// ListUserRoles возвращает список ролей пользователя
func (s *ACLService) ListUserRoles(ctx context.Context, userID int32) ([]dto.Role, error) {
	roles, err := s.repo.DB.SelectUserRoles(ctx, pgtype.Int4{Int32: userID, Valid: true})
	if err != nil {
		s.repo.Logger.Error("failed to select user roles", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить роли пользователя", err)
	}

	result := make([]dto.Role, len(roles))
	for i, role := range roles {
		result[i] = dto.Role{
			ID:          role.ID,
			Name:        role.Name,
			Description: role.Description,
		}
	}

	return result, nil
}

// Rule Management

// CreateRule создает новое правило
func (s *ACLService) CreateRule(ctx context.Context, objectType, objectAttribute, action string, objectID int32) (int32, error) {
	id, err := s.repo.DB.InsertRule(ctx, dbcore.InsertRuleParams{
		ObjectType:      objectType,
		ObjectAttribute: objectAttribute,
		ObjectID:        objectID,
		Action:          action,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert rule", err)
		return 0, serviceerrors.NewInternalError("Не удалось создать правило", err)
	}

	s.repo.Logger.Info(fmt.Sprintf("created rule id: %d, object_type: %s, object_attribute: %s, object_id: %d, action: %s",
		id, objectType, objectAttribute, objectID, action))

	return id, nil
}

// ListRoleRules возвращает список правил в роли
func (s *ACLService) ListRoleRules(ctx context.Context, roleID int32) ([]dto.Rule, error) {
	rules, err := s.repo.DB.SelectRole(ctx, roleID)
	if err != nil {
		s.repo.Logger.Error("failed to select role rules", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить правила роли", err)
	}

	result := make([]dto.Rule, len(rules))
	for i, rule := range rules {
		result[i] = dto.Rule{
			ID:              rule.ID,
			ObjectType:      rule.ObjectType,
			ObjectAttribute: rule.ObjectAttribute,
			ObjectID:        rule.ObjectID,
			Action:          rule.Action,
		}
	}

	return result, nil
}

// GetExperimentRights возвращает права пользователя на experiment
func (s *ACLService) GetExperimentRights(ctx context.Context, userInfo *user.UserInfo, experimentID int32) ([]acl.Right, error) {
	return acl.GetExperimentRights(ctx, &s.repo.Config.ACL, s.repo.Logger, s.repo.DB, "", userInfo, experimentID)
}

// GetDatasetRights возвращает права пользователя на dataset
func (s *ACLService) GetDatasetRights(ctx context.Context, userInfo *user.UserInfo, datasetID int32) ([]acl.Right, error) {
	return acl.GetDatasetRights(ctx, &s.repo.Config.ACL, s.repo.Logger, s.repo.DB, "", userInfo, datasetID)
}

// GetProjectRights возвращает права пользователя на project
func (s *ACLService) GetProjectRights(ctx context.Context, userInfo *user.UserInfo, projectID int32) ([]acl.Right, error) {
	return acl.GetProjectRights(ctx, &s.repo.Config.ACL, s.repo.Logger, s.repo.DB, "", userInfo, projectID)
}

// GetNamespaceRights возвращает права пользователя на namespace
func (s *ACLService) GetNamespaceRights(ctx context.Context, userInfo *user.UserInfo, namespaceID int32) ([]acl.Right, error) {
	return acl.GetNamespaceRights(ctx, &s.repo.Config.ACL, s.repo.Logger, s.repo.DB, "", userInfo, namespaceID)
}
