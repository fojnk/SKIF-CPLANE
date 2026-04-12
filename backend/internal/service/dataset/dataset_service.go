package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/datasettype"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type DatasetService struct {
	repo *repository.Repository
}

func NewDatasetService(repo *repository.Repository) *DatasetService {
	return &DatasetService{repo: repo}
}

// Utility functions moved from handlers/shared to avoid circular dependency
func UpdateValueString(prev, new string) string {
	if new != "" {
		return new
	}
	return prev
}

func UpdateValueBoolean(prev bool, new *bool) bool {
	if new != nil {
		return *new
	}
	return prev
}

func GetYTPathAndCluster(dsParams string) (string, string) {
	var sourceParams models.SourceParams
	err := json.Unmarshal([]byte(dsParams), &sourceParams)
	if err != nil {
		return "", ""
	}

	if sourceParams.YT == nil {
		return "", ""
	}

	return sourceParams.YT.Path, sourceParams.YT.Cluster
}

func GetKafkaBrokersAndTopic(dsParams string) (string, string) {
	var sourceParams models.SourceParams
	err := json.Unmarshal([]byte(dsParams), &sourceParams)
	if err != nil {
		return "", ""
	}

	if sourceParams.Kafka == nil {
		return "", ""
	}

	return sourceParams.Kafka.BootstrapServers, sourceParams.Kafka.SrcTopic
}

func (s *DatasetService) checkDatasetDuplicate(ctx context.Context, dataset *dto.Dataset) error {
	var ids []int32
	var err error
	switch {
	case datasettype.UsesYTDeduplication(dataset.Type):
		path, cluster := GetYTPathAndCluster(dataset.Params)
		if path != "" && cluster != "" {
			ids, err = s.repo.DB.CheckYTDatasetDuplicate(ctx, dbcore.CheckYTDatasetDuplicateParams{
				Cluster: cluster,
				Path:    path,
			})

		}
	case datasettype.IsKafka(dataset.Type):
		// TODO  нужно найти способ определять дубликаты по адреса брокера более правильно (сейчас по строке 1 к 1)
		brokers, topic := GetKafkaBrokersAndTopic(dataset.Params)
		if brokers != "" && topic != "" {
			ids, err = s.repo.DB.CheckKafkaDatasetDuplicate(ctx, dbcore.CheckKafkaDatasetDuplicateParams{
				Brokers: brokers,
				Topic:   topic,
			})
		}
	default:
		return serviceerrors.NewBadRequestError(fmt.Sprintf("Can't detect dataset duplicate for type %s", dataset.Type), nil)
	}
	if err != nil {
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	alreadyDuplicated := false
	for _, id := range ids {
		if id == dataset.ID {
			alreadyDuplicated = true
			break
		}
	}

	if len(ids) > 0 && !alreadyDuplicated {
		return serviceerrors.NewConflictError(fmt.Sprintf("Dataset уже существует: %v", ids), nil)
	}

	return nil
}

func (s *DatasetService) CreateDataset(ctx context.Context, dataset *dto.Dataset, inputProjectID int32, comment string, u *user.UserInfo) (*dto.Dataset, error) {
	if !datasettype.IsAllowedOnCreate(dataset.Type) {
		return nil, serviceerrors.NewEntityBadRequestError(serviceerrors.EntityDataset, "допустимые типы датасорса: json, kafka", nil)
	}

	if dataset.Params == "" {
		dataset.Params = "{}"
	}

	err := s.checkDatasetDuplicate(ctx, dataset)
	if err != nil {
		return nil, err
	}

	schema := "{}"
	if dataset.Schema != "" {
		schema = dataset.Schema
	}

	projectID := pgtype.Int4{Valid: false}
	if inputProjectID != 0 {
		projectID = pgtype.Int4{Int32: inputProjectID, Valid: true}
	}

	insertedDataset, err := s.repo.DB.InsertDataset(ctx, dbcore.InsertDatasetParams{
		Name:      dataset.Name,
		ProjectID: projectID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert dataset", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	datasetVersion, err := s.repo.DB.InsertDatasetVersion(ctx, dbcore.InsertDatasetVersionParams{
		DatasetID: pgtype.Int4{Int32: insertedDataset.ID, Valid: true},
		Type:         dataset.Type,
		Schema:       schema,
		Params:       dataset.Params,
		Managed:      false,
		Public:       dataset.Public,
		Creator:      u.Username,
		Comment:      comment,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert dataset version", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	_, err = s.repo.DB.UpdateDatasetVersion(ctx, dbcore.UpdateDatasetVersionParams{
		ID:        insertedDataset.ID,
		VersionID: datasetVersion.ID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert dataset version", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	return &dto.Dataset{
		Name:      insertedDataset.Name,
		Type:      datasetVersion.Type,
		Params:    datasetVersion.Params,
		Schema:    datasetVersion.Schema,
		Public:    datasetVersion.Public,
		Managed:   datasetVersion.Managed,
		ID:        insertedDataset.ID,
		ProjectID: insertedDataset.ProjectID,
	}, nil
}

func (s *DatasetService) UpdateDataset(ctx context.Context, updatedDataset *dto.Dataset, public *bool, comment, username string) (*dto.Dataset, error) {
	dataset, err := s.repo.DB.SelectDataset(ctx, updatedDataset.ID)
	if err != nil {
		s.repo.Logger.Error("failed to get dataset", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	if updatedDataset.Type == "" {
		updatedDataset.Type = dataset.Type
	} else if !datasettype.IsAllowedOnCreate(updatedDataset.Type) {
		return nil, serviceerrors.NewEntityBadRequestError(serviceerrors.EntityDataset, "допустимые типы датасорса: json, kafka", nil)
	}

	err = s.checkDatasetDuplicate(ctx, updatedDataset)
	if err != nil {
		return nil, err
	}

	if dataset.Name != updatedDataset.Name {
		_, err := s.repo.DB.UpdateDataset(ctx, dbcore.UpdateDatasetParams{
			ID:   updatedDataset.ID,
			Name: updatedDataset.Name,
		})
		if err != nil {
			s.repo.Logger.Error("failed to update dataset", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
		}
	}

	shouldCreateVersion := false
	updateValues := dbcore.InsertDatasetVersionParams{
		DatasetID: pgtype.Int4{Int32: dataset.ID, Valid: true},
		Type:         dataset.Type,
		Schema:       dataset.Schema,
		Params:       dataset.Params,
		Managed:      dataset.Managed,
		Public:       dataset.Public,
		Comment:      comment,
		Creator:      username,
	}

	if updatedDataset.Type != "" && updatedDataset.Type != dataset.Type {
		updateValues.Type = updatedDataset.Type
		shouldCreateVersion = true
	}

	if updatedDataset.Schema != "" && updatedDataset.Schema != dataset.Schema {
		updateValues.Schema = updatedDataset.Schema
		shouldCreateVersion = true
	}

	if updatedDataset.Params != "" && updatedDataset.Params != dataset.Params {
		updateValues.Params = updatedDataset.Params
		shouldCreateVersion = true
	}

	if public != nil && *public != dataset.Public {
		updateValues.Public = *public
		shouldCreateVersion = true
	}

	if shouldCreateVersion {
		updatedVersion, err := s.repo.DB.InsertDatasetVersion(ctx, updateValues)
		if err != nil {
			s.repo.Logger.Error("failed to insert dataset version", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
		}

		_, err = s.repo.DB.UpdateDatasetVersion(ctx, dbcore.UpdateDatasetVersionParams{
			ID:        dataset.ID,
			VersionID: updatedVersion.ID,
		})
		if err != nil {
			s.repo.Logger.Error("failed to update dataset version", err)
			return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
		}
	}

	newDataset, err := s.repo.DB.SelectDataset(ctx, updatedDataset.ID)
	if err != nil {
		s.repo.Logger.Error("failed to get dataset", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	return &dto.Dataset{
		Name:    newDataset.Name,
		Type:    newDataset.Type,
		Params:  newDataset.Params,
		Schema:  newDataset.Schema,
		Public:  newDataset.Public,
		Managed: newDataset.Managed,
		ID:      newDataset.ID,
	}, nil
}

func (s *DatasetService) ListDatasetByProject(ctx context.Context, projectID int32) (*[]dto.Dataset, error) {
	dataSources, err := s.repo.DB.SelectDatasetsByProjectId(ctx, pgtype.Int4{Int32: projectID, Valid: true})
	if err != nil {
		s.repo.Logger.Error("failed to get datasets", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	dsList := make([]dto.Dataset, len(dataSources))
	for i, ds := range dataSources {
		dsList[i] = dto.Dataset{
			ID:      ds.ID,
			Name:    ds.Name,
			Type:    ds.Type,
			Params:  ds.Params,
			Schema:  ds.Schema,
			Public:  ds.Public,
			Managed: ds.Managed,
		}
	}

	return &dsList, nil
}

func (s *DatasetService) GetDataset(ctx context.Context, datasetID int32) (*dto.DatasetWithProject, error) {
	ds, err := s.repo.DB.SelectDataset(ctx, datasetID)
	if err != nil {
		s.repo.Logger.Error("failed to select dataset", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	return &dto.DatasetWithProject{
		ID:        ds.ID,
		Name:      ds.Name,
		Type:      ds.Type,
		Params:    ds.Params,
		Schema:    ds.Schema,
		Public:    ds.Public,
		Managed:   ds.Managed,
		ProjectID: ds.ProjectID,
	}, nil
}

func (s *DatasetService) DeleteDataset(ctx context.Context, datasetID int32) error {

	_, err := s.repo.DB.SelectDataset(ctx, datasetID)
	if err != nil {
		s.repo.Logger.Error("failed to select dataset", err)
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	linksCount, err := s.repo.DB.GetLinksCountByDatasetID(ctx, datasetID)
	if err != nil {
		s.repo.Logger.Error("failed to get dataset links count", err)
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	if linksCount > 0 {
		return serviceerrors.NewConflictError("Невозможно удалить dataset: существуют связи с пайплайнами", nil)
	}

	err = s.repo.DB.DeleteDataset(ctx, datasetID)
	if err != nil {
		s.repo.Logger.Error("failed to delete dataset", err)
		return serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	return nil
}

// CopyDataset копирует датасорс с новым именем
func (s *DatasetService) CopyDataset(ctx context.Context, srcDatasetID int32, newName string, targetProjectID int32, username string) (*dto.Dataset, error) {
	dataset, err := s.repo.DB.SelectDataset(ctx, srcDatasetID)
	if err != nil {
		s.repo.Logger.Error("failed to select dataset", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	params := "{}"

	schema := "{}"
	if dataset.Schema != "" {
		schema = dataset.Schema
	}

	project := pgtype.Int4{Valid: false}
	if targetProjectID != 0 || dataset.ProjectID.Valid {
		if dataset.ProjectID.Valid {
			project = pgtype.Int4{Int32: dataset.ProjectID.Int32, Valid: true}
		}
		if targetProjectID != 0 {
			project = pgtype.Int4{Int32: targetProjectID, Valid: true}
		}
	}

	newDataset, err := s.repo.DB.InsertDataset(ctx, dbcore.InsertDatasetParams{
		Name:      newName,
		ProjectID: project,
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert dataset", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	datasetVersion, err := s.repo.DB.InsertDatasetVersion(ctx, dbcore.InsertDatasetVersionParams{
		DatasetID: pgtype.Int4{Int32: newDataset.ID, Valid: true},
		Type:         dataset.Type,
		Schema:       schema,
		Params:       params,
		Managed:      dataset.Managed,
		Public:       dataset.Public,
		Creator:      username,
		Comment:      "copied dataset",
	})
	if err != nil {
		s.repo.Logger.Error("failed to insert dataset version", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	_, err = s.repo.DB.UpdateDatasetVersion(ctx, dbcore.UpdateDatasetVersionParams{
		ID:        newDataset.ID,
		VersionID: datasetVersion.ID,
	})
	if err != nil {
		s.repo.Logger.Error("failed to update dataset version", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	return &dto.Dataset{
		ID:      newDataset.ID,
		Name:    newDataset.Name,
		Type:    dataset.Type,
		Params:  params,
		Schema:  schema,
		Public:  dataset.Public,
		Managed: dataset.Managed,
	}, nil
}

// SearchDatasets выполняет поиск датасорсов с фильтрами
func (s *DatasetService) SearchDatasets(ctx context.Context, params dbcore.SelectDatasetsParams) ([]dbcore.SelectDatasetsRow, error) {
	datasets, err := s.repo.DB.SelectDatasets(ctx, params)
	if err != nil {
		s.repo.Logger.Error("failed to search datasets", err)
		return nil, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	return datasets, nil
}

// GetDatasetWithProjectInfo получает датасорс с информацией о проекте
func (s *DatasetService) GetDatasetWithProjectInfo(ctx context.Context, datasetID, userID int32) (*dto.Dataset, string, int32, error) {
	dataset, err := s.repo.DB.SelectDataset(ctx, datasetID)
	if err != nil {
		s.repo.Logger.Error("failed to select dataset", err)
		return nil, "", 0, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	result := &dto.Dataset{
		ID:      dataset.ID,
		Name:    dataset.Name,
		Type:    dataset.Type,
		Params:  dataset.Params,
		Schema:  dataset.Schema,
		Public:  dataset.Public,
		Managed: dataset.Managed,
	}

	var projectName string
	var projectID int32

	if dataset.ProjectID.Valid {
		project, err := s.repo.DB.SelectProject(ctx, dbcore.SelectProjectParams{
			ID:     dataset.ProjectID.Int32,
			UserID: userID,
		})
		if err != nil {
			s.repo.Logger.Error("failed to select project", err)
		} else {
			projectName = project.Name
			projectID = project.ID
		}
	}

	return result, projectName, projectID, nil
}

// GetDatasetLinkedExperiments получает список experiment, связанных с датасорсом
func (s *DatasetService) GetDatasetLinkedExperiments(ctx context.Context, datasetID int32, limit, offset int32) ([]dto.DatasetExperimentLink, int64, error) {
	experimentLinks, err := s.repo.DB.GetDatasetLinkedExperiments(ctx, dbcore.GetDatasetLinkedExperimentsParams{
		DatasetID: datasetID,
		Limit:        limit,
		Offset:       offset,
	})
	if err != nil {
		s.repo.Logger.Error("failed to get linked experiments", err)
		return nil, 0, serviceerrors.ConvertPostgresError(err, serviceerrors.EntityDataset)
	}

	var total int64
	list := make([]dto.DatasetExperimentLink, len(experimentLinks))
	for i, experiment := range experimentLinks {
		total = experiment.Total

		list[i] = dto.DatasetExperimentLink{
			ExperimentID:   experiment.ExperimentID.Int32,
			ExperimentName: experiment.ExperimentName.String,
			ProjectID:    experiment.ProjectID.Int32,
			ProjectName:  experiment.ProjectName.String,
			Alias:        experiment.Alias,
		}
	}

	return list, total, nil
}

// GetDatasetYTURL возвращает YT URL для dataset
func (s *DatasetService) GetDatasetYTURL(ctx context.Context, datasetID int32) (string, error) {
	meta, err := orch.GetDSInfo(ctx, s.repo.DB, datasetID)
	if err != nil {
		s.repo.Logger.Error("failed to get DS info", err)
		return "https://yt.vk.team", nil
	}

	if meta.YT == nil {
		return "", serviceerrors.NewNotFoundError("YT секция в конфигурации источника не представлена", nil)
	}

	var clusterName string
	parts := strings.Split(meta.YT.Cluster, ".")
	if len(parts) > 0 {
		clusterName = parts[0]
	}

	url, ok := s.repo.Config.DatasetURLs["yt_work_dir"]
	if !ok {
		return "", serviceerrors.NewNotFoundError("URL для dataset не найден в конфигурации", nil)
	}

	newURL := url.URL

	if strings.Contains(newURL, "CLUSTER_NAME") {
		if clusterName != "" {
			newURL = strings.ReplaceAll(newURL, "CLUSTER_NAME", clusterName)
		} else {
			newURL = "https://yt.vk.team"
		}
	}

	if strings.Contains(newURL, "YT_WORK_DIR") {
		if meta.YT.Path != "" {
			newURL = strings.ReplaceAll(newURL, "YT_WORK_DIR", meta.YT.Path)
		} else {
			newURL = "https://yt.vk.team"
		}
	}

	return newURL, nil
}

// GetAvailableClusters возвращает список доступных кластеров
func (s *DatasetService) GetAvailableClusters() []dto.Cluster {
	return []dto.Cluster{
		dto.Miranda,
		dto.MercuryKC,
		dto.MercuryPC,
		dto.MercuryHC,
		dto.MercuryRC,
		dto.MercuryUC,
		dto.Jupiter,
		dto.Moon,
		dto.Saturn,
	}
}
