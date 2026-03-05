package generator

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"text/template"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"
)

const templatePath = "/templates"

type AlertGenerator struct {
	alertTemplates map[int32]alerts.AlertTemplate
	typeLimits     map[string]alerts.TypeLimits
	templateDir    string
}

func NewAlertGenerator(templateDir string) *AlertGenerator {
	if templateDir == "" {
		templateDir = templatePath
	}
	return &AlertGenerator{
		alertTemplates: getTemplates(),
		typeLimits:     getTypeLimits(),
		templateDir:    templateDir,
	}
}

type AlertGroupTemplates struct {
	Infra AlertGroupTemplate
	Dzen  AlertGroupTemplate
}

type AlertGroupTemplate struct {
	FileName string
	Body     string
}

func (a *AlertGenerator) GetAlertTemplates() (map[int32]alerts.AlertTemplate, error) {
	res := a.alertTemplates
	if len(res) == 0 {
		return nil, fmt.Errorf("шаблоны алёртов не найдены")
	}
	return res, nil
}

func (a *AlertGenerator) GetAlertTypeLimits() (map[string]alerts.TypeLimits, error) {
	res := a.typeLimits
	if len(res) == 0 {
		return nil, fmt.Errorf("типы алёртов не найдены")
	}
	return res, nil
}

func (a *AlertGenerator) GetAlertGroupInfo(requestAlertGroup alerts.AlertGroup, namespace string) (AlertGroupTemplate, error) {

	body, err := a.GetAlertGroupBody(requestAlertGroup, namespace)
	if err != nil {
		return AlertGroupTemplate{}, fmt.Errorf("ошибка получения тела алёртов для %s: %w", namespace, err)
	}

	groupTemplate, err := a.GetGroupTemplate(requestAlertGroup, body, namespace)
	if err != nil {
		return AlertGroupTemplate{}, fmt.Errorf("ошибка получения шаблона для %s: %w", namespace, err)
	}

	return groupTemplate, nil
}

func (a *AlertGenerator) GetGroupTemplate(requestAlertGroup alerts.AlertGroup, body string, namespace string) (groupTemplate AlertGroupTemplate, err error) {
	fileName := GenerateAlertFileName(requestAlertGroup, namespace)
	groupTemplate.FileName = fileName
	var headerBuilder strings.Builder

	headerTemplate, err := a.GetTemplate("header.yaml")
	if err != nil {
		return groupTemplate, fmt.Errorf("ошибка получения шаблона header: %w", err)
	}

	headerData := map[string]interface{}{
		"project_name":   requestAlertGroup.Experiment.ProjectName,
		"experiment_name":  requestAlertGroup.Experiment.ExperimentName,
		"experiment_id":    requestAlertGroup.Experiment.ExperimentId,
		"project_id":     requestAlertGroup.Experiment.ProjectId,
		"alert_group_id": requestAlertGroup.AlertGroupId,
		"product_id":     requestAlertGroup.ProductId,
		"namespace":      namespace,
	}
	err = headerTemplate.Execute(&headerBuilder, headerData)
	if err != nil {
		return groupTemplate, fmt.Errorf("ошибка выполнения header шаблона: %w", err)
	}
	header := headerBuilder.String()
	if body != "" {
		groupTemplate.Body = fmt.Sprintf("%s\n%s", header, body)
	}
	return groupTemplate, nil
}

func (a *AlertGenerator) GetAlertGroupBody(requestAlertGroup alerts.AlertGroup, namespace string) (body string, err error) {
	ruleIds := make([]int32, 0, len(requestAlertGroup.AlertRules))
	for ruleId := range requestAlertGroup.AlertRules {
		ruleIds = append(ruleIds, ruleId)
	}
	sort.Slice(ruleIds, func(i, j int) bool {
		return ruleIds[i] < ruleIds[j]
	})
	bodyBuilder := strings.Builder{}
	for _, ruleId := range ruleIds {
		rule := requestAlertGroup.AlertRules[ruleId]
		if !rule.SeverityIsActive {
			continue
		}
		alertDescription, ok := a.alertTemplates[rule.AlertTemplateId]
		if !ok {
			return "", fmt.Errorf("не найдено описание алёрта в шаблоне с id %d", rule.AlertTemplateId)
		}
		alertTemplate, err := a.GetTemplate(alertDescription.TemplateName)
		if err != nil {
			return "", fmt.Errorf("ошибка получения шаблона: %w", err)
		}

		bodyData := map[string]interface{}{
			"project_name":     requestAlertGroup.Experiment.ProjectName,
			"experiment_name":    requestAlertGroup.Experiment.ExperimentName,
			"experiment_id":      requestAlertGroup.Experiment.ExperimentId,
			"project_id":       requestAlertGroup.Experiment.ProjectId,
			"experiment_yt_path": requestAlertGroup.Experiment.YTWorkDir,
			"limit":            rule.Limit,
			"duration":         rule.DelayFiring,
			"resolve_duration": rule.DelayResolving,
			"severity":         rule.Severity,
		}
		if alertDescription.Namespace == namespace {
			err = alertTemplate.Execute(&bodyBuilder, bodyData)
			if err != nil {
				return "", fmt.Errorf("ошибка выполнения шаблона: %w", err)
			}
		}
	}
	return bodyBuilder.String(), nil
}

func (a *AlertGenerator) GetTemplate(templateName string) (*template.Template, error) {
	templatePath := a.FindTemplateFilePath(templateName)
	templateContent, err := ReadFile(templatePath)
	if err != nil {
		return nil, fmt.Errorf("ошибка чтения шаблона: %w", err)
	}
	tmpl, err := template.New(templateName).Parse(templateContent)
	if err != nil {
		return nil, fmt.Errorf("ошибка парсинга шаблона: %w", err)
	}
	return tmpl, nil
}

func (a *AlertGenerator) FindTemplateFilePath(templateName string) string {
	if !strings.Contains(templateName, ".yaml") {
		templateName = templateName + ".yaml"
	}
	if strings.Contains(templateName, "absent") {
		return filepath.Join(a.templateDir, "absent", templateName)
	}
	return filepath.Join(a.templateDir, templateName)
}

func GenerateAlertFileName(requestAlertGroup alerts.AlertGroup, namespace string) string {
	return fmt.Sprintf("%d_%d_group_No%d_%s_%d.yaml", requestAlertGroup.Experiment.ExperimentId, requestAlertGroup.Experiment.ProjectId, requestAlertGroup.AlertGroupId, namespace, requestAlertGroup.ProductId)
}

func ReadFile(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("ошибка открытия файла шаблона: %w", err)
	}
	defer file.Close()
	content, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("ошибка чтения файла шаблона: %w", err)
	}
	return string(content), nil
}
