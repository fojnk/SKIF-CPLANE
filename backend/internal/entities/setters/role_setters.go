package setters

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"net/http"
	"strconv"
)

func SetCheckPermissionsParams(r *requests.CheckPermissionsRequest, key, value string) *responses.ErrorResponse {
	if key == "user_id" {
		id, err := strconv.ParseInt(value, 10, 32)
		if err != nil {
			return &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "failed to parse user_id",
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}
		r.UserID = int32(id)
	}
	if key == "object_type" {
		r.ObjectType = value
	}
	if key == "object_attribute" {
		r.ObjectAttribute = value
	}
	if key == "object_id" {
		id, err := strconv.ParseInt(value, 10, 32)
		if err != nil {
			return &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "failed to parse object_id",
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}
		r.ObjectID = int32(id)
	}

	return nil
}
