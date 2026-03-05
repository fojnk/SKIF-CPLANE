package clients

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/clients/one_alerts"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/alerts/generator"
)

type OneAlertsClientConfig struct {
	BaseURL string  `yaml:"base_url"`
	Token   *string `yaml:"token"`
	Timeout int     `yaml:"timeout"` // in seconds
}

type OneAlertsClient struct {
	Client         *one_alerts.ClientWithResponses
	Token          *string
	logger         *logger.Logger
	AlertGenerator *generator.AlertGenerator
}

func NewOneAlertsClient(c OneAlertsClientConfig, l *logger.Logger) (*OneAlertsClient, error) {
	timeout := time.Duration(c.Timeout) * time.Second
	if timeout == 0 {
		timeout = 30 * time.Second
	}

	httpClient := &http.Client{
		Timeout: timeout,
	}

	generatedClient, err := one_alerts.NewClientWithResponses(
		c.BaseURL,
		one_alerts.WithHTTPClient(httpClient),
	)
	if err != nil {
		return nil, fmt.Errorf("Ошибка при создании клиента one-alerts: %w", err)
	}

	if generatedClient == nil {
		return nil, fmt.Errorf("клиент one-alerts не настроен")
	}
	return &OneAlertsClient{
		Client:         generatedClient,
		Token:          c.Token,
		logger:         l,
		AlertGenerator: generator.NewAlertGenerator(""),
	}, nil
}

func (c *OneAlertsClient) DeleteAlerts(ctx context.Context, fileName string) error {

	params := &one_alerts.DeleteApiV2FilesParams{
		XFileName:    fileName,
		XAccessToken: *c.Token,
	}

	response, err := c.Client.DeleteApiV2FilesWithResponse(ctx, params)
	if err != nil {
		return err
	}

	if response.StatusCode() == http.StatusNotFound {
		return nil
	}

	if response.StatusCode() != http.StatusOK && response.StatusCode() != http.StatusNoContent {
		return fmt.Errorf("ошибка при удалении файла алёртов: статус %v", response.StatusCode())
	}
	return nil
}

func (c *OneAlertsClient) PostAlerts(ctx context.Context, fileName string, body string) error {
	params := &one_alerts.PostApiV2FilesParams{
		XFileName:    fileName,
		XAccessToken: *c.Token,
	}
	response, err := c.Client.PostApiV2FilesWithBody(ctx, params, "application/yaml", strings.NewReader(body))
	if err != nil {
		return err
	}

	if response.StatusCode == http.StatusConflict {
		return fmt.Errorf("файл алёртов %s уже существует", fileName)
	}

	if response.StatusCode != http.StatusOK && response.StatusCode != http.StatusCreated {
		return fmt.Errorf("ошибка при создании файла алёртов: статус %v", response.StatusCode)
	}
	return nil
}

func (c *OneAlertsClient) PutAlerts(ctx context.Context, fileName string, body string) error {
	params := &one_alerts.PutApiV2FilesParams{
		XFileName:    fileName,
		XAccessToken: *c.Token,
	}
	response, err := c.Client.PutApiV2FilesWithBody(ctx, params, "application/yaml", strings.NewReader(body))
	if err != nil {
		return err
	}

	bodyResponse, err := io.ReadAll(response.Body)
	if err != nil {
		return fmt.Errorf("ошибка при чтении ответа: %w", err)
	}

	if response.StatusCode == http.StatusNotFound {
		return fmt.Errorf("файл алёртов %s не найден", fileName)
	}

	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("ошибка при обновлении файла алёртов: статус %v, body: %s", response.StatusCode, string(bodyResponse))
	}
	return nil
}

func (c *OneAlertsClient) CheckIntegration(ctx context.Context, productID int32) error {

	params := &one_alerts.GetApiV2IntegrationsProductIDParams{
		XAccessToken: *c.Token,
	}
	response, err := c.Client.GetApiV2IntegrationsProductIDWithResponse(ctx, strconv.Itoa(int(productID)), params)
	if err != nil {
		return err
	}
	if response.StatusCode() == 404 {
		return fmt.Errorf("интеграция для продукта %d не найдена", productID)
	}
	if response.StatusCode() == 401 {
		return fmt.Errorf("неверный токен доступа к сервису алёртов")
	}
	if response.StatusCode() != 200 {
		return fmt.Errorf("ошибка при проверке интеграции для продукта %d: статус %v", productID, response.StatusCode())
	}
	return nil
}

func (c *OneAlertsClient) CreateAlerts(ctx context.Context, alerts alerts.AlertGroup, namespace string) error {

	alertGroupTemplates, err := c.AlertGenerator.GetAlertGroupInfo(alerts, namespace)
	if err != nil {
		return err
	}

	if alertGroupTemplates.Body != "" {
		err = c.PostAlerts(ctx, alertGroupTemplates.FileName, alertGroupTemplates.Body)
		if err != nil {
			return fmt.Errorf("ошибка создания файла алёртов для %s: %v", namespace, err)
		}
	}

	return nil
}

func (c *OneAlertsClient) UpdateAlerts(ctx context.Context, alerts alerts.AlertGroup, namespace string) error {

	alertGroupTemplates, err := c.AlertGenerator.GetAlertGroupInfo(alerts, namespace)
	if err != nil {
		return err
	}

	if alertGroupTemplates.Body != "" {
		err = c.PutAlerts(ctx, alertGroupTemplates.FileName, alertGroupTemplates.Body)
		if err != nil {
			return fmt.Errorf("ошибка обновления файла алёртов для %s: %v", namespace, err)
		}
	} else {
		err = c.DeleteAlerts(ctx, alertGroupTemplates.FileName)
		if err != nil {
			return fmt.Errorf("ошибка удаления файла алёртов для %s: %v", namespace, err)
		}
	}
	return nil
}

func (c *OneAlertsClient) DeleteAlertGroup(ctx context.Context, alertGroup alerts.AlertGroup) error {

	fileName := generator.GenerateAlertFileName(alertGroup, "dzen")
	err := c.DeleteAlerts(ctx, fileName)
	if err != nil {
		return err
	}
	fileName = generator.GenerateAlertFileName(alertGroup, "infra")
	err = c.DeleteAlerts(ctx, fileName)
	if err != nil {
		return err
	}
	return nil
}

func (c *OneAlertsClient) WorkWithAlerts(ctx context.Context, alertsAfterChanges alerts.AlertGroup) error {

	newAlerts, err := c.sortAlerts(alertsAfterChanges)
	if err != nil {
		return err
	}

	err = c.changeAlertsByNamespace(ctx, newAlerts.Dzen, "dzen")
	if err != nil {
		return err
	}
	err = c.changeAlertsByNamespace(ctx, newAlerts.Infra, "infra")
	if err != nil {
		return err
	}

	return nil
}

type groupsByNamespace struct {
	Dzen  alerts.AlertGroup
	Infra alerts.AlertGroup
}

func (c *OneAlertsClient) sortAlerts(alertGroup alerts.AlertGroup) (groupsByNamespace, error) {
	res := groupsByNamespace{
		Dzen: alerts.AlertGroup{
			AlertGroupId: alertGroup.AlertGroupId,
			ProductId:    alertGroup.ProductId,
			Experiment:     alertGroup.Experiment,
			AlertRules:   make(map[int32]alerts.AlertRule),
		},
		Infra: alerts.AlertGroup{
			AlertGroupId: alertGroup.AlertGroupId,
			ProductId:    alertGroup.ProductId,
			Experiment:     alertGroup.Experiment,
			AlertRules:   make(map[int32]alerts.AlertRule),
		},
	}

	templates, err := c.AlertGenerator.GetAlertTemplates()
	if err != nil {
		return res, fmt.Errorf("ошибка получения шаблонов алёртов: %w", err)
	}

	for ruleId, rule := range alertGroup.AlertRules {
		alertTemplate, ok := templates[rule.AlertTemplateId]
		if !ok {
			return res, fmt.Errorf("шаблон алёрта с id %d не найден", rule.AlertTemplateId)
		}
		switch alertTemplate.Namespace {
		case "dzen":
			res.Dzen.AlertRules[ruleId] = rule
		case "infra":
			res.Infra.AlertRules[ruleId] = rule
		default:
			return res, fmt.Errorf("неизвестный неймспейс алёрта: %s", alertTemplate.Namespace)
		}
	}

	return res, nil
}

func (c *OneAlertsClient) changeAlertsByNamespace(ctx context.Context, newAlerts alerts.AlertGroup, namespace string) error {

	fileName := generator.GenerateAlertFileName(newAlerts, namespace)
	response, err := c.Client.GetApiV2FilesWithResponse(ctx, &one_alerts.GetApiV2FilesParams{
		XFileName:    fileName,
		XAccessToken: *c.Token,
	})
	if err != nil {
		return err
	}

	if response.StatusCode() == http.StatusNotFound {
		if len(newAlerts.AlertRules) > 0 {
			return c.CreateAlerts(ctx, newAlerts, namespace)
		}
		return nil
	}

	if response.StatusCode() == http.StatusOK {
		if len(newAlerts.AlertRules) != 0 {
			return c.UpdateAlerts(ctx, newAlerts, namespace)
		}
		return c.DeleteAlerts(ctx, fileName)
	}
	return fmt.Errorf("ошибка при работе с файлом алёртов: статус %v", response.StatusCode())
}
