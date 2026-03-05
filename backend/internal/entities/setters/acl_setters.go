package setters

import (
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/helpers"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"net/http"
	"strconv"
)

func SetUsersACLRequestParams(r *requests.UsersACLRequest, name, value string) *responses.ErrorResponse {
	name = normalizeParamName(name)
	if name != "object_type" && name != "search" {
		val, err := helpers.ParseInt32(name, value)
		if err != nil {
			return err
		}
		switch name {
		case "limit":
			r.Limit = val
		case "offset":
			r.Offset = &val
		case "object_id":
			r.ObjectID = val
		default:
			return &responses.ErrorResponse{
				InternalError:   fmt.Errorf("invalid parameter: %s", name),
				ExternalMessage: fmt.Sprintf("invalid parameter: %s", name),
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}
	} else {
		switch name {
		case "object_type":
			r.ObjectType = normalizeObjectTypeAlias(value)
		case "search":
			r.Search = value
		}

	}

	return nil
}

func SetCheckACLRequestParams(r *requests.CheckACLRequest, key, value string) *responses.ErrorResponse {
	key = normalizeParamName(key)
	if key == "object_type" {
		r.ObjectType = normalizeObjectTypeAlias(value)
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
