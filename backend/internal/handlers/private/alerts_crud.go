package private

import (
	"context"
	"sort"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto/alerts"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/setters"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

// getAlertOptionsHandler godoc
//
//	@Summary	get alert templates
//	@Tags		alerts
//	@Produce	json
//	@Success	200	{object}	responses.GetAlertOptionsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/alerts/options [get]
func getAlertOptionsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.EmptyAlertRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {

	options, err := svc.IAlertsService.GetOptions()
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityAlerts)
	}

	templates := make([]responses.AlertTemplateResponse, 0, len(options.AlertTemplates))
	for id, template := range options.AlertTemplates {
		templates = append(templates, responses.AlertTemplateResponse{
			AlertTemplateId:  id,
			GraphicName:      template.GraphicName,
			AlertName:        template.AlertName,
			AlertDescription: template.AlertDescription,
			HasLimit:         template.HasLimit,
			TypeLimit:        template.TypeLimit,
		})
	}

	sort.SliceStable(templates, func(i, j int) bool {
		return templates[i].AlertTemplateId < templates[j].AlertTemplateId
	})

	return responses.GetAlertOptionsResponse{
		AlertTemplates: templates,
		TypeLimits:     options.TypeLimits,
		DelayFiring:    options.DelayFiring,
		DelayResolving: options.DelayResolving,
	}, nil
}

// getProductsHandler godoc
//
//	@Summary	get products for alerts
//	@Tags		alerts
//	@Param		experiment_id	query	int	true	"experiment id"
//	@Param		x-superuser-token	header		string					false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	[]int32
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/alerts/products [get]
func getProductsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetProductsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {

	products, err := svc.IAlertsService.GetProducts(ctx, r.ExperimentID)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityAlerts)
	}

	return products, nil
}

// getAlertGroupHandler godoc
//
//	@Summary	get alert group
//	@Tags		alerts
//	@Param		experiment_id	query	int	true	"experiment id"
//	@Param		product_id	query	int	true	"notification product id"
//	@Param		x-superuser-token	header		string					false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.GetAlertGroupResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/alerts [get]
func getAlertGroupHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetAlertsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {

	resAlertGroup, err := svc.IAlertsService.GetAlertGroup(ctx, &requests.GetAlertsRequest{
		ExperimentID: r.ExperimentID,
		ProductID:  r.ProductID,
	})
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityAlerts)
	}

	return resAlertGroup, nil
}

// createAlertsHandler godoc
//
//	@Summary	create alert group
//	@Tags		alerts
//	@Param		experiment_id	query	int	true	"experiment id"
//	@Param		product_id	query	int	true	"notification product id"
//	@Param		request	body	requests.CreateAlertGroupBody	true	"request body"
//	@Param		x-superuser-token	header		string					false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.GetAlertGroupResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/alerts [post]
func createAlertsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateAlertGroupRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {

	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Create, r.ExperimentID, u); err != nil {
		return nil, err
	}

	r.AlertRules = setters.SetDefaultDelayValues(r.AlertRules)

	resp, err := svc.IAlertsService.CreateNewAlerts(ctx, r)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityAlerts)
	}

	return resp, nil
}

// deleteAlertGroupHandler godoc
//
//	@Summary	delete alert group
//	@Tags		alerts
//	@Param		experiment_id	query	int	true	"experiment id"
//	@Param		product_id	query	int	true	"notification product id"
//	@Param		request	body	requests.DeleteAlertsBody	true	"request body"
//	@Param		x-superuser-token	header		string					false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.GetAlertGroupResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/alerts [delete]
func deleteAlertGroupHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteAlertsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {

	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Delete, r.ExperimentID, u); err != nil {
		return nil, err
	}

	resp, err := svc.IAlertsService.DeleteAlerts(ctx, r)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityAlerts)
	}

	return resp, nil
}

// changeAlertSeveritiesHandler godoc
//
//	@Summary	change alert severities
//	@Tags		alerts
//	@Param		experiment_id	query	int	true	"experiment id"
//	@Param		product_id	query	int	true	"notification product id"
//	@Param		request	body	requests.ChangeAlertSeveritiesBody	true	"request body"
//	@Param		x-superuser-token	header		string					false	"superuser token"
//	@Produce	json
//	@Success	200	{object}	responses.GetAlertGroupResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/alerts/template [put]
func changeAlertSeveritiesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ChangeAlertSeveritiesRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {

	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Edit, r.ExperimentID, u); err != nil {
		return nil, err
	}

	r.AlertRules = setters.SetDefaultDelayValues(r.AlertRules)

	resp, err := svc.IAlertsService.ChangeAlertSeverities(ctx, r)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityAlerts)
	}

	return resp, nil
}

// changeAlertHandler godoc
//
//	@Summary	change alert
//	@Tags		alerts
//	@Param		experiment_id	query	int	true	"experiment id"
//	@Param		product_id	query	int	true	"notification product id"
//	@Param		request	body	requests.ChangeAlertBody	true	"request body"
//	@Param		x-superuser-token	header		string					false	"superuser token"
//	@Produce	json
//	@Success	200
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/alerts/rule [put]
func changeAlertHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ChangeAlertRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {

	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Edit, r.ExperimentID, u); err != nil {
		return nil, err
	}

	delayValues := setters.SetDefaultDelayValues([]alerts.AlertRuleInput{
		{
			DelayFiring:    r.DelayFiring,
			DelayResolving: r.DelayResolving,
		},
	})

	r.DelayFiring = delayValues[0].DelayFiring
	r.DelayResolving = delayValues[0].DelayResolving

	err := svc.IAlertsService.ChangeAlert(ctx, r)
	if err != nil {
		return nil, shared.ConvertServiceError(err, shared.EntityAlerts)
	}

	return nil, nil
}
