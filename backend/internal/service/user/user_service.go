package service

import (
	"context"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type UserService struct {
	repo *repository.Repository
}

func NewUserService(repo *repository.Repository) *UserService {
	return &UserService{repo: repo}
}

// GetUserIDByName возвращает ID пользователя по имени
func (s *UserService) GetUserIDByName(ctx context.Context, username string) (int32, error) {
	userID, err := s.repo.DB.GetUserByName(ctx, username)
	if err != nil {
		s.repo.Logger.Error("failed to get user by name", err)
		return 0, serviceerrors.NewNotFoundError("Пользователь не найден", err)
	}

	return userID, nil
}

// CreateUser создает нового пользователя
func (s *UserService) CreateUser(ctx context.Context, name string) (int32, error) {
	id, err := s.repo.DB.InsertUser(ctx, name)
	if err != nil {
		s.repo.Logger.Error("failed to insert user", err)
		return 0, serviceerrors.NewInternalError("Не удалось создать пользователя", err)
	}

	return id, nil
}

// User Groups

// CreateUserGroup создает новую группу пользователей
func (s *UserService) CreateUserGroup(ctx context.Context, name string) (int32, error) {
	id, err := s.repo.DB.InsertUserGroup(ctx, name)
	if err != nil {
		s.repo.Logger.Error("failed to insert user group", err)
		return 0, serviceerrors.NewInternalError("Не удалось создать группу пользователей", err)
	}

	return id, nil
}

// UpdateUserGroup обновляет группу пользователей
func (s *UserService) UpdateUserGroup(ctx context.Context, groupID int32, name string) error {
	err := s.repo.DB.UpdateUserGroup(ctx, dbcore.UpdateUserGroupParams{
		ID:   groupID,
		Name: name,
	})
	if err != nil {
		s.repo.Logger.Error("failed to update user group", err)
		return serviceerrors.NewInternalError("Не удалось обновить группу пользователей", err)
	}

	return nil
}

// ListUsersInGroup возвращает список пользователей в группе
func (s *UserService) ListUsersInGroup(ctx context.Context, userGroupID int32) ([]dto.User, error) {
	users, err := s.repo.DB.SelectUserGroup(ctx, userGroupID)
	if err != nil {
		s.repo.Logger.Error("failed to select user group", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить пользователей группы", err)
	}

	result := make([]dto.User, len(users))
	for i, user := range users {
		result[i] = dto.User{
			ID:   user.ID,
			Name: user.Name,
		}
	}

	return result, nil
}

// ListUserGroups возвращает список всех групп пользователей
func (s *UserService) ListUserGroups(ctx context.Context) ([]dto.UserGroup, error) {
	userGroups, err := s.repo.DB.SelectUserGroups(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to select user groups", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить список групп пользователей", err)
	}

	result := make([]dto.UserGroup, len(userGroups))
	for i, userGroup := range userGroups {
		result[i] = dto.UserGroup{
			ID:   userGroup.ID,
			Name: userGroup.Name,
		}
	}

	return result, nil
}

