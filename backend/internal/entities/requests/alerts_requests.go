package requests

import (
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"
)

type EmptyAlertRequest struct {
}

type GetAlertsRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
	ProductID  int32 `json:"product_id" validate:"required"`
}

type GetProductsRequest struct {
	ExperimentID int32 `json:"experiment_id" validate:"required"`
}

type CreateAlertGroupRequest struct {
	ExperimentID int32                   `json:"experiment_id" validate:"required"`
	ProductID  int32                   `json:"product_id" validate:"required"`
	AlertRules []alerts.AlertRuleInput `json:"alert_rules" validate:"required"`
}

type CreateAlertGroupBody struct {
	AlertRules []alerts.AlertRuleInput `json:"alert_rules" validate:"required"`
}

type DeleteAlertsRequest struct {
	AlertGroupId  int32   `json:"alert_group_id" validate:"required"`
	ExperimentID    int32   `json:"experiment_id" validate:"required"`
	ProductID     int32   `json:"product_id" validate:"required"`
	DeletingRules []int32 `json:"deleting_rules" validate:"required"`
}

type DeleteAlertsBody struct {
	AlertGroupId  int32   `json:"alert_group_id" validate:"required"`
	DeletingRules []int32 `json:"deleting_rules" validate:"required"`
}

type ChangeAlertSeveritiesRequest struct {
	ExperimentID int32                   `json:"experiment_id" validate:"required"`
	ProductID  int32                   `json:"product_id" validate:"required"`
	AlertRules []alerts.AlertRuleInput `json:"alert_rules" validate:"required"`
}

type ChangeAlertSeveritiesBody struct {
	AlertRules []alerts.AlertRuleInput `json:"alert_rules" validate:"required"`
}

type ChangeAlertRequest struct {
	ExperimentID       int32  `json:"experiment_id" validate:"required"`
	ProductID        int32  `json:"product_id" validate:"required"`
	RuleId           int32  `json:"rule_id" validate:"required"`
	AlertTemplateId  int32  `json:"alert_template_id" validate:"required"`
	Severity         string `json:"severity" validate:"required" enum:"info,warning,critical,disaster"`
	SeverityIsActive *bool  `json:"severity_is_active" validate:"required"`
	Limit            string `json:"limit" validate:"required"`
	DelayFiring      string `json:"delay_firing"`
	DelayResolving   string `json:"delay_resolving"`
}

type ChangeAlertBody struct {
	RuleId           int32  `json:"rule_id" validate:"required"`
	AlertTemplateId  int32  `json:"alert_template_id" validate:"required"`
	Severity         string `json:"severity" validate:"required" enum:"info,warning,critical,disaster"`
	SeverityIsActive bool   `json:"severity_is_active" validate:"required"`
	Limit            string `json:"limit" validate:"required"`
	DelayFiring      string `json:"delay_firing"`
	DelayResolving   string `json:"delay_resolving"`
}
