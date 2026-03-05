package public

import (
	"context"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	models "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/orch"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

// updateExperimentVariableHandler godoc
//
//	@Summary	update experiment variable
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.UpdateExperimentVariableRequest	true	"request body"
//	@Success	200		{object}	responses.UpdateExperimentVariableResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/variable [put]
func updateExperimentVariableHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateExperimentVariableRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	variable, err := svc.GetExperimentVariable(ctx, r.Variable.ID)
	if err != nil {
		l.Error("failed to get experiment variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Edit, variable.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on update experiment variables")
	}

	oldVariable, newVariable, projectID, err := svc.UpdateExperimentVariable(ctx, r.Variable.ID, r.Variable.Name, r.Variable.Value, r.Variable.Type, r.Comment, u.Username)
	if err != nil {
		l.Error("failed to update experiment variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	svc.LogExperimentChange(ctx, projectID, variable.ExperimentID, u.Username, r.Comment, update_log.ActionUpdateVariable, update_log.ExperimentUpdateLog{
		Old: update_log.Experiment{
			VariableName:  oldVariable.Name,
			VariableValue: oldVariable.Value,
			VariableType:  oldVariable.Type,
		},
		New: update_log.Experiment{
			VariableName:  newVariable.Name,
			VariableValue: newVariable.Value,
			VariableType:  newVariable.Type,
		},
	})

	return responses.UpdateExperimentVariableResponse{
		Variable: *newVariable,
	}, nil
}

// getExperimentVariablesHandler godoc
//
//	@Summary	get experiment variables
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int	true	"experiment id"
//	@Success	200			{object}	responses.GetExperimentVariablesResponse
//	@Failure	403			{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500			{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/variables [get]
func getExperimentVariablesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentVariablesRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, r.ExperimentID, u); err != nil {
		return nil, err
	}

	variables, err := svc.GetExperimentVariables(ctx, r.ExperimentID)
	if err != nil {
		l.Error("failed to get experiment variables", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	return responses.GetExperimentVariablesResponse{
		Variables: variables,
	}, nil
}

// getAvailableExperimentVariableTypesHandler godoc
//
//	@Summary	get available experiment variable types
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Success	200	{object}	responses.GetAvailableExperimentVariableTypesResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/variables/types [get]
func getAvailableExperimentVariableTypesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetAvailableExperimentVariableTypesRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	return responses.GetAvailableExperimentVariableTypesResponse{
		Types: []orch.ExperimentVariableType{
			orch.ExperimentVariableTypeString,
			orch.ExperimentVariableTypeInt,
			orch.ExperimentVariableTypeJSON,
			orch.ExperimentVariableTypeYQL,
			orch.ExperimentVariableTypePython,
		},
	}, nil
}

// getExperimentVariableHandler godoc
//
//	@Summary	get experiment variable
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		variable_id	query		int	true	"variable id"
//	@Success	200			{object}	responses.GetExperimentVariableResponse
//	@Failure	403			{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500			{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/variable [get]
func getExperimentVariableHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentVariableRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	variable, err := svc.GetExperimentVariable(ctx, r.VariableID)
	if err != nil {
		l.Error("failed to get experiment variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, variable.ExperimentID, u); err != nil {
		return nil, err
	}

	return responses.GetExperimentVariableResponse{
		Variable: dto.ExperimentVariable{
			ID:    variable.ID,
			Name:  variable.Name,
			Value: variable.Value,
			Type:  variable.Type,
		},
	}, nil
}

// createExperimentVariableHandler godoc
//
//	@Summary	create experiment variable
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CreateExperimentVariableRequest	true	"request body"
//	@Success	200		{object}	responses.CreateExperimentVariableResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/variable [post]
func createExperimentVariableHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateExperimentVariableRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Edit, r.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on update experiment variables")
	}

	variable, projectID, err := svc.CreateExperimentVariable(ctx, r.ExperimentID, r.Variable.Name, r.Variable.Value, r.Variable.Type, r.Comment, u.Username)
	if err != nil {
		l.Error("failed to create experiment variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	svc.LogExperimentChange(ctx, projectID, r.ExperimentID, u.Username, r.Comment, update_log.ActionNewVariable, update_log.ExperimentUpdateLog{
		New: update_log.Experiment{
			VariableName:  r.Variable.Name,
			VariableValue: r.Variable.Value,
			VariableType:  r.Variable.Type,
		},
	})

	return responses.CreateExperimentVariableResponse{
		Variable: *variable,
	}, nil
}

// deleteExperimentVariableHandler godoc
//
//	@Summary	delete experiment variable
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.DeleteExperimentVariableRequest	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/experiment/variable [delete]
func deleteExperimentVariableHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteExperimentVariableRequest, u *models.UserInfo) (any, *responses.ErrorResponse) {
	variable, err := svc.GetExperimentVariable(ctx, r.VariableID)
	if err != nil {
		l.Error("failed to get experiment variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Edit, variable.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on update experiment variables")
	}

	deletedVariable, projectID, err := svc.DeleteExperimentVariable(ctx, r.VariableID)
	if err != nil {
		l.Error("failed to delete experiment variable", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	svc.LogExperimentChange(ctx, projectID, variable.ExperimentID, u.Username, "", update_log.ActionDeleteVariable, update_log.ExperimentUpdateLog{
		Old: update_log.Experiment{
			VariableName:  deletedVariable.Name,
			VariableValue: variable.Value,
			VariableType:  variable.Type,
		},
	})

	return responses.EmptyResponse{}, nil
}

// updateExperimentVariableV2Handler godoc
//
//	@Summary	update experiment variable by name v2
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.UpdateExperimentVariableV2Request	true	"request body"
//	@Success	200		{object}	responses.UpdateExperimentVariableV2Response
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/variable [put]
func updateExperimentVariableV2Handler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateExperimentVariableV2Request, u *models.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Edit, r.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on update experiment variables")
	}

	oldVariable, newVariable, projectID, isNew, err := svc.UpdateExperimentVariableByName(ctx, r.ExperimentID, r.Name, r.Value, r.Type, r.Comment, u.Username)
	if err != nil {
		l.Error("failed to update experiment variable by name", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	action := update_log.ActionUpdateVariable
	if isNew {
		action = update_log.ActionNewVariable
	}

	updateLogData := update_log.ExperimentUpdateLog{
		New: update_log.Experiment{
			VariableName:  newVariable.Name,
			VariableValue: newVariable.Value,
			VariableType:  newVariable.Type,
		},
	}

	if !isNew && oldVariable != nil {
		updateLogData.Old = update_log.Experiment{
			VariableName:  oldVariable.Name,
			VariableValue: oldVariable.Value,
			VariableType:  oldVariable.Type,
		}
	}

	svc.LogExperimentChange(ctx, projectID, r.ExperimentID, u.Username, r.Comment, action, updateLogData)

	return responses.UpdateExperimentVariableV2Response{
		Name:  newVariable.Name,
		Value: newVariable.Value,
		Type:  newVariable.Type,
	}, nil
}

// getExperimentVariableV2Handler godoc
//
//	@Summary	get experiment variable v2
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		experiment_id	query		int		true	"experiment id"
//	@Param		name		query		string	true	"name"
//	@Success	200			{object}	responses.GetExperimentVariableV2Response
//	@Failure	403			{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	500			{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/variable [get]
func getExperimentVariableV2Handler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetExperimentVariableV2Request, u *models.UserInfo) (any, *responses.ErrorResponse) {
	variable, err := svc.GetExperimentVariableByName(ctx, r.ExperimentID, r.Name)
	if err != nil {
		l.Error("failed to get experiment variable by name", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.NoAttribute, acl.Read, variable.ExperimentID, u); err != nil {
		return nil, err
	}

	return responses.GetExperimentVariableV2Response{
		Name:  variable.Name,
		Value: variable.Value,
		Type:  variable.Type,
	}, nil
}

// deleteExperimentVariableV2Handler godoc
//
//	@Summary	delete experiment variable v2
//	@Security	BearerAuth
//	@Tags		experiment
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.DeleteExperimentVariableV2Request	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/experiment/variable [delete]
func deleteExperimentVariableV2Handler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteExperimentVariableV2Request, u *models.UserInfo) (any, *responses.ErrorResponse) {
	variable, err := svc.GetExperimentVariableByName(ctx, r.ExperimentID, r.Name)
	if err != nil {
		l.Error("failed to get experiment variable by name", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	if err := shared.CheckPermission(ctx, l, svc, acl.Experiment, acl.MetaAttribute, acl.Edit, variable.ExperimentID, u); err != nil {
		return nil, err.Context("permission check failed on update experiment variables")
	}

	deletedVariable, projectID, err := svc.DeleteExperimentVariableByName(ctx, r.ExperimentID, r.Name)
	if err != nil {
		l.Error("failed to delete experiment variable by name", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperimentVariables)
	}

	svc.LogExperimentChange(ctx, projectID, variable.ExperimentID, u.Username, "", update_log.ActionDeleteVariable, update_log.ExperimentUpdateLog{
		Old: update_log.Experiment{
			VariableName:  deletedVariable.Name,
			VariableValue: deletedVariable.Value,
			VariableType:  deletedVariable.Type,
		},
	})

	return responses.EmptyResponse{}, nil
}
