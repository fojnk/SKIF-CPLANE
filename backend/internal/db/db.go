package db

import (
	"context"

	dbcore "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"
)

type DB interface {
	dbcore.Querier
	InsertExperimentTemplateVTx(ctx context.Context, arg dbcore.InsertExperimentTemplateVParams) (int32, error)
	SyncUserRoles(ctx context.Context, arg dbcore.DeleteUserRolesParams) error

	// Alerts
	GetAlerts(ctx context.Context, experimentID int32, productID int32) (alerts.AlertGroup, bool, error)
	GetAlertGroupExperiment(ctx context.Context, experimentID int32) (alerts.Experiment, bool, error)
	GetProductId(ctx context.Context, productID int32) (int32, error)
	AddNewProduct(ctx context.Context, productID int32) error
	GetRules(ctx context.Context, experimentID int32, productID int32) (map[int32]alerts.AlertRule, int32, error)
	CreateAlertGroupTx(ctx context.Context, productID int32, experimentID int32) (int32, error)
	InsertAlertRulesTx(ctx context.Context, alertGroupID int32, alertRules []alerts.AlertRuleInput) error
	DeleteAlrtRules(ctx context.Context, ruleIDs []int32) error
	GetRulesByTemplate(ctx context.Context, experimentID int32, productID int32, templateID int32) (map[int32]alerts.AlertRule, int32, error)
	DeleteAlertGroup(ctx context.Context, alertGroup alerts.AlertGroup) error
}
