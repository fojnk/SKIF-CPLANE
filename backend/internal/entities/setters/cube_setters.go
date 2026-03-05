package setters

import (
	"strings"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/helpers"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

func SetGetCubeRequestParams(r *requests.GetCubeRequest, _, value string) *responses.ErrorResponse {
	id, err := helpers.ParseInt32("cube_id", value)
	if err != nil {
		return err
	}
	r.CubeID = int32(id)
	return nil
}

func SetListCubesByIDsRequestParams(r *requests.ListCubesByIDsRequest, _, value string) *responses.ErrorResponse {
	idsStrSl := strings.Split(value, ",")
	r.IDs = make([]int32, 0, len(idsStrSl))
	for _, idStr := range idsStrSl {
		id, err := helpers.ParseInt32("ids", idStr)
		if err != nil {
			return err
		}

		r.IDs = append(r.IDs, id)
	}

	return nil
}

func SetGetCubeByNameRequestParams(r *requests.GetCubeByNameRequest, _, value string) *responses.ErrorResponse {
	r.Name = value
	return nil
}
