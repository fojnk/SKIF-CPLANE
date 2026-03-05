package validation

import (
	"github.com/go-playground/validator/v10"
	"gitlab.corp.mail.ru/ai/streamflow/backend/libs/models/validators"
)

var validate *validator.Validate

func init() {
	validate = validator.New(validator.WithRequiredStructEnabled())
	validators.RegisterModelValidators(validate)
}

func DefaultValidate[T any](r *T) error {
	return validate.Struct(r)
}
