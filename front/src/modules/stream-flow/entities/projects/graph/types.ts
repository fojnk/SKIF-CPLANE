import type { Node, Edge } from '@xyflow/react';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

// Типы статусов experiment
export type ExperimentStatus =
  | 'UNKNOWN'
  | 'OK'
  | 'WARNING'
  | 'ERROR'
  | 'PENDING';

// Данные для experiment ноды
export type ExperimentNodeData = {
  id: number;
  label: string;
  status?: ExperimentStatus;
  selected?: boolean;
  [key: string]: unknown;
};

// Данные для dataset ноды
export type DatasetNodeData = {
  id: number;
  label: string;
  selected?: boolean;
  [key: string]: unknown;
};

// Тип ноды из API
export type GraphNodeDC = streamFlowApi.dc.PrivateGraphNodeDC;
export type NodeTypeDC = streamFlowApi.dc.PrivateNodeTypeDC;

// Типы для ReactFlow
export type ProjectNode = Node<ExperimentNodeData | DatasetNodeData>;
export type ProjectEdge = Edge;

// Интерфейс для данных графа проекта
export interface ProjectGraphData {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
}

// Позиция ноды
export interface NodePosition {
  x: number;
  y: number;
}

// Карта позиций нод
export type PositionsMap = Record<string, NodePosition>;
