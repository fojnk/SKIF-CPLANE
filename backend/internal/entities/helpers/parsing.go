package helpers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/pkg/errors"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

func ParseInt32(name string, value string) (int32, *responses.ErrorResponse) {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return 0, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, fmt.Sprintf("failed to parse %s: must be integer", name)),
			ExternalMessage: fmt.Sprintf("failed to parse %s: must be integer", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	return int32(id), nil
}

func ParseBool(name, value string) (bool, *responses.ErrorResponse) {
	res, err := strconv.ParseBool(value)
	if err != nil {
		return false, &responses.ErrorResponse{
			InternalError:   errors.Wrap(err, fmt.Sprintf("failed to parse %s: must be boolean", name)),
			ExternalMessage: fmt.Sprintf("failed to parse %s: must be boolean", name),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}

	return res, nil
}
