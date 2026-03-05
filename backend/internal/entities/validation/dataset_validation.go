package validation

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-playground/validator/v10"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
)

func ValidateUpdateDatasetRequest(r *requests.UpdateDatasetRequestV2) error {
	if r.Params != "" {
		var res models.SourceParams
		if err := json.Unmarshal([]byte(r.Params), &res); err != nil {
			return fmt.Errorf("invalid config: not a valid json")
		}
		if !r.DisableValidation {
			err := DatasetParamsSyntaxConfigValidation(r.Params)
			if err != nil {
				return err
			}
		}
	}

	if err := validate.Struct(r); err != nil {
		return err
	}
	return nil
}

func DatasetParamsSyntaxConfigValidation(datasetConfigString string) error {
	var datasetParams models.SourceParams

	err := json.Unmarshal([]byte(datasetConfigString), &datasetParams)
	if err != nil {
		return fmt.Errorf("failed to decode dataset config: %v", err)
	}

	if err := validate.Struct(datasetParams); err != nil {
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
