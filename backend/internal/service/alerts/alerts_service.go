package alerts

import (
	"context"
	"database/sql"
	"errors"
	"sort"

	"github.com/jackc/pgx/v5"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/db/core"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
	alertserrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors/alerts"
)

var alertSeverityOrder = map[string]int{
	"info":     0,
	"warning":  1,
	"critical": 2,
	"disaster": 3,
}

type AlertsService struct {
	repo *repository.Repository
}

func NewAlertsService(repo *repository.Repository) *AlertsService {
	return &AlertsService{
		repo: repo,
	}
}

// badReqErr создаёт ServiceError с кодом ошибки для алёртов
// code - код ошибки из alertserrors
// Если err уже является ServiceError, возвращает его как есть (избегает двойного оборачивания)
func badReqErr(code string, err error) error {
	if code == "" {
		code = alertserrors.ErrCodeBadRequest
	}

	var svcErr *serviceerrors.ServiceError
	if errors.As(err, &svcErr) {
		return err
	}
	// Используем код ошибки как Message - он будет распознан в convertServiceError
	return serviceerrors.NewEntityBadRequestError(serviceerrors.EntityAlerts, code, err)
}

func (s *AlertsService) GetProducts(ctx context.Context, experimentID int32) ([]int32, error) {

	products, err := s.repo.DB.SelectProducts(ctx, experimentID)
	if err != nil {
		return nil, badReqErr(alertserrors.RetryPage, err)
	}

	return products, nil
}
func (s *AlertsService) DeleteExperimentAlertGroups(ctx context.Context, experimentID int32) error {

	DBalertGroups, err := s.repo.DB.SelectAlertGroups(ctx, experimentID)
	if err != nil {
		return badReqErr(alertserrors.RetryPage, err)
	}

	if len(DBalertGroups) == 0 {
		return nil
	}

	alertGroupIds := make([]int32, 0, len(DBalertGroups))
	productIds := make([]int32, 0, len(DBalertGroups))

	for _, alertGroupId := range DBalertGroups {
		productIds = append(productIds, alertGroupId.ProductID)
		experiment, _, err := s.repo.DB.GetAlertGroupExperiment(ctx, alertGroupId.ExperimentID)
		if err != nil {
			return badReqErr(alertserrors.RetryPage, err)
		}
		err = s.repo.Clients.OneAlerts.DeleteAlertGroup(ctx, alerts.AlertGroup{
			AlertGroupId: alertGroupId.AlertGroupID,
			ProductId:    alertGroupId.ProductID,
			Experiment:     experiment,
		})
		if err != nil {
			return badReqErr(alertserrors.RetryPage, err)
		}
		alertGroupIds = append(alertGroupIds, alertGroupId.AlertGroupID)
	}

	resDelGroups := s.repo.DB.DeleteAlertGroups(ctx, alertGroupIds)
	if err := resDelGroups.Close(); err != nil {
		return badReqErr(alertserrors.ContactSupport, err)
	}

	productIdsForDeletion := make([]int32, 0, len(productIds))
	for _, productId := range productIds {
		alertsByProductIds, err := s.repo.DB.SelectAlerts(ctx, core.SelectAlertsParams{
			ProductID:  productId,
			ExperimentID: experimentID,
		})
		if err != nil {
			return badReqErr(alertserrors.RetryPage, err)
		}
		if len(alertsByProductIds) != 0 {
			continue
		}
		productIdsForDeletion = append(productIdsForDeletion, productId)
	}

	resDelProducts := s.repo.DB.DeleteNotificationProductIds(ctx, productIdsForDeletion)
	if err := resDelProducts.Close(); err != nil {
		return badReqErr(alertserrors.ContactSupport, err)
	}

	return nil
}

func (s *AlertsService) checkDeletionExperiment(ctx context.Context, experimentID int32, productID int32) (alerts.AlertGroup, error) {
	dbAlertGroup, isDeleted, err := s.repo.DB.GetAlerts(ctx, experimentID, productID)
	if err != nil {
		return alerts.AlertGroup{}, badReqErr(alertserrors.RetryPage, err)
	}

	if isDeleted {
		err := s.DeleteExperimentAlertGroups(ctx, experimentID)
		if err != nil {
			return alerts.AlertGroup{}, err
		}
		return alerts.AlertGroup{}, badReqErr(alertserrors.ErrCodeCannotCreateForDeletedExperiment, nil)
	}

	return dbAlertGroup, nil
}

func (s *AlertsService) prepareAlertGroupForResponse(alertGroup alerts.AlertGroup) (responses.GetAlertGroupResponse, error) {

	resp := responses.GetAlertGroupResponse{
		AlertGroupId:          alertGroup.AlertGroupId,
		ExperimentId:            alertGroup.Experiment.ExperimentId,
		NotificationProductId: alertGroup.ProductId,
		Alerts:                make([]alerts.Alerts, 0, len(alertGroup.AlertRules)),
	}

	alertTemplates, err := s.repo.Clients.OneAlerts.AlertGenerator.GetAlertTemplates()
	if err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}

	alertRules := make(map[string][]alerts.Alert, len(alertGroup.AlertRules))

	for ruleId, rule := range alertGroup.AlertRules {
		alertTemplate, ok := alertTemplates[rule.AlertTemplateId]
		if !ok {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeAlertTemplateNotFound, nil)
		}

		alert := alerts.Alert{
			GraphicName:      alertTemplate.GraphicName,
			RuleId:           ruleId,
			AlertTemplateId:  rule.AlertTemplateId,
			AlertDescription: alertTemplate.AlertDescription,
			Severity:         rule.Severity,
			SeverityIsActive: rule.SeverityIsActive,
			Limit:            rule.Limit,
			DelayFiring:      rule.DelayFiring,
			DelayResolving:   rule.DelayResolving,
			HasLimit:         alertTemplate.HasLimit,
			TypeLimit:        alertTemplate.TypeLimit,
		}

		if _, ok := alertRules[alertTemplate.AlertName]; !ok {
			alertRules[alertTemplate.AlertName] = make([]alerts.Alert, 0)
		}

		alertRules[alertTemplate.AlertName] = append(alertRules[alertTemplate.AlertName], alert)
	}

	for alertName, alertList := range alertRules {
		sort.Slice(alertList, func(i, j int) bool {
			return alertSeverityOrder[alertList[i].Severity] < alertSeverityOrder[alertList[j].Severity]
		})
		resp.Alerts = append(resp.Alerts, alerts.Alerts{
			AlertName:        alertName,
			AlertDescription: alertList[0].AlertDescription,
			Alerts:           alertList,
		})
	}

	return resp, nil
}

func (s *AlertsService) CreateNewAlerts(ctx context.Context, r *requests.CreateAlertGroupRequest) (responses.GetAlertGroupResponse, error) {

	dbAlertGroup, err := s.checkDeletionExperiment(ctx, r.ExperimentID, r.ProductID)
	if err != nil {
		return responses.GetAlertGroupResponse{}, err
	}

	if len(r.AlertRules) == 0 {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeNoAlertsAdded, nil)
	}

	//проверяем есть ли интеграция для такого продукта
	if err := s.repo.Clients.OneAlerts.CheckIntegration(ctx, r.ProductID); err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeCheckIntegration, err)
	}

	for _, rule := range r.AlertRules {
		ruleForCheck := alerts.AlertRule{
			AlertTemplateId:  rule.AlertTemplateId,
			Severity:         rule.Severity,
			SeverityIsActive: rule.SeverityIsActive,
			Limit:            rule.Limit,
			DelayFiring:      rule.DelayFiring,
			DelayResolving:   rule.DelayResolving,
		}
		if err := s.repo.Clients.OneAlerts.AlertGenerator.ValidateRule(ruleForCheck); err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
		}
	}

	if dbAlertGroup.ProductId == -1 {
		err := s.repo.DB.AddNewProduct(ctx, r.ProductID)
		if err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ContactSupport, err)
		}
	}

	err = checkDuplicateAlertRules(dbAlertGroup, r.AlertRules)
	if err != nil {
		return responses.GetAlertGroupResponse{}, err
	}

	tx, err := s.repo.DB.(*db.Wrapper).Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}
	committed := false

	defer func() {
		if !committed {
			_ = tx.Rollback(ctx)
		}
	}()

	txCtx := db.WithTx(ctx, tx)

	alertGroupID := dbAlertGroup.AlertGroupId

	if alertGroupID == -1 {
		alertGroupID, err = s.repo.DB.CreateAlertGroupTx(txCtx, r.ProductID, r.ExperimentID)
		if err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ContactSupport, err)
		}
	}

	if err := s.repo.DB.InsertAlertRulesTx(txCtx, alertGroupID, r.AlertRules); err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ContactSupport, err)
	}

	alertGroupForApi, _, err := s.repo.DB.GetAlerts(txCtx, r.ExperimentID, r.ProductID)
	if err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}

	for _, rule := range alertGroupForApi.AlertRules {
		transformedRule, err := s.repo.Clients.OneAlerts.AlertGenerator.TransformRule(rule)
		if err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
		}
		alertGroupForApi.AlertRules[rule.RuleId] = transformedRule
	}

	if err := s.repo.Clients.OneAlerts.WorkWithAlerts(txCtx, alertGroupForApi); err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}

	if err := tx.Commit(ctx); err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}
	committed = true

	alertRules, alertGroupId, err := s.getAlertsForResponse(ctx, r.ExperimentID, r.ProductID)
	if err != nil {
		return responses.GetAlertGroupResponse{}, err
	}

	return responses.GetAlertGroupResponse{
		AlertGroupId:          alertGroupId,
		ExperimentId:            r.ExperimentID,
		NotificationProductId: r.ProductID,
		Alerts:                alertRules,
	}, nil
}

func (s *AlertsService) DeleteAlerts(ctx context.Context, r *requests.DeleteAlertsRequest) (responses.GetAlertGroupResponse, error) {
	dbAlertGroup, err := s.checkDeletionExperiment(ctx, r.ExperimentID, r.ProductID)
	if err != nil {
		return responses.GetAlertGroupResponse{}, err
	}

	if dbAlertGroup.AlertGroupId == -1 {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeAlertsNotExist, nil)
	}

	if dbAlertGroup.AlertGroupId != r.AlertGroupId {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeUnexpectedAlertGroup, nil)
	}

	if len(r.DeletingRules) == 0 {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeNoAlertsAdded, nil)
	}

	if len(r.DeletingRules) > len(dbAlertGroup.AlertRules) {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeTooManyRulesToDelete, nil)
	}

	//проверяем есть ли интеграция для такого продукта
	if err := s.repo.Clients.OneAlerts.CheckIntegration(ctx, r.ProductID); err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeCheckIntegration, err)
	}

	for _, ruleId := range r.DeletingRules {
		if _, ok := dbAlertGroup.AlertRules[ruleId]; !ok {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeAlertNotFound, nil)
		}
	}

	tx, err := s.repo.DB.(*db.Wrapper).Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}
	committed := false

	defer func() {
		if !committed {
			_ = tx.Rollback(ctx)
		}
	}()

	txCtx := db.WithTx(ctx, tx)

	if len(r.DeletingRules) == len(dbAlertGroup.AlertRules) {
		err = s.repo.DB.DeleteAlertGroup(txCtx, dbAlertGroup)
		if err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ContactSupport, err)
		}
		err = s.repo.Clients.OneAlerts.DeleteAlertGroup(txCtx, alerts.AlertGroup{
			AlertGroupId: dbAlertGroup.AlertGroupId,
			ProductId:    dbAlertGroup.ProductId,
			Experiment:     dbAlertGroup.Experiment,
		})
		if err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
		}
	} else {
		err = s.repo.DB.DeleteAlrtRules(txCtx, r.DeletingRules)
		if err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ContactSupport, err)
		}
		updatedAlertGroup, _, err := s.repo.DB.GetAlerts(txCtx, r.ExperimentID, r.ProductID)
		if err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
		}

		for _, rule := range updatedAlertGroup.AlertRules {
			transformedRule, err := s.repo.Clients.OneAlerts.AlertGenerator.TransformRule(rule)
			if err != nil {
				return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
			}
			updatedAlertGroup.AlertRules[rule.RuleId] = transformedRule
		}

		if err := s.repo.Clients.OneAlerts.WorkWithAlerts(txCtx, updatedAlertGroup); err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}
	committed = true

	alertRules, alertGroupId, err := s.getAlertsForResponse(ctx, r.ExperimentID, r.ProductID)
	if err != nil {
		return responses.GetAlertGroupResponse{}, err
	}

	return responses.GetAlertGroupResponse{
		AlertGroupId:          alertGroupId,
		ExperimentId:            r.ExperimentID,
		NotificationProductId: r.ProductID,
		Alerts:                alertRules,
	}, nil
}

func (s *AlertsService) GetOptions() (alerts.AlertOptions, error) {
	alertTemplates, err := s.repo.Clients.OneAlerts.AlertGenerator.GetAlertTemplates()
	if err != nil {
		return alerts.AlertOptions{}, badReqErr(alertserrors.RetryPage, err)
	}

	typeLimits, err := s.repo.Clients.OneAlerts.AlertGenerator.GetAlertTypeLimits()
	if err != nil {
		return alerts.AlertOptions{}, badReqErr(alertserrors.RetryPage, err)
	}

	return alerts.AlertOptions{
		AlertTemplates: alertTemplates,
		TypeLimits:     typeLimits,
		DelayFiring:    s.repo.Clients.OneAlerts.AlertGenerator.GetDelayFiringDescription(),
		DelayResolving: s.repo.Clients.OneAlerts.AlertGenerator.GetDelayResolvingDescription(),
	}, nil
}

func (s *AlertsService) GetAlertGroup(ctx context.Context, r *requests.GetAlertsRequest) (responses.GetAlertGroupResponse, error) {

	alertGroup, isDeleted, err := s.repo.DB.GetAlerts(ctx, r.ExperimentID, r.ProductID)
	if err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}

	if isDeleted {
		err := s.DeleteExperimentAlertGroups(ctx, r.ExperimentID)
		if err != nil {
			return responses.GetAlertGroupResponse{}, err
		}
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeCannotGetForDeletedExperiment, nil)
	}

	return s.prepareAlertGroupForResponse(alertGroup)
}

func (s *AlertsService) ChangeAlertSeverities(ctx context.Context, r *requests.ChangeAlertSeveritiesRequest) (responses.GetAlertGroupResponse, error) {

	if len(r.AlertRules) == 0 {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeNoAlertsSpecified, nil)
	}

	alertTemplate := r.AlertRules[0].AlertTemplateId
	for _, rule := range r.AlertRules {
		if rule.AlertTemplateId != alertTemplate {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeCannotChangeAlertSeverities, nil)
		}
	}

	dbAlertGroup, err := s.checkDeletionExperiment(ctx, r.ExperimentID, r.ProductID)
	if err != nil {
		return responses.GetAlertGroupResponse{}, err
	}

	if dbAlertGroup.AlertGroupId == -1 {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeAlertsNotExist, nil)
	}

	//проверяем есть ли интеграция для такого продукта
	if err := s.repo.Clients.OneAlerts.CheckIntegration(ctx, r.ProductID); err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ErrCodeCheckIntegration, err)
	}

	for _, rule := range r.AlertRules {
		ruleForCheck := alerts.AlertRule{
			AlertTemplateId:  rule.AlertTemplateId,
			Severity:         rule.Severity,
			SeverityIsActive: rule.SeverityIsActive,
			Limit:            rule.Limit,
			DelayFiring:      rule.DelayFiring,
			DelayResolving:   rule.DelayResolving,
		}
		if err := s.repo.Clients.OneAlerts.AlertGenerator.ValidateRule(ruleForCheck); err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
		}
	}

	DeletingAlerts := make([]int32, 0, len(dbAlertGroup.AlertRules))

	for _, rule := range dbAlertGroup.AlertRules {
		if rule.AlertTemplateId == alertTemplate {
			DeletingAlerts = append(DeletingAlerts, rule.RuleId)
		}
	}

	tx, err := s.repo.DB.(*db.Wrapper).Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}
	committed := false

	defer func() {
		if !committed {
			_ = tx.Rollback(ctx)
		}
	}()

	txCtx := db.WithTx(ctx, tx)

	err = s.repo.DB.DeleteAlrtRules(txCtx, DeletingAlerts)
	if err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ContactSupport, err)
	}

	if err := s.repo.DB.InsertAlertRulesTx(txCtx, dbAlertGroup.AlertGroupId, r.AlertRules); err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ContactSupport, err)
	}

	alertGroupForApi, _, err := s.repo.DB.GetAlerts(txCtx, r.ExperimentID, r.ProductID)
	if err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}

	if len(alertGroupForApi.AlertRules) == 0 {
		err = s.repo.DB.DeleteAlertGroup(txCtx, dbAlertGroup)
		if err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.ContactSupport, err)
		}
		err = s.repo.Clients.OneAlerts.DeleteAlertGroup(txCtx, alerts.AlertGroup{
			AlertGroupId: dbAlertGroup.AlertGroupId,
			ProductId:    dbAlertGroup.ProductId,
			Experiment:     dbAlertGroup.Experiment,
		})
		if err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
		}
	}

	for _, rule := range alertGroupForApi.AlertRules {
		transformedRule, err := s.repo.Clients.OneAlerts.AlertGenerator.TransformRule(rule)
		if err != nil {
			return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
		}
		alertGroupForApi.AlertRules[rule.RuleId] = transformedRule
	}

	if err := s.repo.Clients.OneAlerts.WorkWithAlerts(txCtx, alertGroupForApi); err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}

	if err := tx.Commit(ctx); err != nil {
		return responses.GetAlertGroupResponse{}, badReqErr(alertserrors.RetryPage, err)
	}
	committed = true

	alertRules, alertGroupId, err := s.getAlertsForResponse(ctx, r.ExperimentID, r.ProductID)
	if err != nil {
		return responses.GetAlertGroupResponse{}, err
	}

	return responses.GetAlertGroupResponse{
		AlertGroupId:          alertGroupId,
		ExperimentId:            r.ExperimentID,
		NotificationProductId: r.ProductID,
		Alerts:                alertRules,
	}, nil
}

func (s *AlertsService) ChangeAlert(ctx context.Context, r *requests.ChangeAlertRequest) error {

	dbAlertGroup, err := s.checkDeletionExperiment(ctx, r.ExperimentID, r.ProductID)
	if err != nil {
		return err
	}

	if dbAlertGroup.AlertGroupId == -1 {
		return badReqErr(alertserrors.ErrCodeAlertsNotExist, nil)
	}

	if _, ok := dbAlertGroup.AlertRules[r.RuleId]; !ok {
		return badReqErr(alertserrors.ErrCodeAlertNotFound, nil)
	}

	//проверяем есть ли интеграция для такого продукта
	if err := s.repo.Clients.OneAlerts.CheckIntegration(ctx, r.ProductID); err != nil {
		return badReqErr(alertserrors.ErrCodeCheckIntegration, err)
	}

	ruleForCheck := alerts.AlertRule{
		AlertTemplateId:  r.AlertTemplateId,
		Severity:         r.Severity,
		SeverityIsActive: *r.SeverityIsActive,
		Limit:            r.Limit,
		DelayFiring:      r.DelayFiring,
		DelayResolving:   r.DelayResolving,
	}
	if err := s.repo.Clients.OneAlerts.AlertGenerator.ValidateRule(ruleForCheck); err != nil {
		return badReqErr(alertserrors.RetryPage, err)
	}

	alertsForDBChange := []core.UpdateAlertRuleParams{
		{
			TemplateAlertID:  r.AlertTemplateId,
			RuleID:           r.RuleId,
			SeverityName:     r.Severity,
			SeverityIsActive: r.SeverityIsActive,
			AlertLimit:       r.Limit,
			DelayFiring:      r.DelayFiring,
			DelayResolving:   r.DelayResolving,
		},
	}

	tx, err := s.repo.DB.(*db.Wrapper).Pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return badReqErr(alertserrors.RetryPage, err)
	}
	committed := false

	defer func() {
		if !committed {
			_ = tx.Rollback(ctx)
		}
	}()

	txCtx := db.WithTx(ctx, tx)

	updateRes := s.repo.DB.(*db.Wrapper).WithTx(tx).UpdateAlertRule(txCtx, alertsForDBChange)
	if err := updateRes.Close(); err != nil {
		return badReqErr(alertserrors.ContactSupport, err)
	}

	alertGroupForApi, _, err := s.repo.DB.GetAlerts(txCtx, r.ExperimentID, r.ProductID)
	if err != nil {
		return badReqErr(alertserrors.RetryPage, err)
	}

	for _, rule := range alertGroupForApi.AlertRules {
		transformedRule, err := s.repo.Clients.OneAlerts.AlertGenerator.TransformRule(rule)
		if err != nil {
			return badReqErr(alertserrors.RetryPage, err)
		}
		alertGroupForApi.AlertRules[rule.RuleId] = transformedRule
	}

	if err := s.repo.Clients.OneAlerts.WorkWithAlerts(txCtx, alertGroupForApi); err != nil {
		return badReqErr(alertserrors.RetryPage, err)
	}

	if err := tx.Commit(ctx); err != nil {
		return badReqErr(alertserrors.RetryPage, err)
	}
	committed = true

	return nil
}

func (s *AlertsService) getAlertsForResponse(ctx context.Context, experimentID int32, productID int32) ([]alerts.Alerts, int32, error) {

	rules, err := s.repo.DB.SelectAlerts(ctx, core.SelectAlertsParams{
		ProductID:  productID,
		ExperimentID: experimentID,
	})
	if err != nil {
		return nil, -1, badReqErr(alertserrors.RetryPage, err)
	}

	if len(rules) == 0 {
		ag, err := s.repo.DB.SelectAlertGroup(ctx, core.SelectAlertGroupParams{
			ProductID:  productID,
			ExperimentID: experimentID,
		})
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return nil, -1, nil
			}
			return nil, -1, badReqErr(alertserrors.RetryPage, err)
		}
		res := s.repo.DB.DeleteAlertGroups(ctx, []int32{ag.AlertGroupID})
		if err := res.Close(); err != nil {
			return nil, -1, badReqErr(alertserrors.ContactSupport, err)
		}
		return nil, -1, nil
	}

	alertGroupId := rules[0].AlertGroupID
	alertGroup := alerts.AlertGroup{
		AlertGroupId: alertGroupId,
		ProductId:    productID,
		Experiment:     alerts.Experiment{
			ExperimentId: experimentID,
		},
		AlertRules:   make(map[int32]alerts.AlertRule, len(rules)),
	}
	for _, rule := range rules {
		alertGroup.AlertRules[rule.RuleID] = alerts.AlertRule{
			RuleId:           rule.RuleID,
			AlertTemplateId:  rule.TemplateAlertID,
			Severity:         rule.SeverityName,
			SeverityIsActive: *rule.SeverityIsActive,
			Limit:            rule.AlertLimit,
			DelayFiring:      rule.DelayFiring,
			DelayResolving:   rule.DelayResolving,
		}
	}
	res, err := s.prepareAlertGroupForResponse(alertGroup)
	if err != nil {
		return nil, -1, err
	}
	return res.Alerts, alertGroupId, nil
}

func checkDuplicateAlertRules(rowDBRules alerts.AlertGroup, reqRules []alerts.AlertRuleInput) error {
	dbRules := make(map[int32]map[string]struct{})
	for _, rule := range rowDBRules.AlertRules {
		if _, ok := dbRules[rule.AlertTemplateId]; !ok {
			dbRules[rule.AlertTemplateId] = make(map[string]struct{})
		}
		if _, ok := dbRules[rule.AlertTemplateId][rule.Severity]; ok {
			return badReqErr(alertserrors.ErrCodeDuplicateAlertRuleInDB, nil)
		}
		dbRules[rule.AlertTemplateId][rule.Severity] = struct{}{}
	}

	for _, rule := range reqRules {
		if _, ok := dbRules[rule.AlertTemplateId]; !ok {
			dbRules[rule.AlertTemplateId] = make(map[string]struct{})
		}
		if _, ok := dbRules[rule.AlertTemplateId][rule.Severity]; ok {
			return badReqErr(alertserrors.ErrCodeCannotAddRuleWithExistingSeverity, nil)
		}
		dbRules[rule.AlertTemplateId][rule.Severity] = struct{}{}
	}
	return nil
}
