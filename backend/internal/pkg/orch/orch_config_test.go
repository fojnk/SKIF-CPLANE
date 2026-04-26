package orch

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestSupervisorPipelineConfig_MarshalJSON(t *testing.T) {
	cfg := SupervisorPipelineConfig{
		ExperimentConfig: map[string]any{
			"InternalSources": map[string]any{
				"resharder_queue": map[string]any{
					"SourceType":  "Q",
					"ShardsCount": 10,
				},
			},
			"Resharder": map[string]any{
				"Inputs": []map[string]any{
					{
						"Source": "@shownFeeds72",
						"Keys": []string{
							"app",
							"client",
							"feed_id",
						},
					},
				},
			},
			"Worker": map[string]any{
				"Graph": map[string]any{
					"Input": "@resharder_queue",
					"Outputs": []string{
						"@enrich_log",
					},
					"States": []string{
						"&state",
					},
					"Cubes": []map[string]any{
						{
							"Name": "get_key_from_data",
							"ExtractKey": map[string]any{
								"keys": []string{
									"app",
									"client",
									"feed_id",
								},
							},
							"Inputs": map[string]any{
								"shownFeeds72": map[string]any{
									"cube": "...",
									"name": "@shownFeeds72",
								},
								"clickFeeds": map[string]any{
									"cube": "...",
									"name": "@clickFeeds",
								},
								"sentFeeds72": map[string]any{
									"cube": "...",
									"name": "@sentFeeds72",
								},
							},
							"Outputs": []string{
								"keys",
							},
						},
					},
				},
			},
			"json_key":   "${json_var}",
			"string_key": "${string_var}",
			"yql_key":    "${yql_var}",
			"int_key":    "${int_var}",
		},
		PublicSources: map[string]PublicSource{
			"shownFeeds72": {
				Schema: &DatasetSchema{
					"field": "type",
				},
				Params: map[string]any{
					"YT": map[string]any{
						"cluster": "miranda",
						"path":    "//home/ok_log/shownFeeds72",
					},
					"ShardsCount": 10,
				},
				SourceType: "ST_EXTERNAL_QUEUE",
			},
		},
		Meta: Meta{
			ExperimentID:   "123",
			ExperimentName: "test",
			Project:      "test",
			ProjectID:    "123",
			Namespace:    "test",
			NamespaceID:  "123",
			ProjectConfig: map[string]any{
				"YT": map[string]any{
					"Cluster":   "miranda",
					"Token":     "test",
					"ProxyRole": "test",
					"Bundle":    "test",
					"WorkDir":   "test",
				},
			},
			NamespaceConfig: map[string]any{
				"YT": map[string]any{
					"Cluster":   "mirandaNamespaceParam",
					"Token":     "test",
					"ProxyRole": "test",
					"Bundle":    "test",
					"WorkDir":   "test",
				},
			},
		},

		Variables: []ExperimentVariable{
			{Name: "json_var", Value: "{\"key\": \"value\"}", Type: ExperimentVariableTypeJSON},
			{Name: "string_var", Value: "test_value", Type: ExperimentVariableTypeString},
			{Name: "yql_var", Value: "select 1", Type: ExperimentVariableTypeYQL},
			{Name: "int_var", Value: "1", Type: ExperimentVariableTypeInt},
		},
	}

	cfgJSON, err := json.Marshal(cfg)
	require.NoError(t, err)

	expectedConfig, err := os.ReadFile("expected_config.json")
	require.NoError(t, err)

	require.JSONEq(t, string(expectedConfig), string(cfgJSON))
}

func TestSupervisorPipelineConfigDatasetSchemaV2_MarshalJSON(t *testing.T) {
	cfg := SupervisorPipelineConfig{
		ExperimentConfig: map[string]any{
			"InternalSources": map[string]any{
				"resharder_queue": map[string]any{
					"SourceType":  "Q",
					"ShardsCount": 10,
				},
			},
			"Resharder": map[string]any{
				"Inputs": []map[string]any{
					{
						"Source": "@shownFeeds72",
						"Keys": []string{
							"app",
							"client",
							"feed_id",
						},
					},
				},
			},
			"Worker": map[string]any{
				"Graph": map[string]any{
					"Input": "@resharder_queue",
					"Outputs": []string{
						"@enrich_log",
					},
					"States": []string{
						"&state",
					},
					"Cubes": []map[string]any{
						{
							"Name": "get_key_from_data",
							"ExtractKey": map[string]any{
								"keys": []string{
									"app",
									"client",
									"feed_id",
								},
							},
							"Inputs": map[string]any{
								"shownFeeds72": map[string]any{
									"cube": "...",
									"name": "@shownFeeds72",
								},
								"clickFeeds": map[string]any{
									"cube": "...",
									"name": "@clickFeeds",
								},
								"sentFeeds72": map[string]any{
									"cube": "...",
									"name": "@sentFeeds72",
								},
							},
							"Outputs": []string{
								"keys",
							},
						},
					},
				},
			},
			"json_key":   "${json_var}",
			"string_key": "${string_var}",
			"yql_key":    "${yql_var}",
			"int_key":    "${int_var}",
		},
		PublicSources: map[string]PublicSource{
			"shownFeeds72": {
				DataSchema: &DatasetSchema{
					"columns": []map[string]any{
						{
							"column_name": "test",
							"type":        "string",
						},
					},
				},
				Params: map[string]any{
					"YT": map[string]any{
						"cluster": "miranda",
						"path":    "//home/ok_log/shownFeeds72",
					},
					"ShardsCount": 10,
				},
				SourceType: "ST_EXTERNAL_QUEUE",
			},
		},
		Meta: Meta{
			ExperimentID:   "123",
			ExperimentName: "test",
			Project:      "test",
			ProjectID:    "123",
			Namespace:    "test",
			NamespaceID:  "123",
			ProjectConfig: map[string]any{
				"YT": map[string]any{
					"Cluster":   "miranda",
					"Token":     "test",
					"ProxyRole": "test",
					"Bundle":    "test",
					"WorkDir":   "test",
				},
			},
			NamespaceConfig: map[string]any{
				"YT": map[string]any{
					"Cluster":   "mirandaNamespaceParam",
					"Token":     "test",
					"ProxyRole": "test",
					"Bundle":    "test",
					"WorkDir":   "test",
				},
			},
		},

		Variables: []ExperimentVariable{
			{Name: "json_var", Value: "{\"key\": \"value\"}", Type: ExperimentVariableTypeJSON},
			{Name: "string_var", Value: "test_value", Type: ExperimentVariableTypeString},
			{Name: "yql_var", Value: "select 1", Type: ExperimentVariableTypeYQL},
			{Name: "int_var", Value: "1", Type: ExperimentVariableTypeInt},
		},
	}

	cfgJSON, err := json.Marshal(cfg)
	require.NoError(t, err)

	expectedConfig, err := os.ReadFile("expected_config_v2.json")
	require.NoError(t, err)

	require.JSONEq(t, string(expectedConfig), string(cfgJSON))
}
