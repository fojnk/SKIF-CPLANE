// Package supervisor — формат конфига эксперимента для Java-супервизора (RequestExperimentFromClient).
package supervisor

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/pkg/errors"
	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
)

// ModelLanguage совпадает с enum ModelLanguage в skif_platform_supervisor.
type ModelLanguage string

const (
	LanguageJava   ModelLanguage = "JAVA"
	LanguagePython ModelLanguage = "PYTHON"
	LanguageCSharp ModelLanguage = "CSHARP"
	LanguageCPP    ModelLanguage = "CPP"
	LanguageC      ModelLanguage = "C"
)

// ModelRequest — одна модель в пайплайне (Java ModelRequest).
type ModelRequest struct {
	ModelID    string                 `json:"modelId"`
	Name       string                 `json:"name,omitempty"`
	Order      int                    `json:"order"`
	Version    string                 `json:"version,omitempty"`
	Language   ModelLanguage          `json:"language"`
	ModelPath  string                 `json:"modelPath"`
	Parameters map[string]interface{} `json:"parameters,omitempty"`
}

// ExperimentRequest — тело сообщения experiment.start / experiment.apply для супервизора.
type ExperimentRequest struct {
	ExperimentID   int64          `json:"experimentId"`
	ExperimentName string         `json:"experimentName,omitempty"`
	Models         []ModelRequest `json:"models"`
}

type datasetAliasBinding struct {
	Alias   string                 `json:"alias"`
	ID      int64                  `json:"id,omitempty"`
	Name    string                 `json:"name,omitempty"`
	Type    string                 `json:"type,omitempty"`
	Managed bool                   `json:"managed,omitempty"`
	Params  map[string]interface{} `json:"params,omitempty"`
	Schema  map[string]interface{} `json:"schema,omitempty"`
}

// IsSupervisorExperimentLayout определяет конфиг шаблона супервизора: верхнеуровневый массив models.
func IsSupervisorExperimentLayout(configJSON []byte) bool {
	if len(strings.TrimSpace(string(configJSON))) == 0 {
		return false
	}
	var probe struct {
		Models json.RawMessage `json:"models"`
	}
	if err := json.Unmarshal(configJSON, &probe); err != nil {
		return false
	}
	if len(probe.Models) == 0 || string(probe.Models) == "null" {
		return false
	}
	var arr []json.RawMessage
	return json.Unmarshal(probe.Models, &arr) == nil && len(arr) > 0
}

// RequestFromCompleteInfo собирает и обогащает запрос из версии шаблона пайплайна и переменных БД.
func RequestFromCompleteInfo(l *logger.Logger, info *dbcore.CompleteExperimentInfoRow) (*ExperimentRequest, error) {
	if info == nil {
		return nil, errors.New("complete experiment info is nil")
	}
	if !info.ExperimentConfig.Valid || strings.TrimSpace(info.ExperimentConfig.String) == "" {
		return nil, errors.New("конфиг пайплайна пуст")
	}
	raw := []byte(info.ExperimentConfig.String)
	if !IsSupervisorExperimentLayout(raw) {
		return nil, errors.New("конфиг не в формате супервизора: ожидается JSON с непустым массивом \"models\"")
	}

	var parsed ExperimentRequest
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return nil, errors.Wrap(err, "не удалось разобрать конфиг супервизора")
	}
	if len(parsed.Models) == 0 {
		return nil, errors.New("в конфиге супервизора нужен непустой массив models")
	}
	for i := range parsed.Models {
		if err := validateModel(i, &parsed.Models[i]); err != nil {
			return nil, err
		}
	}

	req := &ExperimentRequest{
		ExperimentID:   int64(info.ExperimentID),
		ExperimentName: firstNonEmpty(parsed.ExperimentName, info.ExperimentName),
		Models:         parsed.Models,
	}
	attachDatasetsToModelParameters(req, info.Datasets)

	if l != nil {
		l.Debug(fmt.Sprintf("supervisor experiment request built: id=%d models=%d", req.ExperimentID, len(req.Models)))
	}
	return req, nil
}

func firstNonEmpty(a, b string) string {
	if strings.TrimSpace(a) != "" {
		return a
	}
	return b
}

func validateModel(i int, m *ModelRequest) error {
	if strings.TrimSpace(m.ModelID) == "" {
		return fmt.Errorf("models[%d]: поле modelId обязательно", i)
	}
	if m.Order <= 0 {
		return fmt.Errorf("models[%d]: order должен быть > 0", i)
	}
	if m.Language == "" {
		return fmt.Errorf("models[%d]: language обязателен", i)
	}
	switch m.Language {
	case LanguageJava, LanguagePython, LanguageCSharp, LanguageCPP, LanguageC:
	default:
		return fmt.Errorf("models[%d]: неизвестный language %q (ожидается JAVA, PYTHON, CSHARP, CPP, C)", i, m.Language)
	}
	if strings.TrimSpace(m.ModelPath) == "" {
		return fmt.Errorf("models[%d]: modelPath обязателен", i)
	}
	if m.Parameters == nil {
		m.Parameters = map[string]interface{}{}
	}
	return nil
}

func attachDatasetsToModelParameters(req *ExperimentRequest, datasetsJSON []byte) {
	if req == nil || len(req.Models) == 0 || len(datasetsJSON) == 0 {
		return
	}

	var raw []map[string]interface{}
	if err := json.Unmarshal(datasetsJSON, &raw); err != nil || len(raw) == 0 {
		return
	}

	all := make([]datasetAliasBinding, 0, len(raw))
	inputs := make([]datasetAliasBinding, 0, len(raw))
	outputs := make([]datasetAliasBinding, 0, len(raw))

	for _, item := range raw {
		alias := strings.TrimSpace(toString(item["alias"]))
		if alias == "" {
			continue
		}
		ds := datasetAliasBinding{
			Alias:   alias,
			ID:      toInt64(item["id"]),
			Name:    strings.TrimSpace(toString(item["name"])),
			Type:    strings.TrimSpace(toString(item["type"])),
			Managed: toBool(item["managed"]),
			Params:  toMap(item["params"]),
			Schema:  toMap(item["schema"]),
		}
		all = append(all, ds)
		lowerAlias := strings.ToLower(alias)
		if strings.Contains(lowerAlias, "input") || strings.Contains(lowerAlias, "source") || strings.Contains(lowerAlias, "src") {
			inputs = append(inputs, ds)
		}
		if strings.Contains(lowerAlias, "output") || strings.Contains(lowerAlias, "sink") || strings.Contains(lowerAlias, "dst") || strings.Contains(lowerAlias, "target") || strings.Contains(lowerAlias, "receiver") {
			outputs = append(outputs, ds)
		}
	}

	if len(all) == 0 {
		return
	}

	byAlias := make(map[string]datasetAliasBinding, len(all))
	for _, ds := range all {
		byAlias[ds.Alias] = ds
	}

	for i := range req.Models {
		if req.Models[i].Parameters == nil {
			req.Models[i].Parameters = map[string]interface{}{}
		}
		p := req.Models[i].Parameters
		if _, exists := p["datasets"]; !exists {
			p["datasets"] = all
		}
		if _, exists := p["input_datasets"]; !exists && len(inputs) > 0 {
			p["input_datasets"] = bindingSliceToIfaceSlice(inputs)
		}
		if _, exists := p["output_datasets"]; !exists && len(outputs) > 0 {
			p["output_datasets"] = bindingSliceToIfaceSlice(outputs)
		}
		enrichStringDatasetAliases(p, "input_datasets", byAlias)
		enrichStringDatasetAliases(p, "output_datasets", byAlias)
	}
}

func bindingToParamMap(ds datasetAliasBinding) map[string]interface{} {
	m := map[string]interface{}{
		"alias": ds.Alias,
	}
	if ds.ID != 0 {
		m["id"] = ds.ID
	}
	if ds.Name != "" {
		m["name"] = ds.Name
	}
	if ds.Type != "" {
		m["type"] = ds.Type
	}
	if ds.Managed {
		m["managed"] = true
	}
	if len(ds.Params) > 0 {
		m["params"] = ds.Params
	}
	if len(ds.Schema) > 0 {
		m["schema"] = ds.Schema
	}
	return m
}

func bindingSliceToIfaceSlice(list []datasetAliasBinding) []interface{} {
	out := make([]interface{}, len(list))
	for i := range list {
		out[i] = bindingToParamMap(list[i])
	}
	return out
}

func enrichStringDatasetAliases(params map[string]interface{}, field string, byAlias map[string]datasetAliasBinding) {
	raw, ok := params[field]
	if !ok || raw == nil {
		return
	}
	slice, ok := raw.([]interface{})
	if !ok || len(slice) == 0 {
		return
	}
	out := make([]interface{}, 0, len(slice))
	for _, item := range slice {
		switch v := item.(type) {
		case string:
			alias := strings.TrimSpace(v)
			if alias == "" {
				continue
			}
			if b, found := byAlias[alias]; found {
				out = append(out, bindingToParamMap(b))
			} else {
				out = append(out, v)
			}
		default:
			out = append(out, item)
		}
	}
	params[field] = out
}

func toString(v interface{}) string {
	if v == nil {
		return ""
	}
	switch t := v.(type) {
	case string:
		return t
	default:
		b, err := json.Marshal(t)
		if err != nil {
			return ""
		}
		return strings.Trim(string(b), `"`)
	}
}

func toInt64(v interface{}) int64 {
	switch t := v.(type) {
	case float64:
		return int64(t)
	case int64:
		return t
	case int:
		return int64(t)
	default:
		return 0
	}
}

func toBool(v interface{}) bool {
	switch t := v.(type) {
	case bool:
		return t
	default:
		return false
	}
}

func toMap(v interface{}) map[string]interface{} {
	if v == nil {
		return nil
	}
	switch t := v.(type) {
	case map[string]interface{}:
		return t
	default:
		b, err := json.Marshal(t)
		if err != nil {
			return nil
		}
		out := make(map[string]interface{})
		if err := json.Unmarshal(b, &out); err != nil {
			return nil
		}
		return out
	}
}
