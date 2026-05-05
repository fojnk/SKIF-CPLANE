package orch

import (
	"encoding/json"
	"fmt"
	"maps"
	"strconv"

	"github.com/pkg/errors"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/validation"
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
	case "kafka", "Kafka":
		return "ST_KAFKA"
	case "json":
		return "ST_STATIC_TABLE_DIR"
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

// SupervisorPipelineConfig — JSON-конфиг пайплайна для супервизора (ранее «оркестратор»).
type SupervisorPipelineConfig struct {
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

func (c SupervisorPipelineConfig) MarshalJSON() ([]byte, error) {
	result := make(map[string]any)

	result["PublicSources"] = c.PublicSources
	result["Meta"] = c.Meta

	maps.Copy(result, c.ExperimentConfig)

	marshalled, err := json.Marshal(result)
	if err != nil {
		return nil, errors.Wrap(err, "failed to marshal supervisor pipeline config")
	}

	variablesMap := make(map[string]ExperimentVariable)
	for _, v := range c.Variables {
		variablesMap[v.Name] = v
	}

	var config map[string]any
	if err := json.Unmarshal(marshalled, &config); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal supervisor pipeline config")
	}

	enriched, err := enrichValue(config, variablesMap)
	if err != nil {
		return nil, errors.Wrap(err, "failed to enrich experiment config")
	}

	return json.Marshal(enriched)
}

func ExperimentInfoToSupervisorPipelineConfig(experimentInfo *dbcore.CompleteExperimentInfoRow) (*SupervisorPipelineConfig, error) {
	var (
		projectConfig    ProjectConfig
		namespaceConfig  NamespaceConfig
		experimentConfig ExperimentConfig = make(ExperimentConfig)
		variables        []ExperimentVariable
	)

	if err := json.Unmarshal(experimentInfo.ProjectConfig, &projectConfig); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal project config")
	}

	if err := json.Unmarshal(experimentInfo.NamespaceConfig, &namespaceConfig); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal namespace config")
	}

	if err := json.Unmarshal(experimentInfo.Variables, &variables); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal variables")
	}

	if experimentInfo.ExperimentConfig.Valid {
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
	var rawDatasets []Dataset
	if err := json.Unmarshal(experimentInfo.Datasets, &rawDatasets); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal datasets")
	}

	datasets := make(map[string]PublicSource)

	for _, ds := range rawDatasets {
		var schema DatasetSchema
		if err := json.Unmarshal([]byte(ds.Schema), &schema); err != nil {
			return nil, errors.Wrap(err, fmt.Sprintf("failed to unmarshal datasets %s schema", ds.Alias))
		}

		var params DatasetParams
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

	cfg := SupervisorPipelineConfig{
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
