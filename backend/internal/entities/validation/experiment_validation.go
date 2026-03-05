package validation

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/santhosh-tekuri/jsonschema/v6"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
)

func ValidateUpdateExperimentRequest(r *requests.UpdateCompleteExperimentRequest) error {
	if r.Config != "" {
		var res map[string]any
		if err := json.Unmarshal([]byte(r.Config), &res); err != nil {
			return fmt.Errorf("invalid config: not a valid json")
		}
	}

	if err := validate.Struct(r); err != nil {
		return err
	}
	return nil
}

func ExperimentSyntaxConfigValidation(experimentConfigString string) error {
	var experimentConfig models.ExperimentConfig

	err := json.Unmarshal([]byte(experimentConfigString), &experimentConfig)
	if err != nil {
		return fmt.Errorf("failed to decode experiment config: %v", err)
	}

	if err := validate.Struct(experimentConfig); err != nil {
		var validationErrors validator.ValidationErrors
		ok := errors.As(err, &validationErrors)

		var errResp []ValidationError
		if ok {
			errResp = newValidationErrorResponse(validationErrors)
			errInfo, err := json.MarshalIndent(errResp, "", "  ")
			if err != nil {
				return err
			}
			return fmt.Errorf("Ошибки валидации: \n%s", string(errInfo))
		}

		return err
	}

	var workerConfig models.Worker
	workerConfigBytes, _ := json.Marshal(experimentConfig.Worker)
	err = json.Unmarshal(workerConfigBytes, &workerConfig)
	if err != nil {
		return fmt.Errorf("failed to decode worker config: %v", err)
	}

	var errResp []ValidationError

	for _, cube := range workerConfig.GraphConfig.Cubes {
		cubeBytes, _ := json.Marshal(cube)
		err := validateCube(string(cubeBytes))

		if err != nil {
			errResp = append(errResp, ValidationError{
				Description: err.Error(),
			})
		}
	}

	errInfo, err := json.MarshalIndent(errResp, "", "  ")
	if err != nil {
		return err
	}

	if len(errResp) > 0 {
		return fmt.Errorf("Ошибки валидации: \n%s", string(errInfo))
	}

	return nil
}

func validateCube(cube string) error {
	schemaFile := "/json/TCubeConfig.json"

	c := jsonschema.NewCompiler()
	sch, err := c.Compile(schemaFile)
	if err != nil {
		return err
	}

	inst, err := jsonschema.UnmarshalJSON(strings.NewReader(cube))
	if err != nil {
		return err
	}

	err = sch.Validate(inst)
	return err
}

type ValidationError struct {
	ErrorName   string `json:"error_name"`
	Description string `json:"description"`
}

func newValidationErrorResponse(validationErrors validator.ValidationErrors) []ValidationError {
	resp := make([]ValidationError, len(validationErrors))
	for i, fieldError := range validationErrors {
		description := fmt.Sprintf(
			"Ошибка валидации в поле '%s' для тега '%s'. Значение: '%v'",
			fieldError.Namespace(),
			fieldError.Tag(),
			fieldError.Value(),
		)
		if fieldError.Param() != "" {
			description += fmt.Sprintf(" (Параметр: %s)", fieldError.Param())
		}
		resp[i] = ValidationError{
			ErrorName:   "Валидация блока " + fieldError.Field(),
			Description: description,
		}
	}
	return resp
}
