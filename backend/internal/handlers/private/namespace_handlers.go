package private

import (
	"context"
	"errors"
	"net/http"
	"regexp"
	"slices"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/update_log"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

var namespaceRegExp = regexp.MustCompile(`^[a-z0-9\-]{1,10}$`)

func checkNamespaceName(name string) string {
	if !namespaceRegExp.MatchString(name) {
		return "invalid namespace name"
	}

	return ""
}

// createNamespaceHandler godoc
//
//	@Summary	create namespace
//	@Tags		namespace
//	@Accept		json
//	@Produce	json
//	@Param		request	body		requests.CreateNamespaceRequest	true	"request body"
//	@Success	200		{object}	responses.CreateNamespaceResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	409		{object}	responses.ErrorResponse	"Conflict - resource already exists"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/namespace [post]
func createNamespaceHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.CreateNamespaceRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Root, acl.NamespaceAttribute, acl.Create, 0, u); err != nil {
		return nil, err
	}

	if errMsg := checkNamespaceName(r.Name); errMsg != "" {
		l.Error("bad namespace name", errors.New(errMsg))
		return nil, &responses.ErrorResponse{
			InternalError:   errors.New(errMsg),
			ExternalMessage: errMsg,
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}

	id, err := svc.CreateNamespace(ctx, r.Name)
	if err != nil {
		l.Error("failed to create namespace", err)
		return nil, shared.ConvertServiceError(err, shared.EntityNamespace)
	}

	// Update log for namespace creation
	svc.LogNamespaceChange(ctx, id, u.Username, r.Comment, update_log.ActionNew, update_log.NamespaceUpdateLog{
		New: update_log.Namespace{
			Name:   r.Name,
			Config: `{}`,
		},
	})

	// Infrastructure operations - ACL/IDM integration remains in controller
	err = svc.IIDMService.CreateNamespaceOwnerRole(ctx, id, u)
	if err != nil {
		return nil, &responses.ErrorResponse{
			ExternalMessage: "failed to create namespace owner role",
			InternalError:   err,
			HTTPStatusCode:  http.StatusInternalServerError,
		}
	}

	return &responses.CreateNamespaceResponse{ID: id}, nil
}

// listNamespacesHandler godoc
//
//	@Summary	list namespaces
//	@Tags		namespace
//	@Produce	json
//	@Success	200	{object}	responses.ListNamespacesResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/namespaces [get]
func listNamespacesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, _ *struct{}, u *user.UserInfo) (any, *responses.ErrorResponse) {
	namespaces, err := svc.ListNamespacesWithRights(ctx, u.Username)
	if err != nil {
		l.Error("failed to list namespaces", err)
		return nil, shared.ConvertServiceError(err, shared.EntityNamespace)
	}
	var res responses.ListNamespacesResponse
	if namespaces != nil {
		res.Namespaces = *namespaces
	}

	// no token because it only matters in frontend where token is not applicable
	rights, err := acl.GetGlobalRights(ctx, &svc.Repo.Config.ACL, l, svc.Repo.DB, "", u)
	if err != nil {
		l.Error("failed to get rights of the global", err)
		return nil, shared.ConvertServiceError(err, shared.EntityRule)
	}

	res.CanCreate = slices.Contains(rights, acl.RightCreateNamespace)

	return &res, nil
}

// listNamespacesV2Handler godoc
//
//	@Summary	list namespaces v2
//	@Tags		namespace
//	@Produce	json
//	@Success	200	{object}	responses.ListNamespacesV2Response
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/namespaces [get]
func listNamespacesV2Handler(ctx context.Context, svc *service.Service, l *logger.Logger, _ *struct{}, u *user.UserInfo) (any, *responses.ErrorResponse) {
	namespaces, err := svc.ListNamespacesV2(ctx)
	if err != nil {
		l.Error("failed to list namespaces", err)
		return nil, shared.ConvertServiceError(err, shared.EntityNamespace)
	}
	var res responses.ListNamespacesV2Response
	if namespaces != nil {
		res.Namespaces = *namespaces
	}

	return &res, nil
}

// deleteNamespaceHandler godoc
//
//	@Summary	delete namespace
//	@Tags		namespace
//	@Accept		json
//	@Param		request	body		requests.DeleteNamespaceRequest	true	"request body"
//	@Success	200		{object}	responses.EmptyResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/namespace [delete]
func deleteNamespaceHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.DeleteNamespaceRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.NoAttribute, acl.Delete, r.ID, u); err != nil {
		return nil, err
	}

	// Fetch namespace info before deletion for logging
	oldNamespace, err := svc.GetNamespace(ctx, r.ID, u.Username)
	if err != nil {
		l.Error("failed to get namespace before deletion", err)
		return nil, shared.ConvertServiceError(err, shared.EntityNamespace)
	}

	// Service handles all business logic including validation
	err = svc.DeleteNamespace(ctx, r.ID)
	if err != nil {
		l.Error("failed to delete namespace", err)
		return nil, shared.ConvertServiceError(err, shared.EntityNamespace)
	}

	// Update log for namespace deletion
	svc.LogNamespaceChange(ctx, oldNamespace.ID, u.Username, "", update_log.ActionDelete, update_log.NamespaceUpdateLog{
		Old: update_log.Namespace{
			Name:   oldNamespace.Name,
			Config: oldNamespace.Config,
		},
	})

	return &responses.EmptyResponse{}, nil
}

// updateNamespaceHandler godoc
//
//	@Summary	update namespace
//	@Tags		namespace
//	@Accept		json
//	@Param		request	body		requests.UpdateNamespaceRequest	true	"request body"
//	@Success	200		{object}	responses.UpdateNamespaceResponse
//	@Failure	400		{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401		{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403		{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404		{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500		{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/namespace [put]
func updateNamespaceHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.UpdateNamespaceRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.MetaAttribute, acl.Edit, r.ID, u); err != nil {
		return nil, err
	}

	if errMsg := checkNamespaceName(r.Name); r.Name != "" && errMsg != "" {
		return nil, &responses.ErrorResponse{
			InternalError:   errors.New(errMsg),
			ExternalMessage: errMsg,
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}

	// Get old name for IDM sync check
	oldNamespace, err := svc.GetNamespace(ctx, r.ID, u.Username)
	if err != nil {
		l.Error("failed to get namespace", err)
		return nil, shared.ConvertServiceError(err, shared.EntityNamespace)
	}

	namespaceInfo, err := svc.UpdateNamespace(ctx, r.ID, r.Name, r.Config)
	if err != nil {
		l.Error("failed to update namespace", err)
		return nil, shared.ConvertServiceError(err, shared.EntityNamespace)
	}

	// Update log for namespace update
	svc.LogNamespaceChange(ctx, r.ID, u.Username, r.Comment, update_log.ActionUpdate, update_log.NamespaceUpdateLog{
		New: update_log.Namespace{
			Name:   namespaceInfo.Name,
			Config: namespaceInfo.Config,
		},
		Old: update_log.Namespace{
			Name:   oldNamespace.Name,
			Config: oldNamespace.Config,
		},
	})

	return &responses.UpdateNamespaceResponse{
		ID:     namespaceInfo.ID,
		Name:   namespaceInfo.Name,
		Config: namespaceInfo.Config,
	}, nil
}

// listNamespaceConfigsHandler godoc
//
//	@Summary	list namespace configs
//	@Tags		namespace
//	@Param		namespace_id	query	int	true	"namespace id"
//	@Produce	json
//	@Success	200	{object}	responses.ListNamespaceConfigsResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/namespace/configs [get]
func listNamespaceConfigsHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.ListNamespaceConfigsRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Namespace, acl.ConfigAttribute, acl.Read, r.NamespaceID, u); err != nil {
		return nil, err
	}

	configs, err := svc.ListNamespaceConfigs(ctx, r.NamespaceID)
	if err != nil {
		l.Error("failed to list namespace configs", err)
		return nil, shared.ConvertServiceError(err, shared.EntityNamespace)
	}

	var res responses.ListNamespaceConfigsResponse
	if configs != nil {
		res.Configs = *configs
	}

	return &res, nil
}

// getNamespaceConfigHandler godoc
//
//	@Summary	get namespace config by id
//	@Tags		namespace
//	@Param		config_id	query	int	true	"config id"
//	@Produce	json
//	@Success	200	{object}	responses.GetNamespaceConfigResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/namespace/config [get]
func getNamespaceConfigHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetNamespaceConfigRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	config, err := svc.GetNamespaceConfig(ctx, r.ConfigID)
	if err != nil {
		l.Error("failed to get namespace config", err)
		return nil, shared.ConvertServiceError(err, shared.EntityNamespace)
	}

	var res responses.GetNamespaceConfigResponse
	res.Config = *config

	return &res, nil
}

// getNamespaceHandler godoc
//
//	@Summary	get namespace
//	@Tags		namespace
//	@Param		namespace_id	query	int	true	"namespace id"
//	@Produce	json
//	@Success	200	{object}	responses.GetNamespaceResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/namespace [get]
func getNamespaceHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *requests.GetNamespaceRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	namespaceInfo, err := svc.GetNamespace(ctx, r.NamespaceID, u.Username)
	if err != nil {
		l.Error("failed to get namespace", err)
		return nil, shared.ConvertServiceError(err, shared.EntityNamespace)
	}

	var res responses.GetNamespaceResponse
	res.ID = namespaceInfo.ID
	res.Name = namespaceInfo.Name
	res.Config = namespaceInfo.Config
	res.Rights = namespaceInfo.Rights

	return &res, nil
}
