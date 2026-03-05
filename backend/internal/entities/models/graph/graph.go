package graph

import "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/dto"

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

