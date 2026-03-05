package public

import (
	"context"
	"errors"
	"fmt"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
	"io"
	"net/http"
	"os"
)

var schemaConfig = map[string]string{
	"experiment":   "/json/TExperimentConfig.json",
	"dataset": "/json/TDataset.json",
	"project":    "/json/TProjectConfig.json",
}

// getConfigSchemaHandler godoc
//
//	@Summary	get config schema by config type
//	@Security	BearerAuth
//	@Tags		schema
//	@Param		config_type	query	string	true	"config type"
//	@Produce	json
//	@Success	200	{object}	responses.GetSchemaResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/schema [get]
func getConfigSchemaHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetSchemaRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	schema, ok := schemaConfig[r.ConfigType]
	if !ok {
		return nil, &responses.ErrorResponse{
			ExternalMessage: "no schema defined for type " + r.ConfigType,
			InternalError:   errors.New(fmt.Sprintf("no schema defined for type %s", r.ConfigType)),
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}

	file, err := os.Open(schema)
	if err != nil {
		l.Error("Ошибка открытия файла: %v", err)
		return nil, &responses.ErrorResponse{
			ExternalMessage: "failed to open schema file",
			InternalError:   errors.New(fmt.Sprintf("no schema defined for type %s", r.ConfigType)),
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}
	defer file.Close()

	// Читаем содержимое файла
	byteValue, err := io.ReadAll(file)
	if err != nil {
		l.Error("Ошибка чтения файла: %v", err)
		return nil, &responses.ErrorResponse{
			ExternalMessage: "reading schema file failed",
			InternalError:   errors.New(fmt.Sprintf("reading schema file failed for type %s", r.ConfigType)),
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	return &responses.GetSchemaResponse{ConfigSchema: string(byteValue)}, nil
}
