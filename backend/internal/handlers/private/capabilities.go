package private

import (
	"context"
	"net/http"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

func hasCapabilityPermission(
	ctx context.Context,
	svc *service.Service,
	l *logger.Logger,
	u *user.UserInfo,
	objectType service.ACLObjectType,
	objectAttribute service.ACLObjectAttribute,
	action service.ACLAction,
	objectID int32,
) (bool, *responses.ErrorResponse) {
	err := shared.CheckPermission(ctx, l, svc, objectType, objectAttribute, action, objectID, u)
	if err == nil {
		return true, nil
	}

	if err.HTTPStatusCode == http.StatusForbidden {
		return false, nil
	}

	return false, err
}

// GetMyCapabilitiesHandler godoc
//
//	@Summary	get current user capabilities
//	@Tags		acl
//	@Produce	json
//	@Success	200	{object}	responses.UserCapabilitiesResponse
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v2/me/capabilities [get]
func GetMyCapabilitiesHandler(ctx context.Context, svc *service.Service, l *logger.Logger, _ *struct{}, u *user.UserInfo) (any, *responses.ErrorResponse) {
	canCreateNamespace, err := hasCapabilityPermission(ctx, svc, l, u, acl.Root, acl.NamespaceAttribute, acl.Create, 0)
	if err != nil {
		return nil, err
	}

	canDeleteNamespace, err := hasCapabilityPermission(ctx, svc, l, u, acl.Root, acl.NamespaceAttribute, acl.Delete, 0)
	if err != nil {
		return nil, err
	}

	canReadRootNamespace, err := hasCapabilityPermission(ctx, svc, l, u, acl.Root, acl.NamespaceAttribute, acl.Read, 0)
	if err != nil {
		return nil, err
	}

	return &responses.UserCapabilitiesResponse{
		Capabilities: responses.UserCapabilities{
			CanCreateNamespace: canCreateNamespace,
			CanManageACL:       canReadRootNamespace,
			IsRoot:             canCreateNamespace && canDeleteNamespace,
		},
	}, nil
}
