package setters

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"

func EmptySetParam[T any](_ *T, _, _ string) *responses.ErrorResponse {
	return nil
}
