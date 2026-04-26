package supervisor

import (
	"encoding/json"

	"github.com/pkg/errors"
)

// ValidateStoredTemplateJSON проверяет JSON шаблона пайплайна в формате супервизора (до подстановки experimentId из БД).
func ValidateStoredTemplateJSON(configJSON string) error {
	var cfg ExperimentRequest
	if err := json.Unmarshal([]byte(configJSON), &cfg); err != nil {
		return errors.Wrap(err, "некорректный JSON конфига супервизора")
	}
	if len(cfg.Models) == 0 {
		return errors.New("массив models не должен быть пустым")
	}
	for i := range cfg.Models {
		if err := validateModel(i, &cfg.Models[i]); err != nil {
			return err
		}
	}
	return nil
}
