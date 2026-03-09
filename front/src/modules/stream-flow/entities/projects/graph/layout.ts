import { Position } from '@xyflow/react';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

import type {
  GraphNodeDC,
  ProjectNode,
  ProjectEdge,
  ProjectGraphData,
  ExperimentNodeData,
  DatasetNodeData,
  ExperimentStatus,
  PositionsMap,
} from './types';

// Константы для layout
const HORIZONTAL_SPACING = 250;
const VERTICAL_SPACING = 80;

/**
 * Создает уникальный ID ноды
 */
function createNodeId(type: string, id: number): string {
  return `${type}-${id}`;
}

/**
 * Создает ID для edge
 */
function createEdgeId(sourceId: string, targetId: string): string {
  return `edge-${sourceId}-${targetId}`;
}

/**
 * Рассчитывает позиции нод используя топологическую сортировку
 * Ноды размещаются слева направо по уровням
 */
function calculateLayout(nodes: GraphNodeDC[]): PositionsMap {
  const positions: PositionsMap = {};
  const nodeMap = new Map<string, GraphNodeDC>();
  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();

  // Инициализация
  nodes.forEach((node) => {
    const nodeId = createNodeId(node.type || 'unknown', node.id!);
    nodeMap.set(nodeId, node);
    inDegree.set(nodeId, 0);
    adjacencyList.set(nodeId, []);
  });

  // Построение графа зависимостей (next -> текущий узел указывает на следующие)
  nodes.forEach((node) => {
    const sourceId = createNodeId(node.type || 'unknown', node.id!);
    if (node.next && node.next.length > 0) {
      node.next.forEach((nextNode) => {
        const targetId = createNodeId(nextNode.type || 'unknown', nextNode.id!);
        const edges = adjacencyList.get(sourceId) || [];
        edges.push(targetId);
        adjacencyList.set(sourceId, edges);
        inDegree.set(targetId, (inDegree.get(targetId) || 0) + 1);
      });
    }
  });

  // Топологическая сортировка по уровням (BFS)
  const levels: string[][] = [];
  let queue: string[] = [];

  // Находим все ноды без входящих ребер (корневые ноды)
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  while (queue.length > 0) {
    levels.push([...queue]);
    const nextQueue: string[] = [];

    queue.forEach((nodeId) => {
      const neighbors = adjacencyList.get(nodeId) || [];
      neighbors.forEach((neighborId) => {
        const newDegree = (inDegree.get(neighborId) || 0) - 1;
        inDegree.set(neighborId, newDegree);
        if (newDegree === 0) {
          nextQueue.push(neighborId);
        }
      });
    });

    queue = nextQueue;
  }

  // Размещаем ноды по уровням
  levels.forEach((level, levelIndex) => {
    const levelHeight = level.length * VERTICAL_SPACING;
    const startY = -levelHeight / 2 + VERTICAL_SPACING / 2;

    level.forEach((nodeId, nodeIndex) => {
      positions[nodeId] = {
        x: levelIndex * HORIZONTAL_SPACING,
        y: startY + nodeIndex * VERTICAL_SPACING,
      };
    });
  });

  return positions;
}

/**
 * Преобразует данные API в формат ReactFlow
 */
export function buildProjectGraph(
  apiNodes: GraphNodeDC[],
  customPositions?: PositionsMap,
): ProjectGraphData {
  const positions = customPositions || calculateLayout(apiNodes);
  const nodes: ProjectNode[] = [];
  const edges: ProjectEdge[] = [];
  const processedEdges = new Set<string>();

  apiNodes.forEach((apiNode) => {
    const nodeId = createNodeId(apiNode.type || 'unknown', apiNode.id!);
    const nodeType =
      apiNode.type === streamFlowApi.dc.PrivateNodeTypeDC.NodeTypeExperiment
        ? 'experiment'
        : 'dataset';

    // Создаем ноду
    if (nodeType === 'experiment') {
      const nodeData: ExperimentNodeData = {
        id: apiNode.id!,
        label: apiNode.name || `Experiment ${apiNode.id}`,
        status: (apiNode.status as ExperimentStatus) || 'UNKNOWN',
      };

      nodes.push({
        id: nodeId,
        type: 'experiment',
        data: nodeData,
        position: positions[nodeId] || { x: 0, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    } else {
      const nodeData: DatasetNodeData = {
        id: apiNode.id!,
        label: apiNode.name || `Dataset ${apiNode.id}`,
      };

      nodes.push({
        id: nodeId,
        type: 'dataset',
        data: nodeData,
        position: positions[nodeId] || { x: 0, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    }

    // Создаем edges (соединения)
    if (apiNode.next && apiNode.next.length > 0) {
      apiNode.next.forEach((nextNode) => {
        const targetId = createNodeId(nextNode.type || 'unknown', nextNode.id!);
        const edgeId = createEdgeId(nodeId, targetId);

        // Избегаем дублирования edges
        if (!processedEdges.has(edgeId)) {
          processedEdges.add(edgeId);
          edges.push({
            id: edgeId,
            source: nodeId,
            target: targetId,
            sourceHandle: 'source',
            targetHandle: 'target',
          });
        }
      });
    }
  });

  return { nodes, edges };
}

/**
 * Извлекает ID experiment из ID ноды
 */
export function extractExperimentIdFromNodeId(nodeId: string): number | null {
  const match = nodeId.match(/^experiment-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Извлекает ID dataset из ID ноды
 */
export function extractDatasetIdFromNodeId(nodeId: string): number | null {
  const match = nodeId.match(/^ds-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Определяет тип ноды по ID
 */
export function getNodeTypeFromId(
  nodeId: string,
): 'experiment' | 'dataset' | null {
  if (nodeId.startsWith('experiment-')) return 'experiment';
  if (nodeId.startsWith('ds-')) return 'dataset';
  return null;
}
