package validation

import (
	"encoding/json"
	"fmt"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
)

// validate new version of schema for datasets https://jira.vk.team/browse/STREAMFLOW-475
func DatasetDataSchemaValidation(schemaConfig string) error {
	var dataSchema models.DataSchema

	err := json.Unmarshal([]byte(schemaConfig), &dataSchema)
	if err != nil {
		return fmt.Errorf("failed to decode schema config: %v", err)
	}

	if err := validate.Struct(dataSchema); err != nil {
		// add error processing if we use to validate data schema on front
		return err
	}

	for _, columnSchema := range dataSchema.Columns {
		if err := validate.Struct(columnSchema); err != nil {
			// add error processing if we use to validate data schema on front
			return err
		}
	}

	return nil
}
