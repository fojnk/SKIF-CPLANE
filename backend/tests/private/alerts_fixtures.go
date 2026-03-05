package private

import (
	"fmt"
	"net/http"
	"strconv"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/alerts"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/namespace"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/project"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

const (
	namespaceName       = "tst-ns-al"
	projectName         = "tst-pr-al"
	experimentName        = "tst-pl-al"
	experimentDescription = "tst-pl-al-description"
	abcProductID        = 1234
)

func (s *StreamflowTestSuite) prepareNamespace(name string) *namespace.PostAPIV1NamespaceOK {
	nsRes, err := s.c.Namespace.PostAPIV1Namespace(&namespace.PostAPIV1NamespaceParams{
		Request: &models.RequestsCreateNamespaceRequest{
			Name: ptr(name),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(nsRes)
	s.Require().NotNil(nsRes.Payload)

	s.grantNamespace(nsRes.Payload.ID)

	return nsRes
}

func (s *StreamflowTestSuite) prepareProject(namespaceID int64, abcProductID string, name string) *project.PostAPIV1ProjectOK {

	projRes, err := s.c.Project.PostAPIV1Project(&project.PostAPIV1ProjectParams{
		Request: &models.RequestsCreateProjectRequest{
			Name:         ptr(name),
			NamespaceID:  &namespaceID,
			AbcProductID: ptr(abcProductID),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(projRes)
	s.Require().NotNil(projRes.Payload)

	return projRes
}

func (s *StreamflowTestSuite) prepareExperiment(projectID int64, name string, description string) *experiment.PostAPIV1ExperimentOK {

	res, err := s.c.Experiment.PostAPIV1Experiment(&experiment.PostAPIV1ExperimentParams{
		Request: &models.RequestsCreateCompleteExperimentRequest{
			Name:        ptr(name),
			Description: ptr(description),
			ProjectID:   &projectID,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(res)
	s.Require().NotNil(res.Payload)
	s.Require().Equal(res.Payload.Description, description)

	return res
}

func (s *StreamflowTestSuite) prepareAlertsEnvironment() (*namespace.PostAPIV1NamespaceOK, *project.PostAPIV1ProjectOK, *experiment.PostAPIV1ExperimentOK) {
	ns := s.prepareNamespace(namespaceName)
	proj := s.prepareProject(ns.Payload.ID, strconv.Itoa(abcProductID), projectName)
	pl := s.prepareExperiment(proj.Payload.ID, experimentName, experimentDescription)

	// добавляем конфигурацию проекта с workdir для корректной работы Get ручки алёртов
	prWithConf, err := s.c.Project.PutAPIV1Project(&project.PutAPIV1ProjectParams{
		Request: &models.RequestsUpdateProjectRequest{
			ID: &proj.Payload.ID,
			Config: `{
				"YT": {
					"WorkDir": "//home/some/ytdir",
					"Token": "{{ expscr('scr-askfjasdlkfji13', 'secret-key', v=1) }}"
				}
			}`,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(prWithConf)
	s.Require().NotNil(prWithConf.Payload)
	s.Require().NotNil(prWithConf.Payload.Project.Config)

	s.setupOneAlertsIntegration(abcProductID)

	return ns, proj, pl
}

// setupOneAlertsIntegration регистрирует интеграцию для продукта в мок-сервере one-alerts
// Используется для тестов, чтобы проверка интеграции проходила успешно
func (s *StreamflowTestSuite) setupOneAlertsIntegration(productID int32) {
	client := &http.Client{}
	url := fmt.Sprintf("http://localhost:4006/api/v2/integrations/%d", productID)
	req, err := http.NewRequest("POST", url, nil)
	s.Require().NoError(err)

	req.Header.Set("X-Access-Token", "test-token")

	resp, err := client.Do(req)
	s.Require().NoError(err)
	s.Require().NotNil(resp)
	defer resp.Body.Close()

	s.Require().Equal(http.StatusOK, resp.StatusCode, "не удалось зарегистрировать интеграцию для продукта %d", productID)
}

// removeOneAlertsIntegration удаляет интеграцию для продукта из мок-сервера one-alerts
func (s *StreamflowTestSuite) removeOneAlertsIntegration(productID int32) {
	client := &http.Client{}
	url := fmt.Sprintf("http://localhost:4006/api/v2/integrations/%d", productID)
	req, err := http.NewRequest("DELETE", url, nil)
	s.Require().NoError(err)

	req.Header.Set("X-Access-Token", "test-token")

	resp, err := client.Do(req)
	s.Require().NoError(err)
	s.Require().NotNil(resp)
	defer resp.Body.Close()

	s.Require().Equal(http.StatusOK, resp.StatusCode, "не удалось удалить интеграцию для продукта %d", productID)
}

// getInitialAlertRuleTemplate2 возвращает правило с TemplateID=2 для первоначального создания
func getInitialAlertRuleTemplate2() []*models.AlertsAlertRuleInput {
	return []*models.AlertsAlertRuleInput{
		{
			AlertTemplateID:  ptr(int64(2)),
			DelayFiring:      "10m",
			DelayResolving:   "15m",
			Limit:            ptr("200"),
			Severity:         ptr("critical"),
			SeverityIsActive: ptr(true),
		},
	}
}

// getInitialAlertRuleTemplate1 возвращает правило с TemplateID=1 для добавления после создания TemplateID=2
func getInitialAlertRuleTemplate1() []*models.AlertsAlertRuleInput {
	return []*models.AlertsAlertRuleInput{
		{
			AlertTemplateID:  ptr(int64(1)),
			DelayFiring:      "5m",
			DelayResolving:   "10s",
			Limit:            ptr("100"),
			Severity:         ptr("warning"),
			SeverityIsActive: ptr(true),
		},
	}
}

// getInitialAlertRules возвращает начальные правила для создания группы алёртов (оба правила вместе)
func getInitialAlertRules() []*models.AlertsAlertRuleInput {
	return []*models.AlertsAlertRuleInput{
		{
			AlertTemplateID:  ptr(int64(1)),
			DelayFiring:      "5m",
			DelayResolving:   "10s",
			Limit:            ptr("100"),
			Severity:         ptr("warning"),
			SeverityIsActive: ptr(true),
		},
		{
			AlertTemplateID:  ptr(int64(2)),
			DelayFiring:      "10m",
			DelayResolving:   "15m",
			Limit:            ptr("200"),
			Severity:         ptr("critical"),
			SeverityIsActive: ptr(true),
		},
	}
}

// getUpdateAlertRuleBody возвращает структуру для обновления одного алёрта
func getUpdateAlertRuleBody(ruleID *int64) *models.RequestsChangeAlertBody {
	return &models.RequestsChangeAlertBody{
		RuleID:           ruleID,
		AlertTemplateID:  ptr(int64(2)),
		DelayFiring:      "15m",
		DelayResolving:   "20m",
		Limit:            ptr("300"),
		Severity:         ptr("critical"),
		SeverityIsActive: ptr(true),
	}
}

// getExpectedRulesAfterUpdate возвращает ожидаемые правила после обновления одного алёрта
// Правило с TemplateID=1 остается неизменным, правило с TemplateID=2 обновляется
func getExpectedRulesAfterUpdate() []*models.AlertsAlertRuleInput {
	return []*models.AlertsAlertRuleInput{
		{
			AlertTemplateID:  ptr(int64(1)),
			DelayFiring:      "5m",
			DelayResolving:   "10s",
			Limit:            ptr("100"),
			Severity:         ptr("warning"),
			SeverityIsActive: ptr(true),
		},
		{
			AlertTemplateID:  ptr(int64(2)),
			DelayFiring:      "15m",
			DelayResolving:   "20m",
			Limit:            ptr("300"),
			Severity:         ptr("critical"),
			SeverityIsActive: ptr(true),
		},
	}
}

// getUpdateTemplateAlertRules возвращает правила для обновления шаблона
// Все правила относятся к одному шаблону (TemplateID=1), но с разными severity уровнями
// Это проверяет, что API корректно обрабатывает обновление нескольких правил для одного шаблона
func getUpdateTemplateAlertRules() []*models.AlertsAlertRuleInput {
	return []*models.AlertsAlertRuleInput{
		{
			AlertTemplateID:  ptr(int64(1)),
			DelayFiring:      "5m",
			DelayResolving:   "10s",
			Limit:            ptr("100"),
			Severity:         ptr("warning"),
			SeverityIsActive: ptr(true),
		},
		{
			AlertTemplateID:  ptr(int64(1)),
			DelayFiring:      "25m",
			DelayResolving:   "30m",
			Limit:            ptr("500"),
			Severity:         ptr("critical"),
			SeverityIsActive: ptr(true),
		},
		{
			AlertTemplateID:  ptr(int64(1)),
			DelayFiring:      "20m",
			DelayResolving:   "25m",
			Limit:            ptr("400"),
			Severity:         ptr("info"),
			SeverityIsActive: ptr(true),
		},
	}
}

// compareAlertRuleInputWithAlert сравнивает входное правило с алёртом из ответа
// Проверяет только те поля, которые были отправлены в запросе
func compareAlertRuleInputWithAlert(s *StreamflowTestSuite, input *models.AlertsAlertRuleInput, alert *models.AlertsAlert) {
	s.Require().NotNil(input, "входное правило не должно быть nil")
	s.Require().NotNil(alert, "алёрт из ответа не должен быть nil")

	if input.AlertTemplateID != nil {
		s.Require().NotNil(alert.AlertTemplateID, "AlertTemplateID в ответе не должен быть nil")
		s.Require().Equal(*input.AlertTemplateID, *alert.AlertTemplateID,
			"AlertTemplateID не совпадает: ожидалось %d, получено %d",
			*input.AlertTemplateID, *alert.AlertTemplateID)
	}

	if input.Limit != nil {
		s.Require().NotNil(alert.Limit, "Limit в ответе не должен быть nil")
		s.Require().Equal(*input.Limit, *alert.Limit,
			"Limit не совпадает: ожидалось %s, получено %s",
			*input.Limit, *alert.Limit)
	}

	if input.Severity != nil {
		s.Require().NotNil(alert.Severity, "Severity в ответе не должен быть nil")
		s.Require().Equal(*input.Severity, *alert.Severity,
			"Severity не совпадает: ожидалось %s, получено %s",
			*input.Severity, *alert.Severity)
	}

	if input.SeverityIsActive != nil {
		s.Require().NotNil(alert.SeverityIsActive, "SeverityIsActive в ответе не должен быть nil")
		s.Require().Equal(*input.SeverityIsActive, *alert.SeverityIsActive,
			"SeverityIsActive не совпадает: ожидалось %v, получено %v",
			*input.SeverityIsActive, *alert.SeverityIsActive)
	}
}

// compareAlertGroupResponseWithInput сравнивает ответ GetAlertGroupResponse с исходными входными данными
func compareAlertGroupResponseWithInput(s *StreamflowTestSuite, response *models.ResponsesGetAlertGroupResponse, inputRules []*models.AlertsAlertRuleInput) {
	s.Require().NotNil(response, "ответ не должен быть nil")
	s.Require().NotNil(response.Alerts, "Alerts в ответе не должен быть nil")
	s.Require().NotNil(inputRules, "входные правила не должны быть nil")

	resp := make(map[string]map[string]*models.AlertsAlert)
	input := make(map[string]map[string]*models.AlertsAlert)

	resTemplates, err := s.c.Alerts.GetAPIV2ExperimentAlertsOptions(&alerts.GetAPIV2ExperimentAlertsOptionsParams{})
	s.Require().NoError(err)
	s.Require().NotNil(resTemplates)
	s.Require().NotNil(resTemplates.Payload)
	s.Require().NotNil(resTemplates.Payload.AlertTemplates)

	templates := make(map[int64]*models.ResponsesAlertTemplateResponse)
	for _, template := range resTemplates.Payload.AlertTemplates {
		templates[*template.AlertTemplateID] = template
	}

	for _, alertRules := range response.Alerts {
		for _, alertRule := range alertRules.Alerts {
			if _, ok := resp[*alertRules.AlertName]; !ok {
				resp[*alertRules.AlertName] = make(map[string]*models.AlertsAlert)
			}
			resp[*alertRules.AlertName][*alertRule.Severity] = alertRule
		}
	}

	for _, inputRule := range inputRules {
		template, ok := templates[*inputRule.AlertTemplateID]
		if !ok {
			s.Require().Fail(fmt.Sprintf("не найден шаблон для правила с AlertTemplateID %d", *inputRule.AlertTemplateID))
		}
		if _, ok := input[*template.AlertName]; !ok {
			input[*template.AlertName] = make(map[string]*models.AlertsAlert)
		}
		input[*template.AlertName][*inputRule.Severity] = &models.AlertsAlert{
			AlertTemplateID:  inputRule.AlertTemplateID,
			DelayFiring:      inputRule.DelayFiring,
			DelayResolving:   inputRule.DelayResolving,
			Limit:            inputRule.Limit,
			Severity:         inputRule.Severity,
			SeverityIsActive: inputRule.SeverityIsActive,
		}
	}

	// Подсчитываем общее количество алёртов в ответе и входных данных
	totalRespAlerts := 0
	for _, severityMap := range resp {
		totalRespAlerts += len(severityMap)
	}

	totalInputAlerts := 0
	for _, severityMap := range input {
		totalInputAlerts += len(severityMap)
	}

	s.Require().Equal(totalInputAlerts, totalRespAlerts,
		"количество алёртов не совпадает: ожидалось %d, получено %d",
		totalInputAlerts, totalRespAlerts)

	// Сравниваем каждое входное правило с соответствующим алёртом из ответа
	for alertName, inputSeverityMap := range input {
		respSeverityMap, ok := resp[alertName]
		s.Require().True(ok, "не найден AlertName '%s' в ответе", alertName)

		for severity, inputAlert := range inputSeverityMap {
			respAlert, ok := respSeverityMap[severity]
			s.Require().True(ok, "не найден алёрт с AlertName '%s' и Severity '%s' в ответе", alertName, severity)

			// Сравниваем все поля входного правила с алёртом из ответа
			compareAlertRuleInputWithAlert(s, &models.AlertsAlertRuleInput{
				AlertTemplateID:  inputAlert.AlertTemplateID,
				DelayFiring:      inputAlert.DelayFiring,
				DelayResolving:   inputAlert.DelayResolving,
				Limit:            inputAlert.Limit,
				Severity:         inputAlert.Severity,
				SeverityIsActive: inputAlert.SeverityIsActive,
			}, respAlert)
		}
	}
}

// getAlertGroup получает группу алёртов по experimentID и productID
func (s *StreamflowTestSuite) getAlertGroup(experimentID int64, productID int64) *models.ResponsesGetAlertGroupResponse {
	group, err := s.c.Alerts.GetAPIV2ExperimentAlerts(&alerts.GetAPIV2ExperimentAlertsParams{
		ExperimentID: experimentID,
		ProductID:  productID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(group)
	s.Require().NotNil(group.Payload)
	return group.Payload
}

// countTotalRules подсчитывает общее количество правил в группе алёртов
func countTotalRules(alerts []*models.AlertsAlerts) int {
	total := 0
	for _, alertGroup := range alerts {
		total += len(alertGroup.Alerts)
	}
	return total
}

// getAllRuleIDs возвращает все ruleID из группы алёртов
func getAllRuleIDs(group *models.ResponsesGetAlertGroupResponse) []int64 {
	var ruleIDs []int64
	for _, alertGroup := range group.Alerts {
		for _, alert := range alertGroup.Alerts {
			if alert.RuleID != nil {
				ruleIDs = append(ruleIDs, *alert.RuleID)
			}
		}
	}
	return ruleIDs
}
