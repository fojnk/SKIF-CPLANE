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

// GetProjectFormParams возвращает параметры формы для project
func (s *FormService) GetPipelintFormsParams(ctx context.Context) ([]params.Param, error) {
	paramsSl := make([]params.Param, 0)
	fileStoragesParams, err := s.repo.FormsRepo.GetExperimentFileStoragesFormParams(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to get experiment placement form", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить параметры формы experiment раздела placement", err)
	}
	paramsSl = append(paramsSl, params.Param{
		Name: "FileStorages",
		Type: &params.ParamType{
			Type:         params.Array,
			NestedType:   params.Struct,
			StructParams: &fileStoragesParams,
		},
	})

	placementParams, err := s.repo.FormsRepo.GetExperimentPlacementFormParams(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to get experiment placement form", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить параметры формы experiment раздела placement", err)
	}
	paramsSl = append(paramsSl, params.Param{
		Name: "Placement",
		Type: &params.ParamType{
			Type:         params.Struct,
			StructParams: &placementParams,
		},
	})

	resourcesParams, err := s.repo.FormsRepo.GetExperimentResourcesFormParams(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to get experiment resources form", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить параметры формы experiment раздела resources", err)
	}
	paramsSl = append(paramsSl, params.Param{
		Name: "Resources",
		Type: &params.ParamType{
			Type:         params.Struct,
			StructParams: &resourcesParams,
		},
	})

	resharderParams, err := s.repo.FormsRepo.GetExperimentResharderFormParams(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to get experiment resharder form", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить параметры формы experiment раздела resharder", err)
	}
	paramsSl = append(paramsSl, params.Param{
		Name: "Resharder",
		Type: &params.ParamType{
			Type:         params.Struct,
			StructParams: &resharderParams,
		},
	})

	statesParams, err := s.repo.FormsRepo.GetExperimentStatesFormParams(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to get experiment states form", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить параметры формы experiment раздела states", err)
	}
	paramsSl = append(paramsSl, params.Param{
		Name: "States",
		Type: &params.ParamType{
			Type:         params.Array,
			NestedType:   params.Struct,
			StructParams: &statesParams,
		},
	})

	workerParams, err := s.repo.FormsRepo.GetExperimentWorkerFormParams(ctx)
	if err != nil {
		s.repo.Logger.Error("failed to get experiment states form", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить параметры формы experiment раздела states", err)
	}
	paramsSl = append(paramsSl, params.Param{
		Name: "Worker",
		Type: &params.ParamType{
			Type:         params.Struct,
			StructParams: &workerParams,
		},
	})

	return paramsSl, nil
}
