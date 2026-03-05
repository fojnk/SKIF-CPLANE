package service

import (
	"context"
	"github.com/jackc/pgx/v5/pgtype"
	jwt_client "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/jwt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type RobotService struct {
	repo *repository.Repository
}

func NewRobotService(repo *repository.Repository) *RobotService {
	return &RobotService{repo: repo}
}

// CreateRobot создает нового робота
func (s *RobotService) CreateRobot(ctx context.Context, name string) (int32, error) {
	robotID, err := s.repo.DB.InsertRobot(ctx, name)
	if err != nil {
		s.repo.Logger.Error("failed to insert robot", err)
		return 0, serviceerrors.NewInternalError("Не удалось создать робота", err)
	}

	return robotID, nil
}

// CreateRobotToken создает токен для робота в БД
func (s *RobotService) CreateRobotToken(ctx context.Context, robotID int32, token string, expiresAt pgtype.Timestamp) (int32, error) {
	_, err := s.repo.DB.InsertRobotToken(ctx, core.InsertRobotTokenParams{
		Token:     token,
		RobotID:   robotID,
		ExpiresAt: expiresAt,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert robot token", err)
		return 0, serviceerrors.NewInternalError("Не удалось создать токен робота", err)
	}

	return robotID, nil
}

// DeleteAllRobotTokens удаляет все токены робота
func (s *RobotService) DeleteAllRobotTokens(ctx context.Context, robotID int32) error {
	err := s.repo.DB.DeleteAllRobotTokens(ctx, robotID)
	if err != nil {
		s.repo.Logger.Error("failed to delete robot tokens", err)
		return serviceerrors.NewInternalError("Не удалось удалить токены робота", err)
	}

	return nil
}

// GenerateRobotTokenViaJWT генерирует JWT токен для робота
func (s *RobotService) GenerateRobotTokenViaJWT(name string) (*jwt_client.TokenInfo, error) {
	token, err := s.repo.Clients.JwtClient.CreateRobotToken(name)
	if err != nil {
		s.repo.Logger.Error("failed to create robot token via JWT", err)
		return nil, serviceerrors.NewInternalError("Не удалось создать JWT токен для робота", err)
	}

	return token, nil
}


