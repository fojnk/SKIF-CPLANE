package setters

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/helpers"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

func SetGetAppBannerRequestParams(r *requests.GetAppBannerRequest, name, value string) *responses.ErrorResponse {
	val, err := helpers.ParseInt32(name, value)
	if err != nil {
		return err
	}

	r.Id = val
	return nil
}
