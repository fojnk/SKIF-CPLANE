// Package supervisorenrich подставляет переменные пайплайна в JSON запроса супервизора (без цикла импортов supervisor → orch).
package supervisorenrich

import (
	"encoding/json"

	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/supervisor"
)

// ApplyExperimentVariables обогащает запрос значениями из t_experiment_variable (как для старого SupervisorPipelineConfig).
func ApplyExperimentVariables(req *supervisor.ExperimentRequest, variablesJSON []byte) error {
	if req == nil || len(variablesJSON) == 0 {
		return nil
	}
	var vars []orch.ExperimentVariable
	if err := json.Unmarshal(variablesJSON, &vars); err != nil {
		return errors.Wrap(err, "переменные пайплайна")
	}
	if len(vars) == 0 {
		return nil
	}
	varsMap := make(map[string]orch.ExperimentVariable, len(vars))
	for _, v := range vars {
		varsMap[v.Name] = v
	}
	body, err := json.Marshal(req)
	if err != nil {
		return errors.Wrap(err, "marshal for enrich")
	}
	var root any
	if err := json.Unmarshal(body, &root); err != nil {
		return errors.Wrap(err, "unmarshal for enrich")
	}
	enriched, err := orch.EnrichAnyWithVariables(root, varsMap)
	if err != nil {
		return errors.Wrap(err, "обогащение переменными")
	}
	out, err := json.Marshal(enriched)
	if err != nil {
		return errors.Wrap(err, "marshal after enrich")
	}
	var res supervisor.ExperimentRequest
	if err := json.Unmarshal(out, &res); err != nil {
		return errors.Wrap(err, "unmarshal after enrich")
	}
	res.ExperimentID = req.ExperimentID
	res.ExperimentName = req.ExperimentName
	for i := range res.Models {
		if res.Models[i].Parameters == nil {
			res.Models[i].Parameters = map[string]interface{}{}
		}
	}
	*req = res
	return nil
}
