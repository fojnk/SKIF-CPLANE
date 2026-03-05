package private

import (
	"context"
	"net/http"
	"strconv"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/models/user"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/handlers/shared"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/pkg/acl"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service"
)

type NodeType string

const (
	NodeTypeDataset NodeType = "ds"
	NodeTypeExperiment   NodeType = "experiment"
)

type graphNode struct {
	ID   int32        `json:"id"`
	Type NodeType     `json:"type"`
	Name string       `json:"name"`
	Next []*graphNode `json:"next,omitempty"`

	Status dto.ExperimentStatus `json:"status,omitempty"`
}

type graph struct {
	Nodes []graphNode `json:"nodes"`
}

type getProjectGraphRequest struct {
	ProjectID int32 `validate:"required"`
}

func setGetProjectGraphRequestParams(r *getProjectGraphRequest, _, value string) *responses.ErrorResponse {
	id, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return &responses.ErrorResponse{
			InternalError:   err,
			ExternalMessage: "failed to parse project_id",
			HTTPStatusCode:  http.StatusBadRequest,
		}
	}
	r.ProjectID = int32(id)
	return nil
}

// reload
type getProjectGraphResponse struct {
	Graph graph `json:"graph"`
}

// getProjectGraphHandler godoc
//
//	@Summary	get project graph
//	@Tags		experiment
//	@Param		project_id	query	int	true	"project id"
//	@Produce	json
//	@Success	200	{object}	getProjectGraphResponse
//	@Failure	400	{object}	responses.ErrorResponse	"Bad Request"
//	@Failure	401	{object}	responses.ErrorResponse	"Unauthorized"
//	@Failure	403	{object}	responses.ErrorResponse	"Forbidden"
//	@Failure	404	{object}	responses.ErrorResponse	"Not Found"
//	@Failure	500	{object}	responses.ErrorResponse	"Internal server error"
//	@Router		/api/v1/graph [get]
func getProjectGraphHandler(ctx context.Context, svc *service.Service, l *logger.Logger, r *getProjectGraphRequest, u *user.UserInfo) (any, *responses.ErrorResponse) {
	if err := shared.CheckPermission(ctx, l, svc, acl.Project, acl.NoAttribute, acl.Read, r.ProjectID, u); err != nil {
		return nil, err
	}

	graph, err := svc.GetProjectGraph(ctx, r.ProjectID)
	if err != nil {
		l.Error("failed to get project graph", err)
		return nil, shared.ConvertServiceError(err, shared.EntityExperiment)
	}

	var res getProjectGraphResponse
	for _, node := range graph.Nodes {
		res.Graph.Nodes = append(res.Graph.Nodes, graphNode{
			ID:     node.ID,
			Name:   node.Name,
			Type:   NodeType(node.Type),
			Status: node.Status,
		})
	}

	return &res, nil
}
