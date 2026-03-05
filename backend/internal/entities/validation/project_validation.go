package validation

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-playground/validator/v10"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
)

func ValidateUpdateProjectRequest(r *requests.UpdateProjectRequest) error {
	if r.Config != "" {
		var jsonCheck any
		if err := json.Unmarshal([]byte(r.Config), &jsonCheck); err != nil {
			return fmt.Errorf("invalid config: not a valid json")
		}

		//if !r.DisableValidation {
		//	var res models.ExperimentMeta
		//	if err := json.Unmarshal([]byte(r.Config), &res); err == nil {
		//		// Config matches old format, validate it
		//		err := ProjectSyntaxConfigValidation(r.Config)
		//		if err != nil {
		//			return err
		//		}
		//	}
		//}
	}

	if err := validate.Struct(r); err != nil {
		return err
	}
	return nil
}

func ProjectSyntaxConfigValidation(projectConfigString string) error {
	var projectConfig models.ExperimentMeta

	err := json.Unmarshal([]byte(projectConfigString), &projectConfig)
	if err != nil {
		return fmt.Errorf("failed to decode project config: %v", err)
	}

	if err := validate.Struct(projectConfig); err != nil {
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

	return nil
}
