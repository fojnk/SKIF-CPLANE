package setters

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

func SetGetSchema(r *requests.GetSchemaRequest, _, value string) *responses.ErrorResponse {
	r.ConfigType = normalizeConfigTypeAlias(value)
	return nil
}
