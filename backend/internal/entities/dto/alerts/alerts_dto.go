package alerts

type AlertGroup struct {
	AlertGroupId int32               `json:"alert_group_id" validate:"required"`
	ProductId    int32               `json:"product_id" validate:"required"`
	Experiment     Experiment            `json:"experiment" validate:"required"`
	AlertRules   map[int32]AlertRule `json:"alert_rules" validate:"required"`
}

type AlertRule struct {
	RuleId           int32  `json:"rule_id" validate:"required"`
	AlertTemplateId  int32  `json:"alert_template_id" validate:"required"`
	Severity         string `json:"severity" validate:"required" enum:"info,warning,critical,disaster"`
	SeverityIsActive bool   `json:"severity_is_active" validate:"required"`
	Limit            string `json:"limit" validate:"required"`
	DelayFiring      string `json:"delay_firing"`
	DelayResolving   string `json:"delay_resolving"`
}

type AlertRuleInput struct {
	AlertTemplateId  int32  `json:"alert_template_id" validate:"required"`
	Severity         string `json:"severity" validate:"required" enum:"info,warning,critical,disaster"`
	SeverityIsActive bool   `json:"severity_is_active" validate:"required"`
	Limit            string `json:"limit" validate:"required"`
	DelayFiring      string `json:"delay_firing"`
	DelayResolving   string `json:"delay_resolving"`
}

type AlertRuleUpdate struct {
	RuleId           int32  `json:"rule_id" validate:"required"`
	AlertTemplateId  int32  `json:"alert_template_id" validate:"required"`
	Severity         string `json:"severity" validate:"required" enum:"info,warning,critical,disaster"`
	SeverityIsActive bool   `json:"severity_is_active" validate:"required"`
	Limit            string `json:"limit" validate:"required"`
	DelayFiring      string `json:"delay_firing"`
	DelayResolving   string `json:"delay_resolving"`
}

type Experiment struct {
	ExperimentId   int32  `json:"experiment_id" validate:"required"`
	ExperimentName string `json:"experiment_name" validate:"required"`
	ProjectId    int32  `json:"project_id" validate:"required"`
	ProjectName  string `json:"project_name" validate:"required"`
	YTWorkDir    string `json:"yt_work_dir" validate:"required"`
}

type AlertTemplate struct {
	GraphicName      string `json:"graphic_name" validate:"required"`
	AlertName        string `json:"alert_name" validate:"required"`
	AlertDescription string `json:"alert_description" validate:"required"`
	Namespace        string `json:"namespace" validate:"required"`
	TemplateName     string `json:"template_name" validate:"required"`
	HasLimit         bool   `json:"has_limit" validate:"required"`
	TypeLimit        string `json:"type_limit" validate:"required" enum:"units,seconds"`
}

type TypeLimits struct {
	Types       []string `json:"types" validate:"required"`
	Description string   `json:"description" validate:"required"`
}

type AlertOptions struct {
	TypeLimits     map[string]TypeLimits   `json:"type_limits" validate:"required"`
	AlertTemplates map[int32]AlertTemplate `json:"alert_templates" validate:"required"`
	DelayFiring    TypeLimits              `json:"delay_firing" validate:"required"`
	DelayResolving TypeLimits              `json:"delay_resolving" validate:"required"`
}

type Alerts struct {
	AlertName        string  `json:"alert_name" validate:"required"`
	AlertDescription string  `json:"alert_description" validate:"required"`
	Alerts           []Alert `json:"alerts" validate:"required"`
}

type Alert struct {
	GraphicName      string `json:"graphic_name" validate:"required"`
	AlertDescription string `json:"alert_description" validate:"required"`
	RuleId           int32  `json:"rule_id" validate:"required"`
	AlertTemplateId  int32  `json:"alert_template_id" validate:"required"`
	Severity         string `json:"severity" validate:"required"`
	SeverityIsActive bool   `json:"severity_is_active" validate:"required"`
	Limit            string `json:"limit" validate:"required"`
	DelayFiring      string `json:"delay_firing"`
	DelayResolving   string `json:"delay_resolving"`
	HasLimit         bool   `json:"has_limit" validate:"required"`
	TypeLimit        string `json:"type_limit" validate:"required"`
}
