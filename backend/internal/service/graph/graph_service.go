package service

import (
	"context"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	serviceerrors "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/errors"
)

type experimentStatusGetter interface {
	GetExperimentStatus(ctx context.Context, orchID string) responses.ExperimentStatusResponse
}

type GraphService struct {
	repo            *repository.Repository
	experimentService experimentStatusGetter
}

func NewGraphService(repo *repository.Repository, pipeS experimentStatusGetter) *GraphService {
	return &GraphService{repo: repo, experimentService: pipeS}
}

type NodeType string

const (
	NodeTypeDataset NodeType = "ds"
	NodeTypeExperiment   NodeType = "experiment"
)

type GraphNode struct {
	ID     int32              `json:"id"`
	Type   NodeType           `json:"type"`
	Name   string             `json:"name"`
	Next   []*GraphNode       `json:"next,omitempty"`
	Status dto.ExperimentStatus `json:"status,omitempty"`
}

type Graph struct {
	Nodes []GraphNode `json:"nodes"`
}

// GetProjectGraph строит граф зависимостей проекта
func (s *GraphService) GetProjectGraph(ctx context.Context, projectID int32) (*Graph, error) {
	completeExperiments, err := s.repo.DB.SelectCompleteExperimentsInProject(ctx, projectID)
	if err != nil {
		s.repo.Logger.Error("failed to select complete experiments in project", err)
		return nil, serviceerrors.NewInternalError("Не удалось получить пайплайны проекта", err)
	}

	var graph Graph
	for _, experiment := range completeExperiments {
		status := dto.ExperimentStatus("UNKNOWN")
		if experiment.OrchID.Valid && experiment.OrchID.String != "" && s.experimentService != nil {
			statusResp := s.experimentService.GetExperimentStatus(ctx, experiment.OrchID.String)
			status = statusResp.Status
		}

		graph.Nodes = append(graph.Nodes, GraphNode{
			ID:     experiment.ID,
			Name:   experiment.Name,
			Type:   NodeTypeExperiment,
			Status: status,
		})
	}

	return &graph, nil
}
