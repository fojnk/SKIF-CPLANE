package service

import (
	"context"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	idm_roles "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/idm"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
)

type IDMService struct {
	repo *repository.Repository
}

func NewIDMService(repo *repository.Repository) *IDMService {
	return &IDMService{repo: repo}
}

// CreateProjectOwnerRole создает роль owner для проекта
func (s *IDMService) CreateProjectOwnerRole(ctx context.Context, projectID int32, u *user.UserInfo) error {
	return idm_roles.CreateProjectOwnerRole(ctx, s.repo, s.repo.Logger, projectID, 0, u)
}

// CreateNamespaceOwnerRole создает роль owner для namespace
func (s *IDMService) CreateNamespaceOwnerRole(ctx context.Context, namespaceID int32, u *user.UserInfo) error {
	return idm_roles.CreateNamespaceOwnerRole(ctx, s.repo, s.repo.Logger, namespaceID, u)
}
