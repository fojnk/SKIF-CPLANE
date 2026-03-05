package requests

type GetSchemaRequest struct {
	ConfigType string `validate:"required,oneof=experiment dataset project dataset_schema model dataset experiment dataset_schema"`
}
