import { useTheme } from '@gravity-ui/uikit';
import { SmartStepEdge } from '@tisoap/react-flow-smart-edge';
import {
  ReactFlow,
  Controls,
  Background,
  ReactFlowProvider,
  Node,
  Edge,
  useReactFlow,
  MarkerType,
  Connection,
  ConnectionLineType,
  OnConnect,
  OnEdgesDelete,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import { useUnit } from 'effector-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '@xyflow/react/dist/style.css';

import { reactFlowSettingsModel } from '@/modules/control-plane/entities/settings/react-flow';
import { ExperimentVariableItem } from '@/modules/control-plane/shared/types';

import { CubeGroupNode } from './cube-group-node';
import { PortNode } from './port-node';
import { ResharderNode } from './resharder-node';
import { RetrierNode } from './retrier-node';
import { RetryNode } from './retry-node';
import { MarketButton, SettingsButton, VariablesButton } from './ui';
// Импортируем стили для применения глобальных стилей handles
import './graph.module.scss';

// Тип для данных о созданном соединении
export interface ConnectionData {
  sourceNodeId: string;
  sourcePortHash: string;
  targetNodeId: string;
  targetPortHash: string;
}

interface GraphProps {
  nodes?: Node[];
  edges?: Edge[];
  selectedCubeHash?: string | null;
  centerOnCubeHash?: string | null; // Явный запрос на центрирование
  // Счётчик для явного вызова fitView (при добавлении/удалении кубов/связей)
  fitViewTrigger?: number;
  onCubeClick?: (cubeHash: string | null) => void;
  // Удаление куба по горячей клавише (cubeHash, cubeName)
  onCubeDelete?: (cubeHash: string, cubeName: string) => void;
  onResharderClick?: () => void;
  onConnectionCreate?: (connection: ConnectionData) => void;
  onConnectionDelete?: (connection: ConnectionData) => void;
  isEditable?: boolean;
  /**
   * Удаление выбранной ноды по Delete/Backspace, когда граф не в режиме редактирования связей
   * (например супервизор: models[]).
   */
  allowKeyboardCubeDelete?: boolean;
  experiment_id?: number;
  experiment_name?: string;
  variables?: ExperimentVariableItem[] | null;
}

// Регистрируем кастомные типы нод вне компонента для стабильности
const nodeTypes = {
  cubeGroup: CubeGroupNode,
  datasetGroup: CubeGroupNode,
  resharder: ResharderNode,
  retrier: RetrierNode,
  retry: RetryNode,
  port: PortNode,
};

// Регистрируем SmartStepEdge для умной маршрутизации линий вокруг нод (ортогональные линии)
const edgeTypes = {
  smart: SmartStepEdge,
};

// Константы для fitView
const fitViewOptions = {
  padding: 0.2,
  minZoom: 0.5,
  maxZoom: 1.5,
};

// Стили для линии соединения (при drag)
const connectionLineStyleLight = {
  stroke: 'var(  --edge-selected-color-light)',
  strokeWidth: 2,
};

const connectionLineStyleDark = {
  stroke: 'var(  --edge-selected-color-dark)',
  strokeWidth: 2,
};

const GraphContent = ({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  selectedCubeHash: externalSelectedCubeHash,
  centerOnCubeHash,
  fitViewTrigger,
  onCubeClick,
  onCubeDelete,
  onResharderClick,
  onConnectionCreate,
  onConnectionDelete,
  isEditable = false,
  allowKeyboardCubeDelete = false,
  experiment_id,
  experiment_name,
  variables,
}: GraphProps) => {
  const isDarkTheme = useTheme() === 'dark';
  const { fitView, getNodes } = useReactFlow();
  const settings = useUnit(reactFlowSettingsModel.$settings);
  const connectionLineStyle = isDarkTheme
    ? connectionLineStyleDark
    : connectionLineStyleLight;

  // Ref для контейнера — нужен для установки фокуса при клике
  const containerRef = useRef<HTMLDivElement>(null);

  // Используем useNodesState и useEdgesState для управления состоянием
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Синхронизируем с входящими props
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Флаг для отслеживания первого рендера с нодами
  const isInitialFitDone = useRef(false);
  // Сохраняем предыдущее значение fitViewTrigger для сравнения
  const prevFitViewTrigger = useRef(fitViewTrigger);

  // fitView при первом рендере с нодами (initial layout)
  useEffect(() => {
    if (!isInitialFitDone.current && initialNodes.length > 0) {
      isInitialFitDone.current = true;
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

  // fitView при явном запросе через fitViewTrigger (добавление/удаление кубов/связей)
  useEffect(() => {
    // Пропускаем если это первый рендер или trigger не изменился
    if (
      prevFitViewTrigger.current === fitViewTrigger ||
      fitViewTrigger === undefined
    ) {
      prevFitViewTrigger.current = fitViewTrigger;
      return;
    }
    prevFitViewTrigger.current = fitViewTrigger;

    // Вызываем fitView с небольшой задержкой для корректной отрисовки после layout
    setTimeout(() => {
      fitView({
        padding: 0.2,
        duration: 200,
        minZoom: 0.5,
        maxZoom: 1.5,
      });
    }, 150);
  }, [fitViewTrigger, fitView]);

  // Настройки по умолчанию для edges (включая стрелки)
  // Тип линии задаётся в layout (smart для обхода нод)
  const defaultEdgeOptions = useMemo(
    () => ({
      markerEnd: {
        type: MarkerType.ArrowClosed, // Стрелка в конце edge
        width: 15,
        height: 15,
        color: isDarkTheme
          ? 'rgba(255, 255, 255, 0.5)' // Темная тема
          : 'rgba(90, 90, 90, 0.8)', // Светлая тема
      },
    }),
    [isDarkTheme],
  );

  // Валидация соединения - запрещаем соединять порты одного куба
  const isValidConnection = useCallback((connection: Edge | Connection) => {
    // Нельзя соединять порты одного и того же куба (self-loop)
    if (connection.source === connection.target) {
      return false;
    }
    return true;
  }, []);

  // Обработчик создания соединения (drag-and-drop)
  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!onConnectionCreate) return;
      if (
        !connection.source ||
        !connection.sourceHandle ||
        !connection.target ||
        !connection.targetHandle
      ) {
        return;
      }

      // Дополнительная проверка на self-loop
      if (connection.source === connection.target) {
        return;
      }

      onConnectionCreate({
        sourceNodeId: connection.source,
        sourcePortHash: connection.sourceHandle,
        targetNodeId: connection.target,
        targetPortHash: connection.targetHandle,
      });
    },
    [onConnectionCreate],
  );

  // Обработчик удаления соединений
  const handleEdgesDelete: OnEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      if (!onConnectionDelete) return;

      deletedEdges.forEach((edge) => {
        if (
          edge.source &&
          edge.sourceHandle &&
          edge.target &&
          edge.targetHandle
        ) {
          onConnectionDelete({
            sourceNodeId: edge.source,
            sourcePortHash: edge.sourceHandle,
            targetNodeId: edge.target,
            targetPortHash: edge.targetHandle,
          });
        }
      });
    },
    [onConnectionDelete],
  );

  // Состояние для выделенного edge
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Состояние для выделенного куба (cubeGroup или retry)
  // Используем внешнее состояние если оно передано
  const [internalSelectedCubeId, setInternalSelectedCubeId] = useState<
    string | null
  >(null);

  // Синхронизируем внутреннее состояние с внешним
  useEffect(() => {
    if (externalSelectedCubeHash !== undefined) {
      setInternalSelectedCubeId(externalSelectedCubeHash);
    }
  }, [externalSelectedCubeHash]);

  // Используем внешнее состояние если оно передано, иначе внутреннее
  const selectedCubeId =
    externalSelectedCubeHash !== undefined
      ? externalSelectedCubeHash
      : internalSelectedCubeId;

  // Центрирование на кубе только при явном запросе через centerOnCubeHash
  useEffect(() => {
    if (centerOnCubeHash && nodes.length > 0) {
      // Небольшая задержка для того, чтобы layout успел завершиться
      const timeoutId = setTimeout(() => {
        const selectedNode = getNodes().find(
          (n) => n.data?.cubeHash === centerOnCubeHash,
        );
        if (selectedNode) {
          // Центрируем на выбранной ноде
          fitView({
            nodes: [selectedNode],
            padding: 0.5,
            duration: 300,
            maxZoom: 1.2,
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [centerOnCubeHash, nodes, getNodes, fitView]);

  // Обработчик клика по ноде
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Устанавливаем фокус на контейнер для работы горячих клавиш
      containerRef.current?.focus();

      // Для кубов и retry выделяем и передаем cubeHash
      if (node.type === 'cubeGroup' || node.type === 'retry') {
        const cubeHash =
          typeof node.data?.cubeHash === 'string'
            ? node.data.cubeHash
            : undefined;
        if (cubeHash) {
          // Toggle selection: если уже выбран — снимаем выделение
          const newSelectedCubeId =
            selectedCubeId === cubeHash ? null : cubeHash;
          setInternalSelectedCubeId(newSelectedCubeId);
          setSelectedEdgeId(null); // Сбрасываем выделение edge
          if (onCubeClick) {
            onCubeClick(newSelectedCubeId);
          }
        }
      }
      // Для Resharder — переключаем на таб experiment
      else if (node.type === 'resharder') {
        setInternalSelectedCubeId(null);
        setSelectedEdgeId(null);
        if (onCubeClick) {
          onCubeClick(null);
        }
        if (onResharderClick) {
          onResharderClick();
        }
      }
    },
    [onCubeClick, onResharderClick, selectedCubeId],
  );

  // Цвета для edges
  const selectedEdgeColor = isDarkTheme
    ? 'var(--edge-selected-color-dark)'
    : 'var(--edge-selected-color-light)';
  const defaultEdgeColor = isDarkTheme
    ? 'var(--edge-color-dark)'
    : 'var(--edge-color-light)';

  // Добавляем стили, анимацию и цвет маркера к edges
  const edgesWithInteraction = useMemo(
    () =>
      edges.map((edge) => {
        const isSelected = isEditable && edge.id === selectedEdgeId;
        return {
          ...edge,
          // Увеличиваем область клика для удобства выделения
          interactionWidth: isEditable ? 20 : 0,
          // Помечаем выделенный edge
          selected: isSelected,
          // Анимация для выделенного edge (пунктирная бегущая линия)
          animated: isSelected,
          // Стили линии
          style: {
            stroke: isSelected ? selectedEdgeColor : defaultEdgeColor,
            strokeWidth: isSelected ? 3 : 2,
          },
          // Цвет маркера (стрелки) должен совпадать с цветом линии
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: isSelected ? selectedEdgeColor : defaultEdgeColor,
          },
        };
      }),
    [edges, isEditable, selectedEdgeId, selectedEdgeColor, defaultEdgeColor],
  );

  // Обработчик клика по edge
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (!isEditable) return;

      // Устанавливаем фокус на контейнер для работы горячих клавиш
      containerRef.current?.focus();

      // Toggle selection — только выделяем edge, без выделения куба
      setSelectedEdgeId((prev) => (prev === edge.id ? null : edge.id));
      // Сбрасываем выделение куба при клике на edge
      setInternalSelectedCubeId(null);
      // Уведомляем родительский компонент о сбросе выделения куба
      if (onCubeClick) {
        onCubeClick(null);
      }
    },
    [isEditable, onCubeClick],
  );

  // Обработчик нажатия клавиш для удаления (edge или cube)
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== 'Backspace' && event.key !== 'Delete') {
        return;
      }
      if (!selectedEdgeId && !selectedCubeId) {
        return;
      }

      const canDeleteEdge = isEditable && selectedEdgeId;
      const canDeleteCube =
        selectedCubeId &&
        onCubeDelete &&
        (isEditable || allowKeyboardCubeDelete);

      if (!canDeleteEdge && !canDeleteCube) {
        return;
      }

      event.preventDefault();

      // Приоритет: сначала удаляем edge, потом cube
      if (canDeleteEdge) {
        const edgeToDelete = edges.find((e) => e.id === selectedEdgeId);
        if (edgeToDelete && onConnectionDelete) {
          if (
            edgeToDelete.source &&
            edgeToDelete.sourceHandle &&
            edgeToDelete.target &&
            edgeToDelete.targetHandle
          ) {
            onConnectionDelete({
              sourceNodeId: edgeToDelete.source,
              sourcePortHash: edgeToDelete.sourceHandle,
              targetNodeId: edgeToDelete.target,
              targetPortHash: edgeToDelete.targetHandle,
            });
          }
        }
        setSelectedEdgeId(null);
      } else if (canDeleteCube) {
        // Находим ноду чтобы получить имя куба
        const selectedNode = nodes.find(
          (n) => n.data?.cubeHash === selectedCubeId,
        );
        const cubeName =
          typeof selectedNode?.data?.label === 'string'
            ? selectedNode.data.label
            : selectedCubeId!;
        onCubeDelete(selectedCubeId!, cubeName);
      }
    },
    [
      isEditable,
      allowKeyboardCubeDelete,
      selectedEdgeId,
      selectedCubeId,
      edges,
      nodes,
      onConnectionDelete,
      onCubeDelete,
    ],
  );

  // Сбрасываем выделение при клике на пустое место
  const handlePaneClick = useCallback(() => {
    setSelectedEdgeId(null);
    setInternalSelectedCubeId(null);
  }, []);

  // Добавляем информацию о выделении в data нод (cubeGroup и retry)
  // Выделение кубов работает и в режиме просмотра, и в режиме редактирования
  const nodesWithSelection = useMemo(
    () =>
      nodes.map((node) => {
        if (node.type === 'cubeGroup' || node.type === 'retry') {
          const cubeHash = node.data?.cubeHash;
          const isSelected = cubeHash === selectedCubeId;
          return {
            ...node,
            data: {
              ...node.data,
              selected: isSelected,
            },
          };
        }
        return node;
      }),
    [nodes, selectedCubeId],
  );

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', outline: 'none' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <ReactFlow
        className={`graph ${isEditable ? 'graph-editable' : ''}`}
        fitView
        colorMode={isDarkTheme ? 'dark' : 'light'}
        minZoom={0.1}
        maxZoom={2}
        nodes={nodesWithSelection}
        edges={edgesWithInteraction}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={false}
        nodeDragThreshold={1}
        nodesConnectable={isEditable}
        nodesFocusable={false}
        edgesFocusable={isEditable}
        elementsSelectable={false}
        selectNodesOnDrag={false}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        selectionKeyCode="Shift"
        onEdgesChange={isEditable ? onEdgesChange : undefined}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onConnect={isEditable ? handleConnect : undefined}
        onEdgesDelete={isEditable ? handleEdgesDelete : undefined}
        isValidConnection={isEditable ? isValidConnection : undefined}
        connectionLineStyle={connectionLineStyle}
        connectionLineType={ConnectionLineType.Bezier}
        fitViewOptions={fitViewOptions}
      >
        {settings.showDotsBackground && <Background />}
        <Controls showInteractive={false} showFitView showZoom />
      </ReactFlow>
      <MarketButton position="right" showAddButton={isEditable} />
      {isEditable && experiment_id && (
        <VariablesButton
          position="right"
          experiment_id={experiment_id}
          experiment_name={experiment_name}
          variables={variables}
        />
      )}
      <SettingsButton />
    </div>
  );
};

export const Graph = ({
  nodes = [],
  edges = [],
  selectedCubeHash,
  centerOnCubeHash,
  fitViewTrigger,
  onCubeClick,
  onCubeDelete,
  onResharderClick,
  onConnectionCreate,
  onConnectionDelete,
  isEditable = false,
  allowKeyboardCubeDelete = false,
  experiment_id,
  experiment_name,
  variables,
}: GraphProps) => {
  return (
    <ReactFlowProvider>
      <GraphContent
        nodes={nodes}
        edges={edges}
        selectedCubeHash={selectedCubeHash}
        centerOnCubeHash={centerOnCubeHash}
        fitViewTrigger={fitViewTrigger}
        onCubeClick={onCubeClick}
        onCubeDelete={onCubeDelete}
        onResharderClick={onResharderClick}
        onConnectionCreate={onConnectionCreate}
        onConnectionDelete={onConnectionDelete}
        isEditable={isEditable}
        allowKeyboardCubeDelete={allowKeyboardCubeDelete}
        experiment_id={experiment_id}
        experiment_name={experiment_name}
        variables={variables}
      />
    </ReactFlowProvider>
  );
};
