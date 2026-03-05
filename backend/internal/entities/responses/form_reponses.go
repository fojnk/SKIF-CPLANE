package responses

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/params"

type GetFormResponse struct {
	Params []params.Param `json:"params"`
}
