package service

import (
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v5/pgtype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type UpdateLogService struct {
	repo *repository.Repository
}

func NewUpdateLogService(repo *repository.Repository) *UpdateLogService {
	return &UpdateLogService{repo: repo}
}

// LogExperimentChange записывает изменение пайплайна в лог
func (s *UpdateLogService) LogExperimentChange(ctx context.Context, projectID int32, experimentID int32, username, comment string, act update_log.Action, details update_log.ExperimentUpdateLog) {
	update_log.NewExperimentLog(ctx, s.repo.DB, s.repo.Logger, projectID, experimentID, username, comment, act, details)
}

// LogProjectChange записывает изменение проекта в лог
func (s *UpdateLogService) LogProjectChange(ctx context.Context, namespaceID int32, projectID int32, username, comment string, act update_log.Action, details update_log.ProjectUpdateLog) {
	update_log.NewProjectLog(ctx, s.repo.DB, s.repo.Logger, namespaceID, projectID, username, comment, act, details)
}

// LogDatasetChange записывает изменение dataset в лог
func (s *UpdateLogService) LogDatasetChange(ctx context.Context, namespaceID int32, projectID pgtype.Int4, datasetID int32, username, comment string, act update_log.Action, details update_log.DatasetUpdateLog) {
	update_log.NewDatasetLog(ctx, s.repo.DB, s.repo.Logger, namespaceID, projectID, datasetID, username, comment, act, details)
}

// LogNamespaceChange записывает изменение namespace в лог
func (s *UpdateLogService) LogNamespaceChange(ctx context.Context, namespaceID int32, username, comment string, act update_log.Action, details update_log.NamespaceUpdateLog) {
	update_log.NewNamespaceLog(ctx, s.repo.DB, s.repo.Logger, namespaceID, username, comment, act, details)
}

// Namespace Logs

// ListNamespaceUpdateLogs возвращает список логов обновлений namespace
func (s *UpdateLogService) ListNamespaceUpdateLogs(ctx context.Context, namespaceID int32, limit, offset int32) ([]dto.NamespaceUpdateLog, int64, error) {
	var logItems []dto.NamespaceUpdateLog
	var total int64

	if namespaceID == 0 {
		// Все namespaces
		logs, err := s.repo.DB.SelectAllNamespacesUpdateLogs(ctx, core.SelectAllNamespacesUpdateLogsParams{
			Offset: offset,
			Limit:  limit,
		})
		if err != nil {
			s.repo.Logger.Error("failed to select all namespaces update logs", err)
			return nil, 0, serviceerrors.NewInternalError("Не удалось получить логи namespaces", err)
		}

		for _, log := range logs {
			total = log.Total
			logItems = append(logItems, dto.NamespaceUpdateLog{
				ID:        log.ID,
				CreatedAt: log.CreatedAt.Time,
				Name:      log.Name,
				Act:       log.Act,
				User:      log.Username,
				Comment:   log.Comment,
			})
		}
	} else {
		// Конкретный namespace
		logs, err := s.repo.DB.SelectNamespaceUpdateLogs(ctx, core.SelectNamespaceUpdateLogsParams{
			NamespaceID: namespaceID,
			Offset:      offset,
			Limit:       limit,
		})
		if err != nil {
			s.repo.Logger.Error("failed to select namespace update logs", err)
			return nil, 0, serviceerrors.NewInternalError("Не удалось получить логи namespace", err)
		}

		for _, log := range logs {
			total = log.Total
			logItems = append(logItems, dto.NamespaceUpdateLog{
				ID:        log.ID,
				CreatedAt: log.CreatedAt.Time,
				Name:      log.Name,
				Act:       log.Act,
				User:      log.Username,
				Comment:   log.Comment,
			})
		}
	}

	return logItems, total, nil
}

// GetNamespaceLog возвращает конкретный лог обновления namespace
func (s *UpdateLogService) GetNamespaceLog(ctx context.Context, logID int32) (*dto.NamespaceUpdateLog, update_log.NamespaceUpdateLog, int32, error) {
	log, err := s.repo.DB.SelectNamespaceLog(ctx, logID)
	if err != nil {
		s.repo.Logger.Error("failed to select namespace log", err)
		return nil, update_log.NamespaceUpdateLog{}, 0, serviceerrors.NewNotFoundError("Лог не найден", err)
	}

	var details update_log.NamespaceUpdateLog
	if err := json.Unmarshal(log.Details, &details); err != nil {
		s.repo.Logger.Error("failed to unmarshal namespace log details", err)
		return nil, update_log.NamespaceUpdateLog{}, 0, serviceerrors.NewInternalError("Не удалось распарсить детали лога", err)
	}

	result := &dto.NamespaceUpdateLog{
		ID:        log.ID,
		CreatedAt: log.CreatedAt.Time,
		Act:       log.Act,
		User:      log.Username,
		Comment:   log.Comment,
		Name:      log.Name,
	}

	return result, details, log.NamespaceID, nil
}

// UpdateNamespaceLogComment обновляет комментарий лога namespace
func (s *UpdateLogService) UpdateNamespaceLogComment(ctx context.Context, logID int32, newComment, username string) error {
	log, err := s.repo.DB.SelectNamespaceLog(ctx, logID)
	if err != nil {
		s.repo.Logger.Error("failed to select namespace log", err)
		return serviceerrors.NewNotFoundError("Лог не найден", err)
	}

	if log.Username != username {
		return serviceerrors.NewForbiddenError("Вы можете редактировать только свои комментарии", nil)
	}

	err = s.repo.DB.UpdateNamespaceLogComment(ctx, core.UpdateNamespaceLogCommentParams{
		ID:      logID,
		Comment: newComment,
	})
	if err != nil {
		s.repo.Logger.Error("failed to update namespace log comment", err)
		return serviceerrors.NewInternalError("Не удалось обновить комментарий лога", err)
	}

	return nil
}

// Project Logs

// ListProjectUpdateLogs возвращает список логов обновлений project
func (s *UpdateLogService) ListProjectUpdateLogs(ctx context.Context, projectID, namespaceID int32, limit, offset int32) ([]dto.ProjectUpdateLog, int64, error) {
	var logItems []dto.ProjectUpdateLog
	var total int64

	if projectID == 0 {
		// Все проекты в namespace
		logs, err := s.repo.DB.SelectAllProjectsUpdateLogs(ctx, core.SelectAllProjectsUpdateLogsParams{
			NamespaceID: namespaceID,
			Offset:      offset,
			Limit:       limit,
		})
		if err != nil {
			s.repo.Logger.Error("failed to select all projects update logs", err)
			return nil, 0, serviceerrors.NewInternalError("Не удалось получить логи проектов", err)
		}

		for _, log := range logs {
			total = log.Total
			logItems = append(logItems, dto.ProjectUpdateLog{
				ID:        log.ID,
				CreatedAt: log.CreatedAt.Time,
				Name:      log.Name,
				Act:       log.Act,
				User:      log.Username,
				Comment:   log.Comment,
			})
		}
	} else {
		// Конкретный проект
		logs, err := s.repo.DB.SelectProjectUpdateLogs(ctx, core.SelectProjectUpdateLogsParams{
			ProjectID: projectID,
			Offset:    offset,
			Limit:     limit,
		})
		if err != nil {
			s.repo.Logger.Error("failed to select project update logs", err)
			return nil, 0, serviceerrors.NewInternalError("Не удалось получить логи проекта", err)
		}

		for _, log := range logs {
			total = log.Total
			logItems = append(logItems, dto.ProjectUpdateLog{
				ID:        log.ID,
				CreatedAt: log.CreatedAt.Time,
				Name:      log.Name,
				Act:       log.Act,
				User:      log.Username,
				Comment:   log.Comment,
			})
		}
	}

	return logItems, total, nil
}

// GetProjectLog возвращает конкретный лог обновления project
func (s *UpdateLogService) GetProjectLog(ctx context.Context, logID int32) (*dto.ProjectUpdateLog, update_log.ProjectUpdateLog, int32, int32, error) {
	log, err := s.repo.DB.SelectProjectLog(ctx, logID)
	if err != nil {
		s.repo.Logger.Error("failed to select project log", err)
		return nil, update_log.ProjectUpdateLog{}, 0, 0, serviceerrors.NewNotFoundError("Лог не найден", err)
	}

	var details update_log.ProjectUpdateLog
	if err := json.Unmarshal(log.Details, &details); err != nil {
		s.repo.Logger.Error("failed to unmarshal project log details", err)
		return nil, update_log.ProjectUpdateLog{}, 0, 0, serviceerrors.NewInternalError("Не удалось распарсить детали лога", err)
	}

	result := &dto.ProjectUpdateLog{
		ID:        log.ID,
		CreatedAt: log.CreatedAt.Time,
		Act:       log.Act,
		User:      log.Username,
		Comment:   log.Comment,
		Name:      log.Name,
	}

	return result, details, log.ProjectID, log.NamespaceID, nil
}

// UpdateProjectLogComment обновляет комментарий лога project
func (s *UpdateLogService) UpdateProjectLogComment(ctx context.Context, logID int32, newComment, username string) error {
	log, err := s.repo.DB.SelectProjectLog(ctx, logID)
	if err != nil {
		s.repo.Logger.Error("failed to select project log", err)
		return serviceerrors.NewNotFoundError("Лог не найден", err)
	}

	if log.Username != username {
		return serviceerrors.NewForbiddenError("Вы можете редактировать только свои комментарии", nil)
	}

	err = s.repo.DB.UpdateProjectLogComment(ctx, core.UpdateProjectLogCommentParams{
		ID:      logID,
		Comment: newComment,
	})
	if err != nil {
		s.repo.Logger.Error("failed to update project log comment", err)
		return serviceerrors.NewInternalError("Не удалось обновить комментарий лога", err)
	}

	return nil
}

// Experiment Logs

// ListExperimentUpdateLogs возвращает список логов обновлений experiment
func (s *UpdateLogService) ListExperimentUpdateLogs(ctx context.Context, experimentID, projectID int32, limit, offset int32) ([]dto.ExperimentUpdateLog, int64, error) {
	var logItems []dto.ExperimentUpdateLog
	var total int64

	if experimentID == 0 {
		// Все experiments в проекте
		logs, err := s.repo.DB.SelectAllExperimentsUpdateLogs(ctx, core.SelectAllExperimentsUpdateLogsParams{
			ProjectID: projectID,
			Offset:    offset,
			Limit:     limit,
		})
		if err != nil {
			s.repo.Logger.Error("failed to select all experiments update logs", err)
			return nil, 0, serviceerrors.NewInternalError("Не удалось получить логи пайплайнов", err)
		}

		for _, log := range logs {
			total = log.Total

			var jobID *int64
			if len(log.Details) > 0 {
				var details update_log.ExperimentUpdateLog
				if err := json.Unmarshal(log.Details, &details); err == nil {
					if details.New.JobID != nil {
						jobID = details.New.JobID
					} else if details.Old.JobID != nil {
						jobID = details.Old.JobID
					}
				}
			}

			logItems = append(logItems, dto.ExperimentUpdateLog{
				ID:        log.ID,
				CreatedAt: log.CreatedAt.Time,
				Name:      log.Name,
				Act:       log.Act,
				User:      log.Username,
				Comment:   log.Comment,
				JobID:     jobID,
			})
		}
	} else {
		logs, err := s.repo.DB.SelectExperimentUpdateLogs(ctx, core.SelectExperimentUpdateLogsParams{
			ExperimentID: experimentID,
			Offset:     offset,
			Limit:      limit,
		})
		if err != nil {
			s.repo.Logger.Error("failed to select experiment update logs", err)
			return nil, 0, serviceerrors.NewInternalError("Не удалось получить логи пайплайна", err)
		}

		for _, log := range logs {
			total = log.Total

			var jobID *int64
			if len(log.Details) > 0 {
				var details update_log.ExperimentUpdateLog
				if err := json.Unmarshal(log.Details, &details); err == nil {
					if details.New.JobID != nil {
						jobID = details.New.JobID
					} else if details.Old.JobID != nil {
						jobID = details.Old.JobID
					}
				}
			}

			logItems = append(logItems, dto.ExperimentUpdateLog{
				ID:        log.ID,
				CreatedAt: log.CreatedAt.Time,
				Name:      log.Name,
				Act:       log.Act,
				User:      log.Username,
				Comment:   log.Comment,
				JobID:     jobID,
			})
		}
	}

	return logItems, total, nil
}

// GetExperimentLog возвращает конкретный лог обновления experiment
func (s *UpdateLogService) GetExperimentLog(ctx context.Context, logID int32) (*dto.ExperimentUpdateLog, update_log.ExperimentUpdateLog, int32, int32, error) {
	log, err := s.repo.DB.SelectExperimentLog(ctx, logID)
	if err != nil {
		s.repo.Logger.Error("failed to select experiment log", err)
		return nil, update_log.ExperimentUpdateLog{}, 0, 0, serviceerrors.NewNotFoundError("Лог не найден", err)
	}

	var details update_log.ExperimentUpdateLog
	if err := json.Unmarshal(log.Details, &details); err != nil {
		s.repo.Logger.Error("failed to unmarshal experiment log details", err)
		return nil, update_log.ExperimentUpdateLog{}, 0, 0, serviceerrors.NewInternalError("Не удалось распарсить детали лога", err)
	}

	var jobID *int64
	if details.New.JobID != nil {
		jobID = details.New.JobID
	} else if details.Old.JobID != nil {
		jobID = details.Old.JobID
	}

	result := &dto.ExperimentUpdateLog{
		ID:        log.ID,
		CreatedAt: log.CreatedAt.Time,
		Act:       log.Act,
		User:      log.Username,
		Comment:   log.Comment,
		Name:      log.Name,
		JobID:     jobID,
	}

	return result, details, log.ExperimentID, log.ProjectID, nil
}

// UpdateExperimentLogComment обновляет комментарий лога experiment
func (s *UpdateLogService) UpdateExperimentLogComment(ctx context.Context, logID int32, newComment, username string) error {
	log, err := s.repo.DB.SelectExperimentLog(ctx, logID)
	if err != nil {
		s.repo.Logger.Error("failed to select experiment log", err)
		return serviceerrors.NewNotFoundError("Лог не найден", err)
	}

	if log.Username != username {
		return serviceerrors.NewForbiddenError("Вы можете редактировать только свои комментарии", nil)
	}

	err = s.repo.DB.UpdateExperimentLogComment(ctx, core.UpdateExperimentLogCommentParams{
		ID:      logID,
		Comment: newComment,
	})
	if err != nil {
		s.repo.Logger.Error("failed to update experiment log comment", err)
		return serviceerrors.NewInternalError("Не удалось обновить комментарий лога", err)
	}

	return nil
}

// Dataset Logs

// ListDatasetUpdateLogsByNamespace возвращает список логов обновлений dataset по namespace
func (s *UpdateLogService) ListDatasetUpdateLogsByNamespace(ctx context.Context, datasetID, namespaceID int32, limit, offset int32) ([]dto.DatasetUpdateLog, int64, error) {
	var logItems []dto.DatasetUpdateLog
	var total int64

	if datasetID == 0 {
		// Все datasets в namespace
		logs, err := s.repo.DB.SelectAllDatasetsUpdateLogsByNamespaceID(ctx, core.SelectAllDatasetsUpdateLogsByNamespaceIDParams{
			NamespaceID: namespaceID,
			Offset:      offset,
			Limit:       limit,
		})
		if err != nil {
			s.repo.Logger.Error("failed to select all datasets update logs by namespace", err)
			return nil, 0, serviceerrors.NewInternalError("Не удалось получить логи datasets", err)
		}

		for _, log := range logs {
			total = log.Total

			var jobID *int64
			if len(log.Details) > 0 {
				var details update_log.DatasetUpdateLog
				if err := json.Unmarshal(log.Details, &details); err == nil {
					if details.New.JobID != nil {
						jobID = details.New.JobID
					} else if details.Old.JobID != nil {
						jobID = details.Old.JobID
					}
				}
			}

			logItems = append(logItems, dto.DatasetUpdateLog{
				ID:        log.ID,
				CreatedAt: log.CreatedAt.Time,
				Name:      log.Name,
				Act:       log.Act,
				User:      log.Username,
				Comment:   log.Comment,
				JobID:     jobID,
			})
		}
	} else {
		// Конкретный dataset
		logs, err := s.repo.DB.SelectDatasetUpdateLogs(ctx, core.SelectDatasetUpdateLogsParams{
			DatasetID: datasetID,
			Offset:       offset,
			Limit:        limit,
		})
		if err != nil {
			s.repo.Logger.Error("failed to select dataset update logs", err)
			return nil, 0, err
		}

		for _, log := range logs {
			total = log.Total

			var jobID *int64
			if len(log.Details) > 0 {
				var details update_log.DatasetUpdateLog
				if err := json.Unmarshal(log.Details, &details); err == nil {
					if details.New.JobID != nil {
						jobID = details.New.JobID
					} else if details.Old.JobID != nil {
						jobID = details.Old.JobID
					}
				}
			}

			logItems = append(logItems, dto.DatasetUpdateLog{
				ID:        log.ID,
				CreatedAt: log.CreatedAt.Time,
				Name:      log.Name,
				Act:       log.Act,
				User:      log.Username,
				Comment:   log.Comment,
				JobID:     jobID,
			})
		}
	}

	return logItems, total, nil
}

// ListDatasetUpdateLogsByProject возвращает список логов обновлений dataset по проекту
func (s *UpdateLogService) ListDatasetUpdateLogsByProject(ctx context.Context, datasetID, projectID int32, limit, offset int32) ([]dto.DatasetUpdateLog, int64, error) {
	var logItems []dto.DatasetUpdateLog
	var total int64

	if datasetID == 0 {
		// Все datasets в проекте
		logs, err := s.repo.DB.SelectAllDatasetsUpdateLogsByProjdectID(ctx, core.SelectAllDatasetsUpdateLogsByProjdectIDParams{
			ProjectID: pgtype.Int4{Int32: projectID, Valid: true},
			Offset:    offset,
			Limit:     limit,
		})
		if err != nil {
			s.repo.Logger.Error("failed to select all datasets update logs by project", err)
			return nil, 0, serviceerrors.NewInternalError("Не удалось получить логи datasets проекта", err)
		}

		for _, log := range logs {
			total = log.Total

			var jobID *int64
			if len(log.Details) > 0 {
				var details update_log.DatasetUpdateLog
				if err := json.Unmarshal(log.Details, &details); err == nil {
					if details.New.JobID != nil {
						jobID = details.New.JobID
					} else if details.Old.JobID != nil {
						jobID = details.Old.JobID
					}
				}
			}

			logItems = append(logItems, dto.DatasetUpdateLog{
				ID:        log.ID,
				CreatedAt: log.CreatedAt.Time,
				Name:      log.Name,
				Act:       log.Act,
				User:      log.Username,
				Comment:   log.Comment,
				JobID:     jobID,
			})
		}
	} else {
		// Конкретный dataset
		logs, err := s.repo.DB.SelectDatasetUpdateLogs(ctx, core.SelectDatasetUpdateLogsParams{
			DatasetID: datasetID,
			Offset:       offset,
			Limit:        limit,
		})
		if err != nil {
			s.repo.Logger.Error("failed to select dataset update logs", err)
			return nil, 0, err
		}

		for _, log := range logs {
			total = log.Total

			var jobID *int64
			if len(log.Details) > 0 {
				var details update_log.DatasetUpdateLog
				if err := json.Unmarshal(log.Details, &details); err == nil {
					if details.New.JobID != nil {
						jobID = details.New.JobID
					} else if details.Old.JobID != nil {
						jobID = details.Old.JobID
					}
				}
			}

			logItems = append(logItems, dto.DatasetUpdateLog{
				ID:        log.ID,
				CreatedAt: log.CreatedAt.Time,
				Name:      log.Name,
				Act:       log.Act,
				User:      log.Username,
				Comment:   log.Comment,
				JobID:     jobID,
			})
		}
	}

	return logItems, total, nil
}

// GetDatasetLog возвращает конкретный лог обновления dataset
func (s *UpdateLogService) GetDatasetLog(ctx context.Context, logID int32) (*dto.DatasetUpdateLog, update_log.DatasetUpdateLog, int32, int32, error) {
	log, err := s.repo.DB.SelectDatasetLog(ctx, logID)
	if err != nil {
		s.repo.Logger.Error("failed to select dataset log", err)
		return nil, update_log.DatasetUpdateLog{}, 0, 0, serviceerrors.NewNotFoundError("Лог не найден", err)
	}

	var details update_log.DatasetUpdateLog
	if err := json.Unmarshal(log.Details, &details); err != nil {
		s.repo.Logger.Error("failed to unmarshal dataset log details", err)
		return nil, update_log.DatasetUpdateLog{}, 0, 0, serviceerrors.NewInternalError("Не удалось распарсить детали лога", err)
	}

	var jobID *int64
	if details.New.JobID != nil {
		jobID = details.New.JobID
	} else if details.Old.JobID != nil {
		jobID = details.Old.JobID
	}

	result := &dto.DatasetUpdateLog{
		ID:        log.ID,
		CreatedAt: log.CreatedAt.Time,
		Act:       log.Act,
		User:      log.Username,
		Comment:   log.Comment,
		Name:      log.Name,
		JobID:     jobID,
	}

	return result, details, log.DatasetID, log.NamespaceID, nil
}

// UpdateDatasetLogComment обновляет комментарий лога dataset
func (s *UpdateLogService) UpdateDatasetLogComment(ctx context.Context, logID int32, newComment, username string) error {
	log, err := s.repo.DB.SelectDatasetLog(ctx, logID)
	if err != nil {
		s.repo.Logger.Error("failed to select dataset log", err)
		return serviceerrors.NewNotFoundError("Лог не найден", err)
	}

	if log.Username != username {
		return serviceerrors.NewForbiddenError("Вы можете редактировать только свои комментарии", nil)
	}

	err = s.repo.DB.UpdateDatasetLogComment(ctx, core.UpdateDatasetLogCommentParams{
		ID:      logID,
		Comment: newComment,
	})
	if err != nil {
		s.repo.Logger.Error("failed to update dataset log comment", err)
		return serviceerrors.NewInternalError("Не удалось обновить комментарий лога", err)
	}

	return nil
}
