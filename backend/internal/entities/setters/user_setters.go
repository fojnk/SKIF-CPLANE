package setters

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"net/http"
	"strconv"
)

func SetUserByNameRequestParams(r *requests.UserByNameRequest, _, value string) *responses.ErrorResponse {
	r.Name = value
	return nil
}

func SetListUserRequestParams(r *requests.ListUsersRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse UserGroup_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.UserGroupID = int32(id)
	return nil
}

func SetListUserRolesRequestParams(r *requests.ListUserRolesRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse User_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.UserID = int32(id)
	return nil
}
