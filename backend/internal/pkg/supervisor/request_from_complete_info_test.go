package supervisor

import (
	"encoding/json"
	"testing"

	"github.com/jackc/pgx/v5/pgtype"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
)

func TestRequestFromCompleteInfo_enrichesInputDatasetsWhenParametersEmpty(t *testing.T) {
	tmpl := `{
  "experimentName": "demo-two-step-pipeline",
  "models": [
    {
      "modelId": "m1",
      "name": "python-preprocess",
      "order": 1,
      "version": "1.0",
      "language": "PYTHON",
      "modelPath": "model_01",
      "parameters": {}
    }
  ]
}`
	datasets := []byte(`[
  {
    "alias": "beam_input",
    "id": 1,
    "name": "Демо — параметры пучка",
    "type": "json",
    "managed": false,
    "params": {"energy_keV": 12.5, "station": "ID12"},
    "schema": {}
  }
]`)
	row := dbcore.CompleteExperimentInfoRow{
		ExperimentID:     42,
		ExperimentName:   "x",
		ExperimentConfig: pgtype.Text{String: tmpl, Valid: true},
		Datasets:         datasets,
	}
	req, err := RequestFromCompleteInfo(nil, &row)
	if err != nil {
		t.Fatalf("RequestFromCompleteInfo: %v", err)
	}
	if len(req.Models) != 1 {
		t.Fatalf("models: got %d", len(req.Models))
	}
	raw, ok := req.Models[0].Parameters["input_datasets"]
	if !ok {
		t.Fatal("expected input_datasets in parameters")
	}
	b, _ := json.Marshal(raw)
	var arr []map[string]interface{}
	if err := json.Unmarshal(b, &arr); err != nil {
		t.Fatalf("unmarshal input_datasets: %v", err)
	}
	if len(arr) != 1 {
		t.Fatalf("input_datasets len: %d", len(arr))
	}
	params, _ := arr[0]["params"].(map[string]interface{})
	if params == nil {
		t.Fatal("expected params on first input dataset")
	}
	if params["energy_keV"] != 12.5 {
		t.Fatalf("energy_keV: got %v", params["energy_keV"])
	}
}

func TestRequestFromCompleteInfo_doesNotReplacePresetInputDatasetsStrings(t *testing.T) {
	tmpl := `{
  "experimentName": "demo-two-step-pipeline",
  "models": [
    {
      "modelId": "m1",
      "name": "python-preprocess",
      "order": 1,
      "language": "PYTHON",
      "modelPath": "model_01",
      "parameters": { "input_datasets": ["beam_input"] }
    }
  ]
}`
	row := dbcore.CompleteExperimentInfoRow{
		ExperimentID:     42,
		ExperimentName:   "x",
		ExperimentConfig: pgtype.Text{String: tmpl, Valid: true},
		Datasets:         []byte(`[{"alias":"beam_input","id":1,"params":{"energy_keV":99}}]`),
	}
	req, err := RequestFromCompleteInfo(nil, &row)
	if err != nil {
		t.Fatalf("RequestFromCompleteInfo: %v", err)
	}
	raw := req.Models[0].Parameters["input_datasets"]
	b, _ := json.Marshal(raw)
	if string(b) != `["beam_input"]` {
		t.Fatalf("expected string slice preserved, got %s", string(b))
	}
}
