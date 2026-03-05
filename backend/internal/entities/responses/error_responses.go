package responses

import xerrors "github.com/pkg/errors"

type ErrorResponse struct {
	InternalError   error  `json:"internal_error"`
	ExternalMessage string `json:"external_message"`
	HTTPStatusCode  int    `json:"http_status_code"`
}

func (e *ErrorResponse) Context(msg string) *ErrorResponse {
	e.InternalError = xerrors.Wrap(e.InternalError, msg)
	return e
}
