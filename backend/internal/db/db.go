package db

import (
	"context"

	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
)

type DB interface {
	dbcore.Querier
	InsertExperimentTemplateVTx(ctx context.Context, arg dbcore.InsertExperimentTemplateVParams) (int32, error)
	SyncUserRoles(ctx context.Context, arg dbcore.DeleteUserRolesParams) error
}
