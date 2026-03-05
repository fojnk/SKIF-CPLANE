package responses

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"

type GetAlertOptionsResponse struct {
	TypeLimits     map[string]alerts.TypeLimits `json:"type_limits" validate:"required"`
	AlertTemplates []AlertTemplateResponse      `json:"alert_templates" validate:"required"`
	DelayFiring    alerts.TypeLimits            `json:"delay_firing" validate:"required"`
	DelayResolving alerts.TypeLimits            `json:"delay_resolving" validate:"required"`
}

type AlertTemplateResponse struct {
	AlertTemplateId  int32  `json:"alert_template_id" validate:"required"`
	GraphicName      string `json:"graphic_name" validate:"required"`
	AlertName        string `json:"alert_name" validate:"required"`
	AlertDescription string `json:"alert_description" validate:"required"`
	HasLimit         bool   `json:"has_limit" validate:"required"`
	TypeLimit        string `json:"type_limit" validate:"required"`
}

type GetAlertGroupResponse struct {
	AlertGroupId          int32           `json:"alert_group_id" validate:"required"`
	ExperimentId            int32           `json:"experiment_id" validate:"required"`
	NotificationProductId int32           `json:"notification_product_id" validate:"required"`
	Alerts                []alerts.Alerts `json:"alerts" validate:"required"`
}
