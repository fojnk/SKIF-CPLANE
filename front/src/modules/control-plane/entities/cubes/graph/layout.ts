/**
 * Layout графа с использованием ELK и Dagre
 */

import { Edge, Node } from '@xyflow/react';
import dagre from 'dagre';
import ELK, { ElkNode } from 'elkjs/lib/elk.bundled.js';

import { CubeType, type GraphEdge, type GraphNode } from '../types';

const elk = new ELK();

/**
 * Определяет тип React Flow ноды на основе типа куба
 */
function getReactFlowNodeType(cubeType: CubeType): string {
  switch (cubeType) {
    case CubeType.RESHARDER:
      return 'resharder';
    case CubeType.RETRIER:
      return 'retrier';
    case CubeType.RETRY:
      return 'retry';
    default:
      return 'cubeGroup';
  }
}

// Константы для размеров (должны соответствовать graph.module.scss)
const PORT_HEIGHT = 27; // Высота порта
const PORT_SPACING = 0; // Расстояние между портами (gap убран)
//height + 2 from base css cos of borders
const CUBE_HEADER_HEIGHT = 46; // Высота заголовка для cube и retry
const HEADER_HEIGHT = 32; // Высота заголовка для worker, resharder, retrier
const CUBE_PADDING = 0; // Внутренний отступ (padding отсутствует в content)
const MIN_CUBE_WIDTH = 200; // Минимальная ширина куба
const CHAR_WIDTH = 8; // Примерная ширина символа

/**
 * Вычисляет высоту куба на основе количества портов (использует CUBE_HEADER_HEIGHT)
 */
function calculateCubeHeight(inputCount: number, outputCount: number): number {
  const totalPorts = inputCount + outputCount;
  return (
    CUBE_HEADER_HEIGHT +
    CUBE_PADDING * 2 +
    totalPorts * PORT_HEIGHT +
    (totalPorts - 1) * PORT_SPACING
  );
}

/**
 * Вычисляет высоту resharder/retrier на основе количества портов (использует HEADER_HEIGHT)
 */
function calculateResharderRetrierHeight(
  inputCount: number,
  outputCount: number,
): number {
  const totalPorts = inputCount + outputCount;
  return (
    HEADER_HEIGHT +
    CUBE_PADDING * 2 +
    totalPorts * PORT_HEIGHT +
    (totalPorts - 1) * PORT_SPACING
  );
}

/**
 * Вычисляет ширину куба на основе длины названия и портов
 */
function calculateCubeWidth(
  cubeName: string,
  inputNames: string[],
  outputNames: string[],
): number {
  // Находим самое длинное название среди имени куба и портов
  const allNames = [cubeName, ...inputNames, ...outputNames];
  const maxLength = Math.max(...allNames.map((name) => name.length));

  // Вычисляем ширину с учетом padding и иконок
  const calculatedWidth = maxLength * CHAR_WIDTH + CUBE_PADDING * 4 + 40;

  // Возвращаем максимум из рассчитанной и минимальной ширины
  return Math.max(calculatedWidth, MIN_CUBE_WIDTH);
}

// Настройки для ELK layout
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  // Расстояния между слоями и нодами
  'elk.layered.spacing.nodeNodeBetweenLayers': '200',
  'elk.spacing.nodeNode': '80',
  // Стратегии размещения
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
  // Минимизация пересечений — более тщательный алгоритм
  'elk.layered.crossingMinimization.strategy': 'INTERACTIVE',
  'elk.layered.crossingMinimization.greedySwitch.type': 'ONE_SIDED',
  // Маршрутизация рёбер — огибание нод
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.layered.spacing.edgeNodeBetweenLayers': '60',
  'elk.layered.spacing.edgeEdgeBetweenLayers': '30',
  // Отступы вокруг нод для рёбер
  'elk.spacing.portsSurrounding': '20',
  'elk.layered.spacing.baseValue': '50',
};

/**
 * Преобразует граф в формат React Flow с автоматическим layout через ELK
 * @param graphNodes - Массив нод графа
 * @param graphEdges - Массив связей графа
 * @returns Объект с нодами и edges для React Flow
 */
export async function layoutGraph(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (graphNodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Вычисляем размеры для всех нод
  const nodeSizes = new Map<
    string,
    { width: number; height: number; graphNode: GraphNode }
  >();
  graphNodes.forEach((node) => {
    const inputPorts = node.inputPorts || [];
    const outputPorts = node.outputPorts || [];
    const inputNames = inputPorts.map((p) => p.name);
    const outputNames = outputPorts.map((p) => p.name);
    const isResharder = node.type === CubeType.RESHARDER;
    const isRetrier = node.type === CubeType.RETRIER;
    // Используем разные высоты для разных типов нод
    const cubeHeight =
      isResharder || isRetrier
        ? calculateResharderRetrierHeight(inputPorts.length, outputPorts.length)
        : calculateCubeHeight(inputPorts.length, outputPorts.length);
    const cubeWidth = calculateCubeWidth(node.id, inputNames, outputNames);
    nodeSizes.set(node.id, {
      width: cubeWidth,
      height: cubeHeight,
      graphNode: node,
    });
  });

  // Создаем список нод для ELK (включая Resharder и Retrier с реальными размерами)
  const elkNodes = graphNodes.map((node) => {
    const size = nodeSizes.get(node.id)!;
    return {
      id: node.id,
      width: size.width,
      height: size.height,
    };
  });

  // Создаем граф для ELK со ВСЕМИ edges
  // ELK использует edges для определения топологического порядка (слоёв)
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: elkOptions,
    children: elkNodes,
    edges: graphEdges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  // Вычисляем layout
  const layoutedGraph = await elk.layout(graph);

  // Преобразуем в React Flow формат
  const nodes: Node[] = [];

  // Обрабатываем результаты ELK layout (включая Resharder и Retrier)
  layoutedGraph.children?.forEach((node) => {
    const sizeData = nodeSizes.get(node.id);
    if (!sizeData) return;

    const { graphNode } = sizeData;
    const isResharder = graphNode.type === CubeType.RESHARDER;
    const isRetrier = graphNode.type === CubeType.RETRIER;

    const inputPorts = graphNode.inputPorts || [];
    const outputPorts = graphNode.outputPorts || [];

    const cubeWidth =
      node.width !== undefined && Number.isFinite(node.width) && node.width > 0
        ? node.width
        : MIN_CUBE_WIDTH;
    const cubeHeight =
      node.height !== undefined &&
      Number.isFinite(node.height) &&
      node.height > 0
        ? node.height
        : 100;

    const reactFlowNode: Node = {
      id: node.id,
      type: getReactFlowNodeType(graphNode.type),
      data: {
        label: graphNode.label,
        isExternal: isResharder || isRetrier,
        inputPorts,
        outputPorts,
        hasError: graphNode.hasError,
        errorCode: graphNode.errorCode,
        cubeHash: graphNode.cubeHash,
        cubeId: graphNode.cubeId,
        baseCubeName: graphNode.baseCubeName,
      },
      position: {
        x: node.x !== undefined && Number.isFinite(node.x) ? node.x : 0,
        y: node.y !== undefined && Number.isFinite(node.y) ? node.y : 0,
      },
      style: {
        width: cubeWidth,
        height: cubeHeight,
      },
      // Явно включаем выделение и перетаскивание для кубов
      selectable: true,
      draggable: true,
    };

    nodes.push(reactFlowNode);
  });

  // Проверяем, есть ли у Resharder исходящие связи
  // Если нет, размещаем его напротив первой ноды первого слоя
  const resharderNode = nodes.find((node) => node.id === 'Resharder');
  if (resharderNode) {
    const resharderHasOutgoing = graphEdges.some(
      (edge) => edge.source === 'Resharder',
    );
    if (!resharderHasOutgoing) {
      // Находим первый слой кубов (минимальный X)
      let minX = Infinity;
      const cubeNodes = nodes.filter(
        (node) => node.id !== 'Resharder' && node.id !== 'Retrier',
      );
      cubeNodes.forEach((node) => {
        minX = Math.min(minX, node.position.x);
      });

      if (minX !== Infinity && Number.isFinite(minX) && cubeNodes.length > 0) {
        // Находим первую ноду в первом слое (минимальный Y среди кубов с минимальным X)
        let firstNode: Node | undefined;
        let minY = Infinity;
        cubeNodes.forEach((node) => {
          if (
            Number.isFinite(node.position.x) &&
            Number.isFinite(node.position.y) &&
            Math.abs(node.position.x - minX) < 1
          ) {
            // Кубы в первом слое (с учётом погрешности)
            if (node.position.y < minY) {
              minY = node.position.y;
              firstNode = node;
            }
          }
        });

        if (
          firstNode &&
          Number.isFinite(firstNode.position.y) &&
          Number.isFinite(minX)
        ) {
          // Размещаем Resharder слева от первого слоя, на том же Y
          const resharderWidth =
            (resharderNode.style?.width as number) || MIN_CUBE_WIDTH;
          const spacing = 250;
          resharderNode.position.x = minX - resharderWidth - spacing;
          resharderNode.position.y = firstNode.position.y;
        }
      }
    }
  }

  // Проверяем, есть ли у Retrier исходящие связи
  // Если нет, размещаем его сразу под Resharder
  const retrierNode = nodes.find((node) => node.id === 'Retrier');
  if (retrierNode && resharderNode) {
    const retrierHasOutgoing = graphEdges.some(
      (edge) => edge.source === 'Retrier',
    );
    if (!retrierHasOutgoing) {
      // Размещаем Retrier сразу под Resharder
      const resharderHeight = (resharderNode.style?.height as number) || 100;
      const verticalGap = 20;
      const resharderX = resharderNode.position.x;
      const resharderY = resharderNode.position.y;

      if (
        Number.isFinite(resharderX) &&
        Number.isFinite(resharderY) &&
        Number.isFinite(resharderHeight)
      ) {
        retrierNode.position.x = resharderX;
        const newRetrierY = resharderY + resharderHeight + verticalGap;
        if (Number.isFinite(newRetrierY)) {
          retrierNode.position.y = newRetrierY;
        }
      }
    }
  }

  // Проверяем наложение Resharder и Retrier и корректируем позиции
  if (resharderNode && retrierNode) {
    const resharderX = resharderNode.position.x;
    const resharderY = resharderNode.position.y;
    const resharderWidth =
      (resharderNode.style?.width as number) || MIN_CUBE_WIDTH;
    const resharderHeight = (resharderNode.style?.height as number) || 100;

    const retrierX = retrierNode.position.x;
    const retrierY = retrierNode.position.y;
    const retrierWidth = (retrierNode.style?.width as number) || MIN_CUBE_WIDTH;
    const retrierHeight = (retrierNode.style?.height as number) || 100;

    // Проверяем, что все значения валидны перед проверкой наложения
    if (
      Number.isFinite(resharderX) &&
      Number.isFinite(resharderY) &&
      Number.isFinite(retrierX) &&
      Number.isFinite(retrierY) &&
      Number.isFinite(resharderWidth) &&
      Number.isFinite(resharderHeight) &&
      Number.isFinite(retrierWidth) &&
      Number.isFinite(retrierHeight)
    ) {
      // Проверяем наложение по X (горизонтальное)
      const resharderRight = resharderX + resharderWidth;
      const resharderLeft = resharderX;
      const retrierRight = retrierX + retrierWidth;
      const retrierLeft = retrierX;

      const horizontalOverlap =
        resharderLeft < retrierRight && retrierLeft < resharderRight;

      // Проверяем наложение по Y (вертикальное)
      const resharderBottom = resharderY + resharderHeight;
      const resharderTop = resharderY;
      const retrierBottom = retrierY + retrierHeight;
      const retrierTop = retrierY;

      const verticalOverlap =
        resharderTop < retrierBottom && retrierTop < resharderBottom;

      // Если есть наложение, корректируем позицию Retrier
      if (horizontalOverlap && verticalOverlap) {
        // Сдвигаем Retrier ниже Resharder с отступом
        const verticalGap = 20;
        const newRetrierY = resharderBottom + verticalGap;
        if (Number.isFinite(newRetrierY)) {
          retrierNode.position.y = newRetrierY;
        }
      }
    }
  }

  // Находим кубы без связей (disconnected) и перемещаем их в самый правый слой
  // Исключаем Resharder и Retrier из disconnected кубов
  const disconnectedCubeIds = new Set<string>();
  nodes.forEach((node) => {
    // Пропускаем Resharder и Retrier - они размещаются ELK автоматически
    if (node.id === 'Resharder' || node.id === 'Retrier') {
      return;
    }
    const hasIncoming = graphEdges.some((edge) => edge.target === node.id);
    const hasOutgoing = graphEdges.some((edge) => edge.source === node.id);
    if (!hasIncoming && !hasOutgoing) {
      disconnectedCubeIds.add(node.id);
    }
  });

  // Если есть disconnected кубы, размещаем их в последнем слое
  // рядом с соединёнными кубами
  if (disconnectedCubeIds.size > 0 && nodes.length > disconnectedCubeIds.size) {
    // Находим максимальный X среди связанных кубов (исключая Resharder/Retrier)
    // Это будет последний слой
    let maxX = -Infinity;
    nodes.forEach((node) => {
      if (
        !disconnectedCubeIds.has(node.id) &&
        node.id !== 'Resharder' &&
        node.id !== 'Retrier' &&
        Number.isFinite(node.position.x)
      ) {
        maxX = Math.max(maxX, node.position.x);
      }
    });

    // Если maxX валиден, продолжаем размещение
    if (Number.isFinite(maxX) && maxX !== -Infinity) {
      // Находим максимальный Y среди кубов в последнем слое
      // Disconnected кубы будут размещены ниже этих кубов
      let maxYInLastLayer = -Infinity;
      nodes.forEach((node) => {
        if (
          !disconnectedCubeIds.has(node.id) &&
          node.id !== 'Resharder' &&
          node.id !== 'Retrier' &&
          Number.isFinite(node.position.x) &&
          Number.isFinite(node.position.y) &&
          // Кубы в последнем слое (с учётом погрешности)
          Math.abs(node.position.x - maxX) < 1
        ) {
          const nodeHeight = (node.style?.height as number) || 100;
          if (Number.isFinite(nodeHeight)) {
            const nodeBottom = node.position.y + nodeHeight;
            if (Number.isFinite(nodeBottom)) {
              maxYInLastLayer = Math.max(maxYInLastLayer, nodeBottom);
            }
          }
        }
      });

      // Группируем disconnected кубы для вертикального размещения
      const disconnectedCubes = nodes.filter((node) =>
        disconnectedCubeIds.has(node.id),
      );
      disconnectedCubes.sort((a, b) => {
        const aY = Number.isFinite(a.position.y) ? a.position.y : 0;
        const bY = Number.isFinite(b.position.y) ? b.position.y : 0;
        return aY - bY;
      });

      // Размещаем disconnected кубы в последнем слое, ниже существующих кубов
      const disconnectedX = maxX; // Тот же X, что и последний слой
      const verticalGap = 60; // Расстояние между кубами
      // Добавляем отступ перед первым disconnected кубом
      let disconnectedY =
        Number.isFinite(maxYInLastLayer) && maxYInLastLayer >= 0
          ? maxYInLastLayer + verticalGap
          : 0;
      disconnectedCubes.forEach((node) => {
        const cubeHeight = (node.style?.height as number) || 100;
        if (Number.isFinite(disconnectedX) && Number.isFinite(disconnectedY)) {
          node.position.x = disconnectedX;
          node.position.y = disconnectedY;
          if (Number.isFinite(cubeHeight)) {
            disconnectedY += cubeHeight + verticalGap;
          }
        }
      });
    }
  }

  // Создаём edges
  const edges: Edge[] = graphEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.outputPortHash,
    targetHandle: edge.inputPortHash,
    type: edge.edgeType || 'smart',
  }));

  return { nodes, edges };
}

/**
 * Вычисляет слой (колонку) для каждого куба на основе топологии графа
 * Логика:
 * - Слой 0: кубы со связями от Resharder + кубы без связей (disconnected)
 * - Слой N+1: кубы со связями от кубов слоя N
 * @param graphNodes - Массив нод графа
 * @param graphEdges - Массив связей графа
 * @returns Map с ID ноды и её слоем (0, 1, 2, ...)
 */
function calculateNodeLayers(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
): Map<string, number> {
  const layers = new Map<string, number>();
  // Включаем и обычные кубы, и RETRY кубы
  const cubeNodes = graphNodes.filter(
    (n) => n.type === CubeType.CUBE || n.type === CubeType.RETRY,
  );

  // Инициализируем все кубы слоем -1 (не определен)
  cubeNodes.forEach((node) => layers.set(node.id, -1));

  // Функция для получения всех источников (откуда идут входящие связи)
  const getSourceNodes = (nodeId: string): string[] => {
    return graphEdges
      .filter((edge) => edge.target === nodeId)
      .map((edge) => edge.source);
  };

  // Рекурсивная функция для вычисления слоя ноды
  const calculateLayer = (
    nodeId: string,
    visited = new Set<string>(),
  ): number => {
    // Защита от циклов
    if (visited.has(nodeId)) {
      return 0;
    }
    visited.add(nodeId);

    // Если слой уже вычислен, возвращаем его
    const existingLayer = layers.get(nodeId);
    if (existingLayer !== undefined && existingLayer !== -1) {
      return existingLayer;
    }

    const sources = getSourceNodes(nodeId);

    // Если есть источник Resharder или Retrier - это слой 0
    const hasResharderSource = sources.includes('Resharder');
    const hasRetrierSource = sources.includes('Retrier');
    const hasExternalSource = hasResharderSource || hasRetrierSource;

    // Фильтруем только источники-кубы (не Resharder и не Retrier)
    const cubeSourcesOnly = sources.filter(
      (s) => s !== 'Resharder' && s !== 'Retrier',
    );

    if (hasExternalSource && cubeSourcesOnly.length === 0) {
      // Только внешний источник (Resharder/Retrier) - слой 0
      layers.set(nodeId, 0);
      return 0;
    }

    if (cubeSourcesOnly.length === 0) {
      // Нет источников вообще - это disconnected куб
      // Пока не устанавливаем слой, вернёмся к нему позже
      return -1;
    }

    // Вычисляем максимальный слой среди источников-кубов
    let maxSourceLayer = -1;
    cubeSourcesOnly.forEach((sourceId) => {
      const sourceLayer = calculateLayer(sourceId, new Set(visited));
      if (sourceLayer >= 0) {
        maxSourceLayer = Math.max(maxSourceLayer, sourceLayer);
      }
    });

    // Если все источники без связей, и есть внешний источник - слой 0
    if (maxSourceLayer === -1 && hasExternalSource) {
      layers.set(nodeId, 0);
      return 0;
    }

    // Если все источники без связей и нет внешнего источника - тоже слой 0
    if (maxSourceLayer === -1) {
      layers.set(nodeId, 0);
      return 0;
    }

    // Слой текущей ноды = максимальный слой источников + 1
    const layer = maxSourceLayer + 1;
    layers.set(nodeId, layer);
    return layer;
  };

  // Вычисляем слои для всех кубов
  cubeNodes.forEach((node) => {
    if (layers.get(node.id) === -1) {
      calculateLayer(node.id);
    }
  });

  // Находим максимальный слой среди связанных кубов
  let maxLayer = -1;
  cubeNodes.forEach((node) => {
    const layer = layers.get(node.id);
    if (layer !== undefined && layer !== -1) {
      maxLayer = Math.max(maxLayer, layer);
    }
  });

  // Disconnected кубы (без связей) размещаем в последнем слое
  // (максимальный слой, а не максимальный + 1)
  cubeNodes.forEach((node) => {
    const layer = layers.get(node.id);
    if (layer === -1) {
      // Это disconnected куб - размещаем его в последнем слое
      const disconnectedLayer = maxLayer >= 0 ? maxLayer : 0;
      layers.set(node.id, disconnectedLayer);
    }
  });

  return layers;
}

/**
 * Простой синхронный layout (fallback если ELK не работает)
 * @param graphNodes - Массив нод графа
 * @param graphEdges - Массив связей графа
 * @returns Объект с нодами и edges для React Flow
 */
export function simpleLayout(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
): { nodes: Node[]; edges: Edge[] } {
  const horizontalSpacing = 350; // Горизонтальное расстояние между слоями
  const verticalGap = 60; // Минимальный зазор между кубами в одном слое

  // Вычисляем слои для всех кубов
  const nodeLayers = calculateNodeLayers(graphNodes, graphEdges);

  // Разделяем ноды на кубы и Resharder
  const cubeNodes: Node[] = [];
  const resharderNodes: Node[] = [];

  // Группируем кубы по слоям
  const layerGroups = new Map<
    number,
    Array<{
      node: GraphNode;
      width: number;
      height: number;
    }>
  >();

  // Сначала создаем все кубы с их размерами и группируем по слоям
  const cubeNodesData: Array<{
    node: GraphNode;
    width: number;
    height: number;
    layer: number;
  }> = [];

  // Массив для Retrier нод
  const retrierNodes: Node[] = [];

  graphNodes.forEach((node) => {
    const isResharder = node.type === CubeType.RESHARDER;
    const isRetrier = node.type === CubeType.RETRIER;

    if (isResharder) {
      // Resharder обрабатываем отдельно
      const inputPorts = node.inputPorts || [];
      const outputPorts = node.outputPorts || [];
      const inputNames = inputPorts.map((p) => p.name);
      const outputNames = outputPorts.map((p) => p.name);
      const cubeHeight = calculateResharderRetrierHeight(
        inputPorts.length,
        outputPorts.length,
      );
      const cubeWidth = calculateCubeWidth(node.id, inputNames, outputNames);

      resharderNodes.push({
        id: node.id,
        type: 'resharder',
        data: {
          label: node.label,
          isExternal: true,
          inputPorts: node.inputPorts || [],
          outputPorts: node.outputPorts || [],
          hasError: node.hasError,
          errorCode: node.errorCode,
        },
        position: { x: 0, y: 0 },
        style: {
          width: cubeWidth,
          height: cubeHeight,
        },
      });
    } else if (isRetrier) {
      // Retrier обрабатываем отдельно (позиционируется под Resharder)
      const inputPorts = node.inputPorts || [];
      const outputPorts = node.outputPorts || [];
      const inputNames = inputPorts.map((p) => p.name);
      const outputNames = outputPorts.map((p) => p.name);
      const cubeHeight = calculateResharderRetrierHeight(
        inputPorts.length,
        outputPorts.length,
      );
      const cubeWidth = calculateCubeWidth(node.id, inputNames, outputNames);

      retrierNodes.push({
        id: node.id,
        type: 'retrier',
        data: {
          label: node.label,
          isExternal: true,
          inputPorts: node.inputPorts || [],
          outputPorts: node.outputPorts || [],
          hasError: node.hasError,
          errorCode: node.errorCode,
        },
        position: { x: 0, y: 0 },
        style: {
          width: cubeWidth,
          height: cubeHeight,
        },
      });
    } else {
      // Собираем данные о кубах с их слоями
      const inputPorts = node.inputPorts || [];
      const outputPorts = node.outputPorts || [];
      const inputNames = inputPorts.map((p) => p.name);
      const outputNames = outputPorts.map((p) => p.name);
      const cubeHeight = calculateCubeHeight(
        inputPorts.length,
        outputPorts.length,
      );
      const cubeWidth = calculateCubeWidth(node.id, inputNames, outputNames);
      const layer = nodeLayers.get(node.id) ?? 0;

      const cubeData = {
        node,
        width: cubeWidth,
        height: cubeHeight,
        layer,
      };

      cubeNodesData.push(cubeData);

      // Группируем по слоям
      if (!layerGroups.has(layer)) {
        layerGroups.set(layer, []);
      }
      layerGroups.get(layer)!.push(cubeData);
    }
  });

  // Функция для проверки, есть ли у куба связь с Resharder
  const hasResharderConnection = (nodeId: string): boolean => {
    return graphEdges.some(
      (edge) => edge.target === nodeId && edge.source === 'Resharder',
    );
  };

  // Получаем индекс выходного порта Resharder для куба (для сортировки в слое 0)
  const getResharderPortIndex = (nodeId: string): number => {
    const resharderNode = graphNodes.find((n) => n.type === CubeType.RESHARDER);
    if (!resharderNode) return Infinity;

    // Находим edge от Resharder к этому кубу
    const edge = graphEdges.find(
      (e) => e.target === nodeId && e.source === 'Resharder',
    );
    if (!edge) return Infinity;

    // Находим индекс выходного порта Resharder
    const portIndex = resharderNode.outputPorts.findIndex(
      (p) => p.hash === edge.outputPortHash,
    );
    return portIndex >= 0 ? portIndex : Infinity;
  };

  // Хранилище Y-позиций кубов для сортировки следующих слоёв
  const cubeYPositions = new Map<string, number>();

  // Получаем среднюю Y-позицию источников куба (для минимизации пересечений)
  const getSourcesAverageY = (nodeId: string): number => {
    const incomingEdges = graphEdges.filter((e) => e.target === nodeId);
    if (incomingEdges.length === 0) return Infinity;

    let totalY = 0;
    let count = 0;

    incomingEdges.forEach((edge) => {
      const sourceY = cubeYPositions.get(edge.source);
      if (sourceY !== undefined) {
        // Учитываем позицию выходного порта источника
        const sourceNode = graphNodes.find((n) => n.id === edge.source);
        if (sourceNode) {
          const portIndex = sourceNode.outputPorts.findIndex(
            (p) => p.hash === edge.outputPortHash,
          );
          // Добавляем смещение на основе индекса порта (примерно PORT_HEIGHT на порт)
          const portOffset = portIndex >= 0 ? portIndex * PORT_HEIGHT : 0;
          totalY += sourceY + portOffset;
          count++;
        }
      }
    });

    return count > 0 ? totalY / count : Infinity;
  };

  // Размещаем кубы по слоям (колонкам)
  const sortedLayers = Array.from(layerGroups.keys()).sort((a, b) => a - b);

  sortedLayers.forEach((layer) => {
    let cubesInLayer = layerGroups.get(layer)!;

    if (layer === 0) {
      // Для слоя 0: сначала кубы со связями с Resharder (по порядку портов), потом без связей
      cubesInLayer = [...cubesInLayer].sort((a, b) => {
        const aHasResharder = hasResharderConnection(a.node.id);
        const bHasResharder = hasResharderConnection(b.node.id);

        // Кубы со связью с Resharder идут первыми
        if (aHasResharder && !bHasResharder) return -1;
        if (!aHasResharder && bHasResharder) return 1;

        // Если оба со связью с Resharder - сортируем по индексу порта Resharder
        if (aHasResharder && bHasResharder) {
          return (
            getResharderPortIndex(a.node.id) - getResharderPortIndex(b.node.id)
          );
        }

        return 0;
      });
    } else {
      // Для слоёв N > 0: сортируем по средней Y-позиции источников (минимизация пересечений)
      cubesInLayer = [...cubesInLayer].sort((a, b) => {
        return getSourcesAverageY(a.node.id) - getSourcesAverageY(b.node.id);
      });
    }

    const x = layer * horizontalSpacing; // X позиция = номер слоя * spacing

    // Размещаем кубы в слое вертикально
    let currentY = 0;
    cubesInLayer.forEach((cubeData) => {
      const y = currentY;

      // Сохраняем Y-позицию куба для сортировки следующих слоёв
      cubeYPositions.set(cubeData.node.id, y);

      const inputPorts = cubeData.node.inputPorts || [];
      const outputPorts = cubeData.node.outputPorts || [];

      // Создаем ноду куба
      cubeNodes.push({
        id: cubeData.node.id,
        type: getReactFlowNodeType(cubeData.node.type),
        data: {
          label: cubeData.node.label,
          isExternal: false,
          inputPorts,
          outputPorts,
          hasError: cubeData.node.hasError,
          errorCode: cubeData.node.errorCode,
          cubeHash: cubeData.node.cubeHash,
          cubeId: cubeData.node.cubeId,
          baseCubeName: cubeData.node.baseCubeName,
        },
        position: { x, y },
        style: {
          width: cubeData.width,
          height: cubeData.height,
        },
      });

      // Обновляем Y для следующего куба в этом слое
      currentY += cubeData.height + verticalGap;
    });
  });

  // Создаем итоговый массив нод
  const nodes: Node[] = [];

  if (cubeNodes.length > 0) {
    // Добавляем все кубы напрямую (без WorkerGroup)
    cubeNodes.forEach((node) => {
      nodes.push(node);
    });

    // Позиционируем Resharder слева от кубов
    // Увеличиваем spacing для лучшего визуального разделения
    const spacing = 250;
    const verticalGap = 20;
    let currentY = 0;

    resharderNodes.forEach((resharderNode) => {
      const resharderWidth = (resharderNode.style?.width as number) || 220;
      const resharderHeight = (resharderNode.style?.height as number) || 100;
      nodes.push({
        ...resharderNode,
        position: {
          x: -resharderWidth - spacing,
          y: currentY,
        },
      });
      currentY += resharderHeight + verticalGap;
    });

    // Позиционируем Retrier под Resharder
    retrierNodes.forEach((retrierNode) => {
      const retrierWidth = (retrierNode.style?.width as number) || 220;
      nodes.push({
        ...retrierNode,
        position: {
          x: -retrierWidth - spacing,
          y: currentY,
        },
      });
    });
  } else {
    // Если нет кубов, просто добавляем Resharder и Retrier
    let currentY = 0;
    const verticalGap = 20;

    resharderNodes.forEach((resharderNode) => {
      const resharderHeight = (resharderNode.style?.height as number) || 100;
      nodes.push({
        ...resharderNode,
        position: { x: 0, y: currentY },
      });
      currentY += resharderHeight + verticalGap;
    });

    retrierNodes.forEach((retrierNode) => {
      nodes.push({
        ...retrierNode,
        position: { x: 0, y: currentY },
      });
    });
  }

  // Обновляем edges: source/target - это ID кубов, sourceHandle/targetHandle - это hash портов
  const edges: Edge[] = graphEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.outputPortHash,
    targetHandle: edge.inputPortHash,
    type: edge.edgeType || 'smart',
  }));

  return { nodes, edges };
}

/**
 * Layout графа с использованием Dagre (направленный ациклический граф)
 * Dagre обеспечивает более компактное и читаемое размещение с минимизацией пересечений
 * @param graphNodes - Массив нод графа
 * @param graphEdges - Массив связей графа
 * @returns Объект с нодами и edges для React Flow
 */
export function dagreLayout(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
): { nodes: Node[]; edges: Edge[] } {
  if (graphNodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Создаём новый граф dagre
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Настройки графа:
  // rankdir: LR - слева направо (Resharder -> Cubes)
  // nodesep: вертикальное расстояние между нодами в одном ранге
  // ranksep: горизонтальное расстояние между рангами (слоями)
  // align: выравнивание нод
  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 80,
    ranksep: 180,
    align: 'UL',
    acyclicer: 'greedy',
    ranker: 'network-simplex',
  });

  // Добавляем ноды в dagre граф
  graphNodes.forEach((node) => {
    const inputPorts = node.inputPorts || [];
    const outputPorts = node.outputPorts || [];
    const inputNames = inputPorts.map((p) => p.name);
    const outputNames = outputPorts.map((p) => p.name);
    const isResharder = node.type === CubeType.RESHARDER;
    const isRetrier = node.type === CubeType.RETRIER;
    // Используем разные высоты для разных типов нод
    const cubeHeight =
      isResharder || isRetrier
        ? calculateResharderRetrierHeight(inputPorts.length, outputPorts.length)
        : calculateCubeHeight(inputPorts.length, outputPorts.length);
    const cubeWidth = calculateCubeWidth(node.id, inputNames, outputNames);

    // Добавляем ноду в dagre
    dagreGraph.setNode(node.id, {
      width: cubeWidth,
      height: cubeHeight,
    });
  });

  // Добавляем edges в dagre граф
  graphEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Вычисляем layout
  dagre.layout(dagreGraph);

  // Преобразуем результат в React Flow формат
  const cubeNodes: Node[] = [];
  const resharderNodes: Node[] = [];
  const retrierNodes: Node[] = [];

  // Минимальные координаты кубов (для позиционирования Resharder/Retrier)
  let minX = Infinity;
  let minY = Infinity;

  graphNodes.forEach((graphNode) => {
    const dagreNode = dagreGraph.node(graphNode.id);
    if (!dagreNode) return;

    const isResharder = graphNode.type === CubeType.RESHARDER;
    const isRetrier = graphNode.type === CubeType.RETRIER;
    const inputPorts = graphNode.inputPorts || [];
    const outputPorts = graphNode.outputPorts || [];

    // Dagre возвращает центр ноды, конвертируем в левый верхний угол
    const x = dagreNode.x - dagreNode.width / 2;
    const y = dagreNode.y - dagreNode.height / 2;

    const nodeResult: Node = {
      id: graphNode.id,
      type: getReactFlowNodeType(graphNode.type),
      data: {
        label: graphNode.label,
        isExternal: isResharder || isRetrier,
        inputPorts,
        outputPorts,
        hasError: graphNode.hasError,
        errorCode: graphNode.errorCode,
        cubeHash: graphNode.cubeHash,
        cubeId: graphNode.cubeId,
        baseCubeName: graphNode.baseCubeName,
      },
      position: { x, y },
      style: {
        width: dagreNode.width,
        height: dagreNode.height,
      },
    };

    if (isResharder) {
      resharderNodes.push(nodeResult);
    } else if (isRetrier) {
      retrierNodes.push(nodeResult);
    } else {
      cubeNodes.push(nodeResult);
      // Обновляем минимальные координаты для позиционирования Resharder/Retrier
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
    }
  });

  // Создаем итоговый массив нод
  const nodes: Node[] = [];

  if (cubeNodes.length > 0) {
    // Добавляем все кубы напрямую (без WorkerGroup)
    cubeNodes.forEach((node) => {
      nodes.push(node);
    });

    // Позиционируем Resharder слева от кубов
    // Увеличиваем spacing для лучшего визуального разделения
    const spacing = 250;
    const verticalGap = 20;

    // Используем более разумную начальную Y-позицию
    // Если minY слишком близок к 0, начинаем с 0, иначе используем minY
    // Это предотвращает размещение Resharder/Retrier слишком высоко
    const startY = minY < 50 ? 0 : minY;
    let currentY = startY;

    resharderNodes.forEach((resharderNode) => {
      const resharderWidth =
        (resharderNode.style?.width as number) || MIN_CUBE_WIDTH;
      const resharderHeight = (resharderNode.style?.height as number) || 100;
      nodes.push({
        ...resharderNode,
        position: {
          x: minX - resharderWidth - spacing,
          y: currentY,
        },
      });
      currentY += resharderHeight + verticalGap;
    });

    // Позиционируем Retrier под Resharder
    retrierNodes.forEach((retrierNode) => {
      const retrierWidth =
        (retrierNode.style?.width as number) || MIN_CUBE_WIDTH;
      nodes.push({
        ...retrierNode,
        position: {
          x: minX - retrierWidth - spacing,
          y: currentY,
        },
      });
    });
  } else {
    // Если нет кубов, просто добавляем Resharder и Retrier
    let currentY = 0;
    const verticalGap = 20;

    resharderNodes.forEach((resharderNode) => {
      const resharderHeight = (resharderNode.style?.height as number) || 100;
      nodes.push({
        ...resharderNode,
        position: { x: 0, y: currentY },
      });
      currentY += resharderHeight + verticalGap;
    });

    retrierNodes.forEach((retrierNode) => {
      nodes.push({
        ...retrierNode,
        position: { x: 0, y: currentY },
      });
    });
  }

  // Создаём edges
  const edges: Edge[] = graphEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.outputPortHash,
    targetHandle: edge.inputPortHash,
    type: edge.edgeType || 'smart',
  }));

  return { nodes, edges };
}
