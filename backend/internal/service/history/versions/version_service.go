package service

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type VersionService struct {
	repo *repository.Repository
}

func NewVersionService(repo *repository.Repository) *VersionService {
	return &VersionService{repo: repo}
}

// Experiment Versions

// ListExperimentVersions возвращает список версий experiment
func (s *VersionService) ListExperimentVersions(ctx context.Context, experimentID int32, limit, offset int32) ([]dto.ExperimentVersion, int64, error) {
	templateID, err := s.repo.DB.TemplateIDByExperimentID(ctx, experimentID)
	if err != nil {
		s.repo.Logger.Error("failed to get template id", err)
		return nil, 0, serviceerrors.NewNotFoundError("Шаблон пайплайна не найден", err)
	}

	versions, err := s.repo.DB.SelectExperimentVersions(ctx, core.SelectExperimentVersionsParams{
		ParentID: templateID,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		s.repo.Logger.Error("failed to select experiment versions", err)
		return nil, 0, serviceerrors.NewInternalError("Не удалось получить список версий пайплайна", err)
	}

	var total int64
	versionItems := make([]dto.ExperimentVersion, len(versions))
	for i, version := range versions {
		total = version.Total
		versionItems[i] = dto.ExperimentVersion{
			ID:        version.ID,
			CreatedAt: version.CreatedAt.Time,
			VersionID: version.VersionID,
			Creator:   version.Creator,
			Comment:   version.Comment,
		}
	}

	return versionItems, total, nil
}

// GetExperimentVersion возвращает конкретную версию experiment
func (s *VersionService) GetExperimentVersion(ctx context.Context, versionID int32) (*dto.ExperimentTemplate, error) {
	template, err := s.repo.DB.SelectExperimentTemplate(ctx, versionID)
	if err != nil {
		s.repo.Logger.Error("failed to select experiment template", err)
		return nil, serviceerrors.NewNotFoundError("Версия не найдена", err)
	}

	return &dto.ExperimentTemplate{
		ID:              template.ID,
		VersionID:       template.VersionID,
		ParentVersionID: template.ParentID,
		Config:          template.Config.String,
		CreatedAt:       template.CreatedAt.Time,
		Comment:         template.Comment,
		Creator:         template.Creator,
	}, nil
}

// GetExperimentCurrentVersion возвращает ID текущей версии experiment
func (s *VersionService) GetExperimentCurrentVersion(ctx context.Context, experimentID int32) (int32, error) {
	templateID, err := s.repo.DB.BaseTemplateIDByExperimentID(ctx, experimentID)
	if err != nil {
		s.repo.Logger.Error("failed to get base template id", err)
		return 0, serviceerrors.NewNotFoundError("Текущая версия не найдена", err)
	}

	return templateID, nil
}

// GetExperimentAppliedVersion возвращает ID примененной (deployed) версии experiment и конфигурацию
func (s *VersionService) GetExperimentAppliedVersion(ctx context.Context, experimentID int32) (int32, string, error) {
	result, err := s.repo.DB.SelectExperimentAppliedVersion(ctx, experimentID)
	if err != nil {
		s.repo.Logger.Error("failed to get applied version", err)
		return 0, "", serviceerrors.NewNotFoundError("Примененная версия не найдена", err)
	}

	return result.CurrentVersion, result.OrchConfig, nil
}

// SetExperimentAppliedVersion устанавливает примененную (deployed) версию experiment
func (s *VersionService) SetExperimentAppliedVersion(ctx context.Context, experimentID, versionID int32, orchConfig string) error {
	err := s.repo.DB.InsertExperimentAppliedVersion(ctx, core.InsertExperimentAppliedVersionParams{
		ExperimentID:     experimentID,
		CurrentVersion: versionID,
		OrchConfig:     orchConfig,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert applied version", err)
		return serviceerrors.NewInternalError("Не удалось установить примененную версию", err)
	}

	return nil
}

// UpdateExperimentVersionComment обновляет комментарий версии experiment
func (s *VersionService) UpdateExperimentVersionComment(ctx context.Context, versionID int32, comment, username string) (*dto.ExperimentTemplate, error) {
	tmp, err := s.repo.DB.SelectExperimentTemplate(ctx, versionID)
	if err != nil {
		s.repo.Logger.Error("failed to select experiment template", err)
		return nil, serviceerrors.NewNotFoundError("Версия не найдена", err)
	}

	if username != tmp.Creator {
		return nil, serviceerrors.NewForbiddenError("Вы можете редактировать только свои версии", nil)
	}

	template, err := s.repo.DB.UpdateExperimentTemplateV(ctx, core.UpdateExperimentTemplateVParams{
		ID:      versionID,
		Comment: comment,
	})
	if err != nil {
		s.repo.Logger.Error("failed to update experiment template", err)
		return nil, serviceerrors.NewInternalError("Не удалось обновить комментарий версии", err)
	}

	return &dto.ExperimentTemplate{
		ID:              template.ID,
		VersionID:       template.VersionID,
		ParentVersionID: template.ParentID,
		Config:          template.Config.String,
		CreatedAt:       template.CreatedAt.Time,
		Comment:         template.Comment,
		Creator:         template.Creator,
	}, nil
}

// UpdateExperimentVersion обновляет текущую версию experiment (откат на предыдущую версию)
func (s *VersionService) UpdateExperimentVersion(ctx context.Context, experimentID, versionID int32, comment, username string) (*dto.CompleteExperiment, error) {
	template, err := s.repo.DB.SelectExperimentTemplate(ctx, versionID)
	if err != nil {
		s.repo.Logger.Error("failed to select experiment template", err)
		return nil, serviceerrors.NewNotFoundError("Версия не найдена", err)
	}

	currentTemplateID, err := s.repo.DB.BaseTemplateIDByExperimentID(ctx, experimentID)
	if err != nil {
		s.repo.Logger.Error("failed to get current template id", err)
		return nil, serviceerrors.NewNotFoundError("Текущая версия не найдена", err)
	}

	if template.ID == currentTemplateID {
		return nil, serviceerrors.NewConflictError("Пайплайн уже использует эту версию", nil)
	}

	// Создаем новую версию на основе старой
	templateVID, err := s.repo.DB.InsertExperimentTemplateVTx(ctx, core.InsertExperimentTemplateVParams{
		ParentID:              template.ParentID,
		Config:                template.Config,
		Yql:                   template.Yql,
		Comment:               comment,
		Creator:               username,
		AdditionalInformation: template.AdditionalInformation,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert experiment template version", err)
		return nil, serviceerrors.NewInternalError("Не удалось создать версию шаблона", err)
	}

	if err := s.repo.DB.UpdateExperiment(ctx, core.UpdateExperimentParams{
		ID:          experimentID,
		TemplateVID: templateVID,
	}); err != nil {
		s.repo.Logger.Error("failed to update experiment", err)
		return nil, serviceerrors.NewInternalError("Не удалось обновить пайплайн", err)
	}

	completeExperiment, err := s.repo.DB.SelectCompleteExperiment(ctx, experimentID)
	if err != nil {
		s.repo.Logger.Error("failed to select complete experiment", err)
		return nil, serviceerrors.NewNotFoundError("Пайплайн не найден", err)
	}

	return &dto.CompleteExperiment{
		ID:     completeExperiment.ID,
		Name:   completeExperiment.Name,
		Config: completeExperiment.Config.String,
	}, nil
}

// Experiment Variable Versions

// ListExperimentVariableVersions возвращает список версий переменной experiment
func (s *VersionService) ListExperimentVariableVersions(ctx context.Context, variableID int32, experimentID int32, limit, offset int32) ([]dto.ExperimentVariableVersion, int64, error) {
	versions, err := s.repo.DB.SelectExperimentVariableVersions(ctx, core.SelectExperimentVariableVersionsParams{
		VariableID: pgtype.Int4{Int32: variableID, Valid: true},
		ExperimentID: pgtype.Int4{Int32: experimentID, Valid: true},
		LimitVal:   limit,
		OffsetVal:  offset,
	})
	if err != nil {
		s.repo.Logger.Error("failed to select experiment variable versions", err)
		return nil, 0, serviceerrors.NewInternalError("Не удалось получить список версий переменной", err)
	}

	var total int64
	versionItems := make([]dto.ExperimentVariableVersion, len(versions))
	for i, version := range versions {
		total = version.Total
		head := false
		if version.Head != nil {
			head = *version.Head
		}
		versionItems[i] = dto.ExperimentVariableVersion{
			ID:           version.ID,
			CreatedAt:    version.CreatedAt.Time,
			VersionID:    version.Version,
			Creator:      version.Creator,
			Comment:      version.Comment,
			VariableType: version.Type,
			VariableName: version.VariableName,
			VariableID:   version.VariableID.Int32,
			Head:         head,
		}
	}

	return versionItems, total, nil
}

// GetExperimentVariableVersion возвращает конкретную версию переменной
func (s *VersionService) GetExperimentVariableVersion(ctx context.Context, versionID int32) (*dto.ExperimentVariableVersionTemplate, error) {
	template, err := s.repo.DB.SelectExperimentVariableVersion(ctx, versionID)
	if err != nil {
		s.repo.Logger.Error("failed to select experiment variable version", err)
		return nil, serviceerrors.NewNotFoundError("Версия переменной не найдена", err)
	}

	return &dto.ExperimentVariableVersionTemplate{
		ID:        template.ID,
		VersionID: template.Version,
		Type:      template.Type,
		Value:     template.Value,
		CreatedAt: template.CreatedAt.Time,
		Comment:   template.Comment,
		Creator:   template.Creator,
	}, nil
}

// GetExperimentVariableCurrentVersion возвращает ID текущей версии переменной
func (s *VersionService) GetExperimentVariableCurrentVersion(ctx context.Context, variableID int32) (int32, error) {
	variable, err := s.repo.DB.SelectExperimentVariable(ctx, variableID)
	if err != nil {
		s.repo.Logger.Error("failed to select experiment variable", err)
		return 0, serviceerrors.NewNotFoundError("Переменная не найдена", err)
	}

	return variable.ID, nil
}

// UpdateExperimentVariableVersionComment обновляет комментарий версии переменной
func (s *VersionService) UpdateExperimentVariableVersionComment(ctx context.Context, versionID int32, comment, username string) (*dto.ExperimentVariableVersionTemplate, error) {
	tmp, err := s.repo.DB.SelectExperimentVariableVersion(ctx, versionID)
	if err != nil {
		s.repo.Logger.Error("failed to select experiment variable version", err)
		return nil, serviceerrors.NewNotFoundError("Версия переменной не найдена", err)
	}

	if username != tmp.Creator {
		return nil, serviceerrors.NewForbiddenError("Вы можете редактировать только свои версии", nil)
	}

	template, err := s.repo.DB.UpdateExperimentVariableVersionComment(ctx, core.UpdateExperimentVariableVersionCommentParams{
		ID:      versionID,
		Comment: comment,
	})
	if err != nil {
		s.repo.Logger.Error("failed to update experiment variable version comment", err)
		return nil, serviceerrors.NewInternalError("Не удалось обновить комментарий версии переменной", err)
	}

	return &dto.ExperimentVariableVersionTemplate{
		ID:        template.ID,
		VersionID: template.Version,
		Value:     template.Value,
		Type:      template.Type,
		CreatedAt: template.CreatedAt.Time,
		Comment:   template.Comment,
		Creator:   template.Creator,
	}, nil
}

// UpdateExperimentVariableVersion откатывает переменную на предыдущую версию
func (s *VersionService) UpdateExperimentVariableVersion(ctx context.Context, variableID, versionID int32, comment, username string) (*dto.ExperimentVariable, *dto.ExperimentVariable, int32, error) {
	variable, err := s.repo.DB.SelectExperimentVariable(ctx, variableID)
	if err != nil {
		s.repo.Logger.Error("failed to select experiment variable", err)
		return nil, nil, 0, serviceerrors.NewNotFoundError("Переменная не найдена", err)
	}

	// Store old variable state
	oldVariable := &dto.ExperimentVariable{
		ID:        variableID,
		Name:      variable.Name,
		Value:     variable.Value,
		Type:      variable.Type,
		VersionID: variable.VersionID,
	}

	version, err := s.repo.DB.SelectExperimentVariableVersion(ctx, versionID)
	if err != nil {
		s.repo.Logger.Error("failed to select experiment variable version", err)
		return nil, nil, 0, serviceerrors.NewNotFoundError("Версия переменной не найдена", err)
	}

	projectID, err := s.repo.DB.GetExperimentProject(ctx, variable.ExperimentID)
	if err != nil {
		s.repo.Logger.Error("failed to get experiment project", err)
		return nil, nil, 0, serviceerrors.NewNotFoundError("Проект пайплайна не найден", err)
	}

	if variable.VersionID == version.ID {
		return nil, nil, 0, serviceerrors.NewConflictError("Переменная уже использует эту версию", nil)
	}

	newVersion, err := s.repo.DB.InsertExperimentVariableVersion(ctx, core.InsertExperimentVariableVersionParams{
		Type:       version.Type,
		Value:      version.Value,
		VariableID: pgtype.Int4{Int32: variableID, Valid: true},
		Comment:    comment,
		Creator:    username,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert experiment variable version", err)
		return nil, nil, 0, serviceerrors.NewInternalError("Не удалось создать версию переменной", err)
	}

	if _, err := s.repo.DB.UpdateExperimentVariableVersion(ctx, core.UpdateExperimentVariableVersionParams{
		ID:        variableID,
		VersionID: newVersion.ID,
	}); err != nil {
		s.repo.Logger.Error("failed to update experiment variable version", err)
		return nil, nil, 0, serviceerrors.NewInternalError("Не удалось обновить версию переменной", err)
	}

	newVariableState := &dto.ExperimentVariable{
		ID:        variableID,
		Name:      variable.Name,
		Value:     version.Value,
		Type:      version.Type,
		VersionID: version.ID,
	}

	return oldVariable, newVariableState, projectID, nil
}

// Dataset Versions

// ListDatasetVersions возвращает список версий dataset
func (s *VersionService) ListDatasetVersions(ctx context.Context, datasetID int32, limit, offset int32) ([]dto.DatasetVersion, int64, error) {
	versions, err := s.repo.DB.SelectDatasetVersions(ctx, core.SelectDatasetVersionsParams{
		DatasetID: pgtype.Int4{Int32: datasetID, Valid: true},
		Limit:        limit,
		Offset:       offset,
	})
	if err != nil {
		s.repo.Logger.Error("failed to select dataset versions", err)
		return nil, 0, serviceerrors.NewInternalError("Не удалось получить список версий dataset", err)
	}

	var total int64
	versionItems := make([]dto.DatasetVersion, len(versions))
	for i, version := range versions {
		total = version.Total
		versionItems[i] = dto.DatasetVersion{
			ID:        version.ID,
			CreatedAt: version.CreatedAt.Time,
			VersionID: version.Version,
			Creator:   version.Creator,
			Comment:   version.Comment,
		}
	}

	return versionItems, total, nil
}

// GetDatasetVersion возвращает конкретную версию dataset
func (s *VersionService) GetDatasetVersion(ctx context.Context, versionID int32) (*dto.DatasetVersionTemplate, error) {
	template, err := s.repo.DB.SelectDatasetVersion(ctx, versionID)
	if err != nil {
		s.repo.Logger.Error("failed to select dataset version", err)
		return nil, serviceerrors.NewNotFoundError("Версия dataset не найдена", err)
	}

	return &dto.DatasetVersionTemplate{
		ID:        template.ID,
		VersionID: template.Version,
		Type:      template.Type,
		Params:    template.Params,
		Schema:    template.Schema,
		Public:    template.Public,
		CreatedAt: template.CreatedAt.Time,
		Comment:   template.Comment,
		Creator:   template.Creator,
	}, nil
}

// GetDatasetCurrentVersion возвращает ID текущей версии dataset
func (s *VersionService) GetDatasetCurrentVersion(ctx context.Context, datasetID int32) (int32, error) {
	versionID, err := s.repo.DB.SelectDatasetCurrVersion(ctx, datasetID)
	if err != nil {
		s.repo.Logger.Error("failed to select dataset current version", err)
		return 0, serviceerrors.NewNotFoundError("Текущая версия dataset не найдена", err)
	}

	return versionID, nil
}

// UpdateDatasetVersionComment обновляет комментарий версии dataset
func (s *VersionService) UpdateDatasetVersionComment(ctx context.Context, versionID int32, comment, username string) (*dto.DatasetVersionTemplate, error) {
	tmp, err := s.repo.DB.SelectDatasetVersion(ctx, versionID)
	if err != nil {
		s.repo.Logger.Error("failed to select dataset version", err)
		return nil, serviceerrors.NewNotFoundError("Версия dataset не найдена", err)
	}

	if username != tmp.Creator {
		return nil, serviceerrors.NewForbiddenError("Вы можете редактировать только свои версии", nil)
	}

	template, err := s.repo.DB.UpdateDatasetVersionComment(ctx, core.UpdateDatasetVersionCommentParams{
		ID:      versionID,
		Comment: comment,
	})
	if err != nil {
		s.repo.Logger.Error("failed to update dataset version comment", err)
		return nil, serviceerrors.NewInternalError("Не удалось обновить комментарий версии dataset", err)
	}

	return &dto.DatasetVersionTemplate{
		ID:        template.ID,
		VersionID: template.Version,
		Params:    template.Params,
		Schema:    template.Schema,
		Public:    template.Public,
		Type:      template.Type,
		CreatedAt: template.CreatedAt.Time,
		Comment:   template.Comment,
		Creator:   template.Creator,
	}, nil
}

// UpdateDatasetVersion откатывает dataset на предыдущую версию
func (s *VersionService) UpdateDatasetVersion(ctx context.Context, datasetID, versionID int32, comment, username string) (*dto.Dataset, error) {
	dataset, err := s.repo.DB.SelectDataset(ctx, datasetID)
	if err != nil {
		s.repo.Logger.Error("failed to select dataset", err)
		return nil, serviceerrors.NewNotFoundError("Dataset не найден", err)
	}

	version, err := s.repo.DB.SelectDatasetVersion(ctx, versionID)
	if err != nil {
		s.repo.Logger.Error("failed to select dataset version", err)
		return nil, serviceerrors.NewNotFoundError("Версия dataset не найдена", err)
	}

	if dataset.VersionID == version.ID {
		return nil, serviceerrors.NewConflictError("Dataset уже использует эту версию", nil)
	}

	newVersion, err := s.repo.DB.InsertDatasetVersion(ctx, core.InsertDatasetVersionParams{
		Type:         version.Type,
		Params:       version.Params,
		Schema:       version.Schema,
		Public:       version.Public,
		Managed:      version.Managed,
		DatasetID: pgtype.Int4{Int32: datasetID, Valid: true},
		Comment:      comment,
		Creator:      username,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert dataset version", err)
		return nil, serviceerrors.NewInternalError("Не удалось создать версию dataset", err)
	}

	if _, err := s.repo.DB.UpdateDatasetVersion(ctx, core.UpdateDatasetVersionParams{
		ID:        datasetID,
		VersionID: newVersion.ID,
	}); err != nil {
		s.repo.Logger.Error("failed to update dataset version", err)
		return nil, serviceerrors.NewInternalError("Не удалось обновить версию dataset", err)
	}

	return &dto.Dataset{
		ID:        datasetID,
		Name:      dataset.Name,
		Schema:    version.Schema,
		Public:    version.Public,
		Managed:   version.Managed,
		Params:    version.Params,
		Type:      version.Type,
		VersionID: version.ID,
	}, nil
}
