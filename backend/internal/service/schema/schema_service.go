package service

import (
	"context"
	"fmt"
	"io"
	"os"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type SchemaService struct {
	repo         *repository.Repository
	schemaConfig map[string]string
}

func NewSchemaService(repo *repository.Repository) *SchemaService {
	return &SchemaService{
		repo: repo,
		schemaConfig: map[string]string{
			"experiment":          "/json/TExperimentConfig.json",
			"dataset":        "/json/TDataset.json",
			"project":           "/json/TProjectConfig.json",
			"dataset_schema": "/json/TDataSchema.json",
		},
	}
}

// GetConfigSchema возвращает JSON схему для конфигурации
func (s *SchemaService) GetConfigSchema(ctx context.Context, configType string) (string, error) {
	schemaPath, ok := s.schemaConfig[configType]
	if !ok {
		return "", serviceerrors.NewNotFoundError(fmt.Sprintf("Схема для типа %s не найдена", configType), nil)
	}

	file, err := os.Open(schemaPath)
	if err != nil {
		s.repo.Logger.Error("failed to open schema file", err)
		return "", serviceerrors.NewInternalError("Не удалось открыть файл схемы", err)
	}
	defer file.Close()

	byteValue, err := io.ReadAll(file)
	if err != nil {
		s.repo.Logger.Error("failed to read schema file", err)
		return "", serviceerrors.NewInternalError("Не удалось прочитать файл схемы", err)
	}

	return string(byteValue), nil
}
