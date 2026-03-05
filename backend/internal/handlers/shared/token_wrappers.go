package shared

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5/middleware"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

func PublicWrapHandler(h Handler, svc *service.Service, disableAuth bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		logger := svc.GetLogger().With("request_id", fmt.Sprintf("%s", r.Context().Value(middleware.RequestIDKey)))

		var info *user.UserInfo
		superUserToken := r.Header.Get(superUserHeader)
		isSuperUser := superUserToken == svc.GetACLToken()
		if !disableAuth && !isSuperUser {
			var err error
			info, err = svc.GetRobotInfoFromRequest(r)
			if err != nil || info == nil {
				logger.Error("error client auth", err)
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				errResp := &responses.ErrorResponse{
					ExternalMessage: "Access denied",
					HTTPStatusCode:  http.StatusUnauthorized,
				}
				marshalError(errResp, w, logger, false)
				return
			}
		} else { // using else because userInfo must not be nil
			info = &user.UserInfo{
				Username: "noauth-user",
			}
		}

		resp, sErr := h(svc, r, logger, info)
		if sErr != nil {
			logger.Error("error processing query", sErr.InternalError)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(sErr.HTTPStatusCode)
			marshalError(sErr, w, logger, false)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		respBytes, err := json.Marshal(resp)
		if err != nil {
			logger.Error("error marshalling response", err)
			w.WriteHeader(http.StatusInternalServerError)
			_, err := w.Write([]byte("Internal server error"))
			if err != nil {
				logger.Error("error while writing response", err)
			}

			return
		}

		if _, err := w.Write(respBytes); err != nil {
			logger.Error("error while writing response", err)
		}
	}
}
