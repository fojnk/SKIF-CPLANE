import { useTheme } from '@gravity-ui/uikit';
import {
  ReactFlow,
  Controls,
  Background,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import { useUnit } from 'effector-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import '@xyflow/react/dist/style.css';

import type {
  ExperimentNodeData,
  DatasetNodeData,
  ProjectNode,
  ProjectEdge,
} from '@/modules/control-plane/entities/projects/graph';
import { reactFlowSettingsModel } from '@/modules/control-plane/entities/settings/react-flow';

import { SettingsButton } from '../experiment/ui';

import { DatasetNode } from './dataset-node';
import { ExperimentNode } from './experiment-node';
// Импортируем стили для применения глобальных стилей handles
import './graph.module.scss';

interface ProjectGraphProps {
  nodes?: ProjectNode[];
  edges?: ProjectEdge[];
  selectedNodeId?: string | null;
  onNodeClick?: (
    nodeId: string | null,
    nodeType: 'experiment' | 'dataset',
    nodeData: ExperimentNodeData | DatasetNodeData,
  ) => void;
  onPaneClick?: () => void;
}

// Регистрируем кастомные типы нод
const nodeTypes = {
  experiment: ExperimentNode,
  dataset: DatasetNode,
};

// Константы для fitView
const fitViewOptions = {
  padding: 0.2,
  minZoom: 0.5,
  maxZoom: 1.5,
};

const ProjectGraphContent = ({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  selectedNodeId: externalSelectedNodeId,
  onNodeClick,
  onPaneClick,
}: ProjectGraphProps) => {
  const isDarkTheme = useTheme() === 'dark';
  const { fitView } = useReactFlow();
  const settings = useUnit(reactFlowSettingsModel.$settings);

  // Используем useNodesState и useEdgesState для управления состоянием
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // Синхронизируем с входящими props
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Принудительно вызываем fitView при изменении нод
  useEffect(() => {
    if (initialNodes.length > 0) {
      // Небольшая задержка для корректной отрисовки
      setTimeout(() => {
        fitView({
          padding: 0.2,
          duration: 200,
          minZoom: 0.5,
          maxZoom: 1.5,
        });
      }, 100);
    }
  }, [initialNodes, fitView]);

  // Настройки по умолчанию для edges (включая стрелки)
  const defaultEdgeOptions = useMemo(
    () => ({
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: isDarkTheme
          ? 'rgba(255, 255, 255, 0.5)'
          : 'rgba(90, 90, 90, 0.8)',
      },
    }),
    [isDarkTheme],
  );

  // Состояние для выделенной ноды
  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState<
    string | null
  >(null);

  // Синхронизируем внутреннее состояние с внешним
  useEffect(() => {
    if (externalSelectedNodeId !== undefined) {
      setInternalSelectedNodeId(externalSelectedNodeId);
    }
  }, [externalSelectedNodeId]);

  // Используем внешнее состояние если оно передано, иначе внутреннее
  const selectedNodeId =
    externalSelectedNodeId !== undefined
      ? externalSelectedNodeId
      : internalSelectedNodeId;

  // Обработчик клика по ноде
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: ProjectNode) => {
      const nodeType = node.type as 'experiment' | 'dataset';
      const nodeData = node.data as ExperimentNodeData | DatasetNodeData;

      // Toggle selection: если уже выбран — снимаем выделение
      const newSelectedNodeId = selectedNodeId === node.id ? null : node.id;
      setInternalSelectedNodeId(newSelectedNodeId);

      if (onNodeClick) {
        onNodeClick(newSelectedNodeId, nodeType, nodeData);
      }
    },
    [onNodeClick, selectedNodeId],
  );

  // Сбрасываем выделение при клике на пустое место
  const handlePaneClick = useCallback(() => {
    setInternalSelectedNodeId(null);
    if (onPaneClick) {
      onPaneClick();
    }
  }, [onPaneClick]);

  // Добавляем информацию о выделении в data нод
  const nodesWithSelection = useMemo(
    () =>
      nodes.map((node) => {
        const isSelected = node.id === selectedNodeId;
        return {
          ...node,
          data: {
            ...node.data,
            selected: isSelected,
          },
        };
      }),
    [nodes, selectedNodeId],
  );

  // Стили для edges с цветами маркеров
  const edgesWithStyles = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        style: {
          stroke: isDarkTheme
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(120, 120, 120, 0.6)',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: isDarkTheme
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(90, 90, 90, 0.8)',
        },
      })),
    [edges, isDarkTheme],
  );

  return (
    <>
      <ReactFlow
        className="project-graph"
        fitView
        colorMode={isDarkTheme ? 'dark' : 'light'}
        minZoom={0.1}
        maxZoom={2}
        nodes={nodesWithSelection}
        edges={edgesWithStyles}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        selectNodesOnDrag={false}
        deleteKeyCode={null}
        multiSelectionKeyCode={null}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitViewOptions={fitViewOptions}
      >
        {settings.showDotsBackground && <Background />}
        <Controls showInteractive={false} showFitView showZoom />
      </ReactFlow>
      <SettingsButton />
    </>
  );
};

export const ProjectGraph = (props: ProjectGraphProps) => {
  return (
    <ReactFlowProvider>
      <ProjectGraphContent {...props} />
    </ReactFlowProvider>
  );
};
