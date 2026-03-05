package orch

import (
	"context"
	"encoding/json"

	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/libs/models/experiment"
)


type experimentConfigWithAnyAttributes struct {
	Meta          experiment.ExperimentMeta `json:"Meta"`
	PublicSources map[string]struct {
		Attributes any `json:"Attributes"`
	} `json:"PublicSources"`
}

func GetYTWorkDir(ctx context.Context, d db.DB, l *logger.Logger, experimentID int32) (string, error) {
	experimentData, err := d.CompleteExperimentInfo(ctx, experimentID)
	if err != nil {
		return "", errors.Wrap(err, "failed to get complete experiment info from db")
	}

	orchConfig, err := ExperimentInfoToOrchestratorConfig(l, &experimentData)
	if err != nil {
		return "", errors.Wrap(err, "failed to convert experiment info to orchestrator config")
	}

	orchConfigJSON, err := json.Marshal(orchConfig)
	if err != nil {
		return "", errors.Wrap(err, "failed to marshal orchestrator config")
	}

	var configWithAnyAttrs experimentConfigWithAnyAttributes
	err = json.Unmarshal(orchConfigJSON, &configWithAnyAttrs)
	if err != nil {
		return "", errors.Wrap(err, "failed to unmarshal orchestrator config")
	}

	return configWithAnyAttrs.Meta.YT.WorkDir, nil
}

func GetMetaInfo(ctx context.Context, d db.DB, projectID, userID int32) (*models.ExperimentMeta, error) {
	projectData, err := d.SelectProject(ctx, core.SelectProjectParams{
		ID:     projectID,
		UserID: userID,
	})
	if err != nil {
		return nil, errors.Wrap(err, "failed to get project info from db")
	}

	var projectConfigParsed models.ExperimentMeta
	err = json.Unmarshal(projectData.Config, &projectConfigParsed)
	if err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal project config")
	}

	return &projectConfigParsed, nil
}

func GetDSInfo(ctx context.Context, d db.DB, datasetID int32) (*models.SourceParams, error) {
	datasetData, err := d.SelectDataset(ctx, datasetID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get dataset info from db")
	}

	var datasetConfigParsed models.SourceParams
	err = json.Unmarshal([]byte(datasetData.Params), &datasetConfigParsed)
	if err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal dataset config")
	}

	return &datasetConfigParsed, nil
}
