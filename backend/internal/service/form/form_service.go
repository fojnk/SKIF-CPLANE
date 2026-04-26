package service

import (
	"context"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/params"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type FormService struct {
	repo *repository.Repository
}

func NewFormService(repo *repository.Repository) *FormService {
	return &FormService{repo: repo}
}

// GetDatasetFormParams возвращает параметры формы для dataset
func (s *FormService) GetDatasetFormParams(ctx context.Context, dsType string) ([]params.Param, error) {
	formParams, err := s.repo.FormsRepo.GetDatasetFormParams(ctx, dsType)
	if err != nil {
		s.repo.Logger.Error("failed to get dataset form", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить параметры формы dataset", err)
	}

	return formParams, nil
}

// GetProjectFormParams возвращает параметры формы для project
func (s *FormService) GetProjectFormParams(ctx context.Context) ([]params.Param, error) {
	formParams, err := s.repo.FormsRepo.GetProjectFormParams(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to get project form", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить параметры формы project", err)
	}

	return formParams, nil
}

// GetPipelintFormsParams возвращает параметры формы experiment: только Meta, experimentName и models[] (супервизор).
func (s *FormService) GetPipelintFormsParams(ctx context.Context) ([]params.Param, error) {
	paramsSl := make([]params.Param, 0)

	metaParams, err := s.repo.FormsRepo.GetExperimentMetaFormParams(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to get experiment meta form", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить параметры формы Meta эксперимента", err)
	}
	paramsSl = append(paramsSl, params.Param{
		Name:        "Meta",
		Description: "Метаданные эксперимента",
		Type: &params.ParamType{
			Type:         params.Struct,
			StructParams: &metaParams,
		},
	})

	paramsSl = append(paramsSl, params.Param{
		Name:        "experimentName",
		Description: "Имя пайплайна для супервизора",
		Type:        &params.ParamType{Type: params.String},
	})

	modelsItemParams, err := s.repo.FormsRepo.GetExperimentModelsFormParams(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to get experiment models form", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить параметры формы models эксперимента", err)
	}
	paramsSl = append(paramsSl, params.Param{
		Name:        "models",
		Description: "Модели пайплайна (очерёдность по order)",
		Type: &params.ParamType{
			Type:         params.Array,
			NestedType:   params.Struct,
			StructParams: &modelsItemParams,
		},
	})

	return paramsSl, nil
}
