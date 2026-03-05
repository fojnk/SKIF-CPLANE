package orch

import (
	"encoding/json"
	"fmt"
	"maps"
	"strconv"

	"github.com/pkg/errors"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/validation"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
)

type ExperimentConfig map[string]any

type ProjectConfig map[string]any

type NamespaceConfig map[string]any

type DatasetSchema map[string]any

type DatasetParams map[string]any

type PublicSource struct {
	Schema     *DatasetSchema `json:"Schema"`
	DataSchema *DatasetSchema `json:"DataSchema"`
	Params     DatasetParams  `json:"-"`
	SourceType string            `json:"SourceType"`
}

func getSourceType(dsType string, Managed bool) string {
	switch dsType {
	case "Kafka":
		return "ST_KAFKA"
	case "Queue":
		if Managed {
			return "ST_QUEUE"
		}
		return "ST_EXTERNAL_QUEUE"
	case "KeyValue":
		if Managed {
			return "ST_KEY_VALUE"
		}
		return "ST_EXTERNAL_KEY_VALUE"
	case "StaticTableDir":
		return "ST_STATIC_TABLE_DIR"
	}
	return ""
}

type ExperimentVariable struct {
	Name  string               `json:"name"`
	Value string               `json:"value"`
	Type  ExperimentVariableType `json:"type"`
}

type Meta struct {
	ExperimentID      string `json:"ExperimentId"`
	ExperimentName    string `json:"ExperimentName"`
	Project         string `json:"Project"`
	ProjectID       string `json:"ProjectId"`
	Namespace       string `json:"Namespace"`
	NamespaceID     string `json:"NamespaceId"`
	ProjectConfig   `json:"-"`
	NamespaceConfig `json:"-"`
}

type OrchestratorConfig struct {
	Meta           Meta `json:"Meta"`
	ExperimentConfig `json:"-"`
	PublicSources  map[string]PublicSource `json:"PublicSources"`

	Variables []ExperimentVariable `json:"-"`
}

func (ps PublicSource) MarshalJSON() ([]byte, error) {
	result := make(map[string]any)

	if ps.Schema != nil {
		result["Schema"] = ps.Schema
	}
	if ps.DataSchema != nil {
		result["DataSchema"] = ps.DataSchema
	}
	result["SourceType"] = ps.SourceType

	maps.Copy(result, ps.Params)

	return json.Marshal(result)
}

func (m Meta) MarshalJSON() ([]byte, error) {
	result := make(map[string]any)

	result["ExperimentId"] = m.ExperimentID
	result["ExperimentName"] = m.ExperimentName
	result["Project"] = m.Project
	result["Namespace"] = m.Namespace
	result["ProjectId"] = m.ProjectID
	result["NamespaceId"] = m.NamespaceID

	maps.Copy(result, m.NamespaceConfig)
	maps.Copy(result, m.ProjectConfig)

	return json.Marshal(result)
}

func (c OrchestratorConfig) MarshalJSON() ([]byte, error) {
	result := make(map[string]any)

	result["PublicSources"] = c.PublicSources
	result["Meta"] = c.Meta

	maps.Copy(result, c.ExperimentConfig)

	marshalled, err := json.Marshal(result)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal orchestrator config")
	}

	variablesMap := make(map[string]ExperimentVariable)
	for _, v := range c.Variables {
		variablesMap[v.Name] = v
	}

	var config map[string]any
	if err := json.Unmarshal(marshalled, &config); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal orchestrator config")
	}

	enriched, err := enrichValue(config, variablesMap)
	if err != nil {
		return nil, errors.Wrap(err, "failed to enrich experiment config")
	}

	return json.Marshal(enriched)
}

func ExperimentInfoToOrchestratorConfig(l *logger.Logger, experimentInfo *dbcore.CompleteExperimentInfoRow) (*OrchestratorConfig, error) {
	var (
		projectConfig   ProjectConfig
		namespaceConfig NamespaceConfig
		experimentConfig  ExperimentConfig = make(ExperimentConfig)
		variables       []ExperimentVariable
	)

	l.Debug(fmt.Sprintf("experimentInfo.ProjectConfig: %s", string(experimentInfo.ProjectConfig)))
	if err := json.Unmarshal(experimentInfo.ProjectConfig, &projectConfig); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal project config")
	}

	l.Debug(fmt.Sprintf("experimentInfo.NamespaceConfig: %s", string(experimentInfo.NamespaceConfig)))
	if err := json.Unmarshal(experimentInfo.NamespaceConfig, &namespaceConfig); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal namespace config")
	}

	l.Debug(fmt.Sprintf("experimentInfo.Variables: %s", string(experimentInfo.Variables)))
	if err := json.Unmarshal(experimentInfo.Variables, &variables); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal variables")
	}

	l.Debug(fmt.Sprintf("experimentInfo.ExperimentConfig: %s", experimentInfo.ExperimentConfig.String))
	if experimentInfo.ExperimentConfig.Valid {
		l.Debug(fmt.Sprintf("config: %s", experimentInfo.ExperimentConfig.String))
		if err := json.Unmarshal([]byte(experimentInfo.ExperimentConfig.String), &experimentConfig); err != nil {
			return nil, errors.Wrap(err, "failed to unmarshal experiment config")
		}
	}
	//
	type Dataset struct {
		Alias   string `json:"alias"`
		Schema  string `json:"schema"`
		Params  string `json:"params"`
		Type    string `json:"type"`
		Managed bool   `json:"managed"`
	}
	l.Debug(fmt.Sprintf("experimentInfo.Datasets: %s", string(experimentInfo.Datasets)))
	var rawDatasets []Dataset
	if err := json.Unmarshal(experimentInfo.Datasets, &rawDatasets); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal datasets")
	}

	datasets := make(map[string]PublicSource)

	for _, ds := range rawDatasets {
		var schema DatasetSchema
		l.Debug(fmt.Sprintf("ds.Schema: %s", ds.Schema))
		if err := json.Unmarshal([]byte(ds.Schema), &schema); err != nil {
			return nil, errors.Wrap(err, fmt.Sprintf("failed to unmarshal datasets %s schema", ds.Alias))
		}

		var params DatasetParams
		l.Debug(fmt.Sprintf("ds.Params: %s", ds.Params))
		if err := json.Unmarshal([]byte(ds.Params), &params); err != nil {
			return nil, errors.Wrap(err, fmt.Sprintf("failed to unmarshal datasets %s params", ds.Alias))
		}

		sourceType := getSourceType(ds.Type, ds.Managed)
		if sourceType == "" {
			return nil, errors.New("invalid dataset type")
		}

		ps := PublicSource{
			Params:     params,
			SourceType: sourceType,
		}

		// check that new version of schema passes validation, if error - use old version
		if err := validation.DatasetDataSchemaValidation(ds.Schema); err != nil {
			ps.Schema = &schema
		} else {
			ps.DataSchema = &schema
		}

		datasets[ds.Alias] = ps
	}

	projectID := strconv.Itoa(int(experimentInfo.ProjectID))
	namespaceID := strconv.Itoa(int(experimentInfo.NamespaceID))

	if experimentInfo.AbcProductID != "" {
		projectConfig["AbcProductId"] = experimentInfo.AbcProductID
	}

	cfg := OrchestratorConfig{
		Meta: Meta{
			ExperimentID:      experimentInfo.ExperimentOrchID.String,
			ExperimentName:    experimentInfo.ExperimentName,
			Project:         experimentInfo.ProjectName,
			ProjectID:       projectID,
			Namespace:       experimentInfo.NamespaceName,
			NamespaceID:     namespaceID,
			ProjectConfig:   projectConfig,
			NamespaceConfig: namespaceConfig,
		},
		ExperimentConfig: experimentConfig,
		PublicSources:  datasets,

		Variables: variables,
	}

	return &cfg, nil
}
