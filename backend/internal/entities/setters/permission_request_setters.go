package setters

import (
	"net/http"
	"strconv"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

func SetListPermissionRequestsAdminParams(r *requests.ListPermissionRequestsAdminRequest, key, value string) *responses.ErrorResponse {
	switch key {
	case "status":
		r.Status = value
	case "limit":
		if value == "" {
			return nil
		}
		n, err := strconv.ParseInt(value, 10, 32)
		if err != nil {
			return &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "некорректный limit",
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}
		r.Limit = int32(n)
	case "offset":
		if value == "" {
			return nil
		}
		n, err := strconv.ParseInt(value, 10, 32)
		if err != nil {
			return &responses.ErrorResponse{
				InternalError:   err,
				ExternalMessage: "некорректный offset",
				HTTPStatusCode:  http.StatusBadRequest,
			}
		}
		r.Offset = int32(n)
	}
	return nil
}
