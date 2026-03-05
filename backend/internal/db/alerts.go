package db

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"path/filepath"
	"strconv"
	"strings"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models"
)

func (w *Wrapper) GetAlerts(ctx context.Context, experimentID int32, productID int32) (alerts.AlertGroup, bool, error) {
	experiment, isDeleted, err := w.GetAlertGroupExperiment(ctx, experimentID)
	if err != nil {
		return alerts.AlertGroup{}, isDeleted, err
	}

	DBProductID, err := w.GetProductId(ctx, productID)
	if err != nil {
		return alerts.AlertGroup{}, isDeleted, err
	}

	rules, alertGroupId, err := w.GetRules(ctx, experimentID, DBProductID)
	if err != nil {
		return alerts.AlertGroup{}, isDeleted, err
	}

	return alerts.AlertGroup{
		AlertGroupId: alertGroupId,
		ProductId:    DBProductID,
		Experiment:     experiment,
		AlertRules:   rules,
	}, isDeleted, nil
}

func (w *Wrapper) GetAlertGroupExperiment(ctx context.Context, experimentID int32) (experiment alerts.Experiment, isDeleted bool, err error) {

	// Проверяем наличие транзакции в контексте
	tx, ok := GetTx(ctx)
	var experimentRow core.SelectExperimentForAlertsRow
	var projectConfig core.SelectProjectConfigRow

	if ok {
		// Используем транзакцию для чтения данных внутри транзакции
		experimentRow, err = w.WithTx(tx).SelectExperimentForAlerts(ctx, experimentID)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return alerts.Experiment{}, false, fmt.Errorf("Experiment с id %d в бд не найден", experimentID)
			}
			return alerts.Experiment{}, false, fmt.Errorf("Ошибка получения experiment с id %d из бд", experimentID)
		}

		projectConfig, err = w.WithTx(tx).SelectProjectConfig(ctx, experimentRow.ProjectVersionID.Int32)
		if err != nil {
			return alerts.Experiment{}, false, fmt.Errorf("Ошибка получения конфигурации проекта для experiment %d", experimentRow.ExperimentID)
		}
	} else {
		// Используем пул соединений, если транзакции нет
		experimentRow, err = w.SelectExperimentForAlerts(ctx, experimentID)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return alerts.Experiment{}, false, fmt.Errorf("Experiment с id %d в бд не найден", experimentID)
			}
			return alerts.Experiment{}, false, fmt.Errorf("Ошибка получения experiment с id %d из бд", experimentID)
		}

		projectConfig, err = w.SelectProjectConfig(ctx, experimentRow.ProjectVersionID.Int32)
		if err != nil {
			return alerts.Experiment{}, false, fmt.Errorf("Ошибка получения конфигурации проекта для experiment %d", experimentRow.ExperimentID)
		}
	}

	var meta models.ExperimentMeta
	err = json.Unmarshal(projectConfig.Config, &meta)
	if err != nil {
		return alerts.Experiment{}, false, fmt.Errorf("Ошибка unmarshal конфигурации проекта для experiment %d", experimentRow.ExperimentID)
	}
	if meta.YT.WorkDir == "" {
		return alerts.Experiment{}, false, fmt.Errorf("Workdir не найден в конфигурации проекта для experiment %d", experimentRow.ExperimentID)
	}
	rest := filepath.Join(meta.YT.WorkDir, strconv.Itoa(int(experimentRow.ExperimentID)))
	ytPath := "//" + strings.TrimPrefix(rest, "/")

	isDeletes := experimentRow.PipeIsDeleted || experimentRow.ProjectIsDeleted

	return alerts.Experiment{
		ExperimentId:   experimentRow.ExperimentID,
		ExperimentName: experimentRow.ExperimentName,
		ProjectId:    experimentRow.ProjectID,
		ProjectName:  experimentRow.ProjectName,
		YTWorkDir:    ytPath,
	}, isDeletes, nil
}

func (w *Wrapper) GetProductId(ctx context.Context, productID int32) (int32, error) {

	// Проверяем наличие транзакции в контексте
	tx, ok := GetTx(ctx)
	var product int32
	var err error

	if ok {
		// Используем транзакцию для чтения данных внутри транзакции
		product, err = w.WithTx(tx).SelectProduct(ctx, productID)
	} else {
		// Используем пул соединений, если транзакции нет
		product, err = w.SelectProduct(ctx, productID)
	}

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return -1, nil
		}
		return -1, fmt.Errorf("Ошибка получения продукта %d из бд", productID)
	}

	return product, nil
}

func (w *Wrapper) GetRules(ctx context.Context, experimentID int32, productID int32) (map[int32]alerts.AlertRule, int32, error) {

	if productID == -1 {
		return nil, -1, nil
	}

	// Проверяем наличие транзакции в контексте
	tx, ok := GetTx(ctx)
	var rules []core.SelectAlertsRow
	var err error

	if ok {
		// Используем транзакцию для чтения данных внутри транзакции
		rules, err = w.WithTx(tx).SelectAlerts(ctx, core.SelectAlertsParams{
			ProductID:  productID,
			ExperimentID: experimentID,
		})
	} else {
		// Используем пул соединений, если транзакции нет
		rules, err = w.SelectAlerts(ctx, core.SelectAlertsParams{
			ProductID:  productID,
			ExperimentID: experimentID,
		})
	}

	if err != nil {
		return nil, -1, fmt.Errorf("Ошибка получения алёртов для experiment %d и product %d из бд", experimentID, productID)
	}

	if len(rules) == 0 {
		return nil, -1, nil
	}

	alertRules := make(map[int32]alerts.AlertRule, len(rules))
	alertGroupId := rules[0].AlertGroupID

	for _, rule := range rules {
		if rule.AlertGroupID != alertGroupId {
			return nil, -1, fmt.Errorf("Запрос в бд вернул несколько групп алёртов для experiment %d и product %d", experimentID, productID)
		}
		if _, ok := alertRules[rule.RuleID]; ok {
			return nil, -1, fmt.Errorf("Запрос в бд вернул несколько алёртов с одним rule_id: %d", rule.RuleID)
		}

		alertRules[rule.RuleID] = alerts.AlertRule{
			RuleId:           rule.RuleID,
			AlertTemplateId:  rule.TemplateAlertID,
			Severity:         rule.SeverityName,
			SeverityIsActive: *rule.SeverityIsActive,
			Limit:            rule.AlertLimit,
			DelayFiring:      rule.DelayFiring,
			DelayResolving:   rule.DelayResolving,
		}
	}

	return alertRules, alertGroupId, nil
}

func (w *Wrapper) AddNewProduct(ctx context.Context, productID int32) error {
	err := w.InsertProduct(ctx, productID)
	if err != nil {
		return fmt.Errorf("Ошибка добавления продукта %d в бд", productID)
	}
	return nil
}

func (w *Wrapper) GetRulesByTemplate(ctx context.Context, experimentID int32, productID int32, templateID int32) (map[int32]alerts.AlertRule, int32, error) {

	if productID == -1 {
		return nil, -1, nil
	}

	// Проверяем наличие транзакции в контексте
	tx, ok := GetTx(ctx)
	var rules []core.SelectAlertsByTemplateRow
	var err error

	if ok {
		// Используем транзакцию для чтения данных внутри транзакции
		rules, err = w.WithTx(tx).SelectAlertsByTemplate(ctx, core.SelectAlertsByTemplateParams{
			ProductID:       productID,
			ExperimentID:      experimentID,
			TemplateAlertID: templateID,
		})
	} else {
		// Используем пул соединений, если транзакции нет
		rules, err = w.SelectAlertsByTemplate(ctx, core.SelectAlertsByTemplateParams{
			ProductID:       productID,
			ExperimentID:      experimentID,
			TemplateAlertID: templateID,
		})
	}

	if err != nil {
		return nil, -1, fmt.Errorf("Ошибка получения алёртов для experiment %d и product %d и template %d из бд", experimentID, productID, templateID)
	}

	if len(rules) == 0 {
		return nil, -1, nil
	}

	alertRules := make(map[int32]alerts.AlertRule, len(rules))
	alertGroupId := rules[0].AlertGroupID

	for _, rule := range rules {
		if rule.AlertGroupID != alertGroupId {
			return nil, -1, fmt.Errorf("Запрос в бд вернул несколько групп алёртов для experiment %d и product %d и template %d", experimentID, productID, templateID)
		}
		if _, ok := alertRules[rule.RuleID]; ok {
			return nil, -1, fmt.Errorf("Запрос в бд вернул несколько алёртов с одним rule_id: %d", rule.RuleID)
		}

		alertRules[rule.RuleID] = alerts.AlertRule{
			RuleId:           rule.RuleID,
			AlertTemplateId:  rule.TemplateAlertID,
			Severity:         rule.SeverityName,
			SeverityIsActive: *rule.SeverityIsActive,
			Limit:            rule.AlertLimit,
			DelayFiring:      rule.DelayFiring,
			DelayResolving:   rule.DelayResolving,
		}
	}

	return alertRules, alertGroupId, nil
}

func (w *Wrapper) CreateAlertGroupTx(ctx context.Context, productID int32, experimentID int32) (int32, error) {

	tx, ok := GetTx(ctx)

	if !ok {
		return -1, fmt.Errorf("в контексте нет транзакции")
	}

	err := w.WithTx(tx).InsertAlertGroup(ctx, core.InsertAlertGroupParams{
		ProductID:  productID,
		ExperimentID: experimentID,
	})
	if err != nil {
		return -1, err
	}

	alertGroup, err := w.WithTx(tx).SelectAlertGroup(ctx, core.SelectAlertGroupParams{
		ProductID:  productID,
		ExperimentID: experimentID,
	})
	if err != nil {
		return -1, err
	}

	return alertGroup.AlertGroupID, nil
}

func (w *Wrapper) InsertAlertRulesTx(ctx context.Context, alertGroupID int32, alertRules []alerts.AlertRuleInput) error {

	tx, ok := GetTx(ctx)

	if !ok {
		return fmt.Errorf("в контексте нет транзакции")
	}

	insertAlertRules := make([]core.InsertAlertRuleParams, 0, len(alertRules))
	for _, alertRule := range alertRules {
		insertAlertRules = append(insertAlertRules, core.InsertAlertRuleParams{
			AlertGroupID:     alertGroupID,
			TemplateAlertID:  alertRule.AlertTemplateId,
			SeverityName:     alertRule.Severity,
			SeverityIsActive: &alertRule.SeverityIsActive,
			AlertLimit:       alertRule.Limit,
			DelayFiring:      alertRule.DelayFiring,
			DelayResolving:   alertRule.DelayResolving,
		})
	}

	res := w.WithTx(tx).InsertAlertRule(ctx, insertAlertRules)
	if err := res.Close(); err != nil {
		return err
	}

	return nil
}

type ChangeAlertsParams struct {
	ProductID      int32
	ExperimentID     int32
	CreatingAlerts []core.InsertAlertRuleParams
	ChangingAlerts []core.UpdateAlertRuleParams
	DeletingAlerts []int32
}

func (w *Wrapper) DeleteAlrtRules(ctx context.Context, ruleIDs []int32) error {

	tx, ok := GetTx(ctx)

	if !ok {
		return fmt.Errorf("в контексте нет транзакции")
	}

	delRes := w.WithTx(tx).DeleteAlertRule(ctx, ruleIDs)
	if err := delRes.Close(); err != nil {
		return err
	}

	return nil
}

func (w *Wrapper) DeleteAlertGroup(ctx context.Context, alertGroup alerts.AlertGroup) error {

	tx, ok := GetTx(ctx)

	if !ok {
		return fmt.Errorf("в контексте нет транзакции")
	}

	delRes := w.WithTx(tx).DeleteAlertGroups(ctx, []int32{alertGroup.AlertGroupId})
	if err := delRes.Close(); err != nil {
		return err
	}

	alertsByProductIds, err := w.WithTx(tx).SelectAlerts(ctx, core.SelectAlertsParams{
		ProductID:  alertGroup.ProductId,
		ExperimentID: alertGroup.Experiment.ExperimentId,
	})
	if err != nil {
		return err
	}
	if len(alertsByProductIds) != 0 {
		return nil
	}

	deleteProduct := w.WithTx(tx).DeleteNotificationProductIds(ctx, []int32{alertGroup.ProductId})
	if err := deleteProduct.Close(); err != nil {
		return err
	}

	return nil
}
