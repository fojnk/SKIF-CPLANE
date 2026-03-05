package validation

import (
	"encoding/json"
	"fmt"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	model_params "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/params"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
)

func ValidateCreateCubeRequest(r *requests.CreateCubeRequest) error {
	if err := validateCubeParamsRequest(r.Params); err != nil {
		return err
	}

	if err := validate.Struct(r); err != nil {
		return err
	}

	return nil
}

func ValidateUpdateCubeRequest(r *requests.UpdateCubeRequest) error {
	if err := validateCubeParamsRequest(r.Params); err != nil {
		return err
	}

	if err := validate.Struct(r); err != nil {
		return err
	}

	return nil
}

func validateCubeParamsRequest(params string) error {
	if params != "" {
		var cubeParams dto.CubeParams
		if err := json.Unmarshal([]byte(params), &cubeParams); err != nil {
			return fmt.Errorf("invalid config: not a valid json")
		}

		if err := model_params.ValidateParams(cubeParams.Args); err != nil {
			return fmt.Errorf("error in args params: %s", err.Error())
		}
	}

	return nil
}
