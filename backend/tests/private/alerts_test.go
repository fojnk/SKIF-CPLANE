package private

import (
	"os"
	"path/filepath"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/alerts/generator"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/alerts"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/client/experiment"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/tests/private/models"
)

// Комплексный тест всех операций с алёртами
func (s *StreamflowTestSuite) TestAlerts_ComplexScenario() {

	_, _, pl := s.prepareAlertsEnvironment()

	// Cleanup - удаляем пайплайн, что автоматически удалит все группы алёртов
	defer func() {
		_, _ = s.c.Experiment.DeleteAPIV1Experiment(&experiment.DeleteAPIV1ExperimentParams{
			Request: &models.RequestsDeleteCompleteExperimentRequest{
				ID: &pl.Payload.ID,
			},
			Context: s.ctx,
		})
	}()

	productsEmpty, err := s.c.Alerts.GetAPIV2ExperimentAlertsProducts(&alerts.GetAPIV2ExperimentAlertsProductsParams{
		ExperimentID: pl.Payload.ID,
		Context:    s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(productsEmpty)
	s.Require().Empty(productsEmpty.Payload)

	emptyGroup, err := s.c.Alerts.GetAPIV2ExperimentAlerts(&alerts.GetAPIV2ExperimentAlertsParams{
		ExperimentID: pl.Payload.ID,
		ProductID:  int64(abcProductID),
		Context:    s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(emptyGroup)
	s.Require().NotNil(emptyGroup.Payload)
	s.Require().Equal(int64(-1), *emptyGroup.Payload.AlertGroupID)
	s.Require().Equal(pl.Payload.ID, *emptyGroup.Payload.ExperimentID)
	s.Require().Equal(int64(-1), *emptyGroup.Payload.NotificationProductID)
	s.Require().Empty(emptyGroup.Payload.Alerts)

	createRespTemplate2, err := s.c.Alerts.PostAPIV2ExperimentAlerts(&alerts.PostAPIV2ExperimentAlertsParams{
		ExperimentID: pl.Payload.ID,
		ProductID:  int64(abcProductID),
		Request: &models.RequestsCreateAlertGroupBody{
			AlertRules: getInitialAlertRuleTemplate2(),
		},
		Context: s.ctx,
	})

	s.Require().NoError(err)
	s.Require().NotNil(createRespTemplate2)
	s.Require().NotNil(createRespTemplate2.Payload)
	s.Require().NotEqual(int64(-1), *createRespTemplate2.Payload.AlertGroupID)
	s.Require().NotEmpty(createRespTemplate2.Payload.Alerts)
	s.Require().Len(createRespTemplate2.Payload.Alerts, 1)

	ruleID := createRespTemplate2.Payload.Alerts[0].Alerts[0].RuleID
	s.Require().NotNil(ruleID, "ruleID не должен быть nil")

	alertGroupID := *createRespTemplate2.Payload.AlertGroupID

	createRespTemplate1, err := s.c.Alerts.PostAPIV2ExperimentAlerts(&alerts.PostAPIV2ExperimentAlertsParams{
		ExperimentID: pl.Payload.ID,
		ProductID:  int64(abcProductID),
		Request: &models.RequestsCreateAlertGroupBody{
			AlertRules: getInitialAlertRuleTemplate1(),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(createRespTemplate1)
	s.Require().NotNil(createRespTemplate1.Payload)
	s.Require().Equal(alertGroupID, *createRespTemplate1.Payload.AlertGroupID)

	group := s.getAlertGroup(pl.Payload.ID, int64(abcProductID))
	s.Require().Equal(alertGroupID, *group.AlertGroupID)
	s.Require().Equal(pl.Payload.ID, *group.ExperimentID)
	s.Require().Equal(int64(abcProductID), *group.NotificationProductID)
	s.Require().NotEmpty(group.Alerts)
	s.Require().Len(group.Alerts, 2)

	compareAlertGroupResponseWithInput(s, group, getInitialAlertRules())

	products, err := s.c.Alerts.GetAPIV2ExperimentAlertsProducts(&alerts.GetAPIV2ExperimentAlertsProductsParams{
		ExperimentID: pl.Payload.ID,
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(products)
	s.Require().NotNil(products.Payload)
	s.Require().Contains(products.Payload, int32(abcProductID))

	updateResp, err := s.c.Alerts.PutAPIV2ExperimentAlertsRule(&alerts.PutAPIV2ExperimentAlertsRuleParams{
		ExperimentID: pl.Payload.ID,
		ProductID:  int64(abcProductID),
		Request:    getUpdateAlertRuleBody(ruleID),
		Context:    s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateResp)

	groupAfterUpdate := s.getAlertGroup(pl.Payload.ID, int64(abcProductID))
	s.Require().NotEmpty(groupAfterUpdate.Alerts)

	compareAlertGroupResponseWithInput(s, groupAfterUpdate, getExpectedRulesAfterUpdate())

	s.Require().NotNil(ruleID, "ruleID не должен быть nil")

	deleteOldRuleResp, err := s.c.Alerts.DeleteAPIV2ExperimentAlerts(&alerts.DeleteAPIV2ExperimentAlertsParams{
		ExperimentID: pl.Payload.ID,
		ProductID:  int64(abcProductID),
		Request: &models.RequestsDeleteAlertsBody{
			AlertGroupID:  ptr(*groupAfterUpdate.AlertGroupID),
			DeletingRules: []int64{*ruleID},
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(deleteOldRuleResp)

	updateTemplateResp, err := s.c.Alerts.PutAPIV2ExperimentAlertsTemplate(&alerts.PutAPIV2ExperimentAlertsTemplateParams{
		ExperimentID: pl.Payload.ID,
		ProductID:  int64(abcProductID),
		Request: &models.RequestsChangeAlertSeveritiesBody{
			AlertRules: getUpdateTemplateAlertRules(),
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(updateTemplateResp)

	groupAfterTemplateUpdate := s.getAlertGroup(pl.Payload.ID, int64(abcProductID))
	s.Require().NotEmpty(groupAfterTemplateUpdate.Alerts)
	s.Require().Equal(3, countTotalRules(groupAfterTemplateUpdate.Alerts))

	compareAlertGroupResponseWithInput(s, groupAfterTemplateUpdate, getUpdateTemplateAlertRules())

	allRuleIDs := getAllRuleIDs(groupAfterTemplateUpdate)
	s.Require().NotEmpty(allRuleIDs, "не найдены правила для удаления")

	deleteAllResp, err := s.c.Alerts.DeleteAPIV2ExperimentAlerts(&alerts.DeleteAPIV2ExperimentAlertsParams{
		ExperimentID: pl.Payload.ID,
		ProductID:  int64(abcProductID),
		Request: &models.RequestsDeleteAlertsBody{
			AlertGroupID:  ptr(alertGroupID),
			DeletingRules: allRuleIDs,
		},
		Context: s.ctx,
	})
	s.Require().NoError(err)
	s.Require().NotNil(deleteAllResp)

	finalGroup := s.getAlertGroup(pl.Payload.ID, int64(abcProductID))
	s.Require().Equal(int64(-1), *finalGroup.AlertGroupID)
	s.Require().Empty(finalGroup.Alerts)
}

func (s *StreamflowTestSuite) TestAlertTemplatesExist() {
	alertGen := generator.NewAlertGenerator("")
	templates, err := alertGen.GetAlertTemplates()
	s.Require().NoError(err)
	s.Require().NotNil(templates)
	s.Require().NotEmpty(templates)

	testDir, err := os.Getwd()
	s.Require().NoError(err)

	projectRoot, err := filepath.Abs(filepath.Join(testDir, "..", ".."))
	s.Require().NoError(err)

	templatesDir := filepath.Join(projectRoot, "templates")

	_, err = os.Stat(templatesDir)
	s.Require().NoError(err, "папка templates не найдена: %s", templatesDir)

	for templateID, template := range templates {
		templatePath := alertGen.FindTemplateFilePath(template.TemplateName)

		fullPath := filepath.Join(projectRoot, templatePath)

		_, err := os.Stat(fullPath)
		s.Require().NoError(
			err,
			"шаблон с ID %d (TemplateName: %s) не найден по пути: %s",
			templateID,
			template.TemplateName,
			fullPath,
		)
	}
}
