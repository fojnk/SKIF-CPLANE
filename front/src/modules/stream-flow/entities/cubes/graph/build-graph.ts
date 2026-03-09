/**
 * Построение графа из массива кубов для редактора
 */

import {
  CubeType,
  type EditExperimentCube,
  type GraphEdge,
  type GraphNode,
  type PortInfo,
  type CubesGraphParams,
} from '../types';

import { createPortsWithHash, generateHash } from './utils';

// ============================================================================
// Типы
// ============================================================================

/**
 * Параметры для построения графа из формы
 */
export interface BuildGraphOptions {
  resharderInputSources?: PortInfo[];
  hasResharderResources?: boolean;
  // Список базовых кубов для получения имени по CubeID
  cubesList?: Array<{ id?: number; name?: string }>;
}

// ============================================================================
// Основная функция
// ============================================================================

/**
 * Строит граф из массива EditExperimentCube
 * @param cubes - Массив кубов для редактирования
 * @param options - Опции построения графа
 * @returns CubesGraphParams для построения графа
 */
export function buildGraphFromCubes(
  cubes: EditExperimentCube[],
  options: BuildGraphOptions = {},
): CubesGraphParams {
  const {
    resharderInputSources = [],
    hasResharderResources = false,
    cubesList = [],
  } = options;

  // Используем PortInfo[] напрямую из resharderInputSources
  const resharderOutputPorts: PortInfo[] = resharderInputSources;

  // Resharder показываем всегда, кроме случая когда нет портов И нет ресурсов
  const shouldShowResharder =
    resharderOutputPorts.length > 0 || hasResharderResources;

  if (cubes.length === 0) {
    const nodes: GraphNode[] = [];
    if (shouldShowResharder) {
      nodes.push({
        id: 'Resharder',
        label: 'Resharder',
        outputPorts: resharderOutputPorts,
        inputPorts: [],
        type: CubeType.RESHARDER,
      });
    }

    return {
      nodes,
      edges: [],
    };
  }

  // Находим дубликаты имен кубов
  const nameCount = new Map<string, number>();
  cubes.forEach((cube) => {
    if (cube.Name) {
      nameCount.set(cube.Name, (nameCount.get(cube.Name) || 0) + 1);
    }
  });

  const duplicateNames = new Set<string>();
  nameCount.forEach((count, name) => {
    if (count > 1) {
      duplicateNames.add(name);
    }
  });

  // Маппинг от индекса куба к его уникальному nodeId
  const cubeIndexToNodeId = new Map<number, string>();

  // Создаем ноды из кубов
  const nodes: GraphNode[] = cubes.map((cube, index) => {
    // Проверяем все возможные ошибки
    const hasEmptyName = !cube.Name || cube.Name.trim() === '';
    const hasCubeId = cube.CubeID !== undefined && cube.CubeID !== null;
    const hasDuplicateName = cube.Name ? duplicateNames.has(cube.Name) : false;

    // Если есть хотя бы одна ошибка - устанавливаем hasError
    const hasError = hasEmptyName || !hasCubeId || hasDuplicateName;

    // id всегда в формате cube_HASH
    const nodeId = `cube_${cube.Hash}`;
    // label - имя куба для отображения
    const label = cube.Name && cube.Name.trim() ? cube.Name : nodeId;

    // Получаем имя базового куба из списка базовых кубов по CubeID
    // Если не найдено, пытаемся извлечь из имени куба
    let baseCubeName: string | undefined;
    if (cube.CubeID) {
      const baseCube = cubesList.find((c) => c.id === cube.CubeID);
      if (baseCube?.name) {
        baseCubeName = baseCube.name;
      } else if (cube.Name) {
        // Fallback: пытаемся извлечь имя базового куба из имени куба
        // Формат имени: BaseCubeName_HASH4 или просто BaseCubeName
        const lastUnderscoreIndex = cube.Name.lastIndexOf('_');
        if (lastUnderscoreIndex > 0) {
          const afterUnderscore = cube.Name.substring(lastUnderscoreIndex + 1);
          // Если после подчеркивания 4 символа (похоже на hash), берем часть до подчеркивания
          if (
            afterUnderscore.length === 4 &&
            /^[A-Z0-9]+$/i.test(afterUnderscore)
          ) {
            baseCubeName = cube.Name.substring(0, lastUnderscoreIndex);
          } else {
            // Иначе используем полное имя
            baseCubeName = cube.Name;
          }
        } else {
          // Нет подчеркивания - используем полное имя
          baseCubeName = cube.Name;
        }
      }
    }

    // Сохраняем маппинг индекса к nodeId
    cubeIndexToNodeId.set(index, nodeId);

    // Для inputPorts: если есть InputNames (PortInfo[]) - используем их напрямую
    let inputPorts: PortInfo[];
    if (cube.InputNames && Array.isArray(cube.InputNames)) {
      inputPorts = cube.InputNames;
    } else {
      const inputNames = Object.keys(cube.InputsMapping || {});
      inputPorts = createPortsWithHash(inputNames);
    }

    // Для outputPorts: используем OutputNames (PortInfo[]) напрямую, если есть
    let outputPorts: PortInfo[];
    if (cube.OutputNames && Array.isArray(cube.OutputNames)) {
      outputPorts = cube.OutputNames;
    } else {
      outputPorts = [];
    }

    return {
      id: nodeId,
      label,
      cubeHash: cube.Hash,
      cubeId: cube.CubeID,
      baseCubeName,
      outputPorts,
      inputPorts,
      type: cube.CubeType,
      hasError,
      errorCode: hasError ? 'error' : undefined,
    };
  });

  // Маппинг от hash куба к nodeId
  const cubeHashToNodeId = new Map<string, string>();
  cubes.forEach((cube, index) => {
    const nodeId = cubeIndexToNodeId.get(index) || `cube_${cube.Hash}`;
    cubeHashToNodeId.set(cube.Hash, nodeId);
  });

  // Создаем edges из InputsMapping
  const edges: GraphEdge[] = [];

  cubes.forEach((cube, index) => {
    const targetNodeId = cubeIndexToNodeId.get(index) || cube.Name;
    const targetNode = nodes.find((n) => n.id === targetNodeId);
    if (!targetNode) return;

    const inputsMapping = cube.InputsMapping || {};

    Object.entries(inputsMapping).forEach(([inputPortHash, mapping]) => {
      // Пропускаем неполные маппинги
      if (inputPortHash.startsWith('pending_')) {
        return;
      }

      // Для RETRY проверяем RetryCubeHash или RetryCube (для обратной совместимости)
      if (mapping.Type === CubeType.RETRY) {
        if (!mapping.RetryCubeHash && !mapping.RetryCube) {
          return;
        }
      } else if (!mapping.OutputPortHash) {
        return;
      }

      let sourceNodeId: string;
      let outputPortHash: string;

      if (mapping.Type === CubeType.RESHARDER) {
        sourceNodeId = 'Resharder';
        outputPortHash = mapping.OutputPortHash || '';
      } else if (mapping.Type === CubeType.RETRY) {
        sourceNodeId = 'Retrier';
        // Используем RetryCubeHash если есть, иначе ищем по RetryCube
        // (имя) для обратной совместимости
        let retryCubeHash = mapping.RetryCubeHash;
        if (!retryCubeHash && mapping.RetryCube) {
          const retryCube = cubes.find(
            (c) =>
              c.Name === mapping.RetryCube && c.CubeType === CubeType.RETRY,
          );
          retryCubeHash = retryCube?.Hash;
        }
        outputPortHash = retryCubeHash ? `retrier_${retryCubeHash}` : '';
      } else if (mapping.OutputCubeHash) {
        const foundNodeId = cubeHashToNodeId.get(mapping.OutputCubeHash);
        if (!foundNodeId) {
          return;
        }
        sourceNodeId = foundNodeId;
        outputPortHash = mapping.OutputPortHash || '';
      } else {
        return;
      }

      // Находим входной порт по hash
      const inputPort = targetNode.inputPorts.find(
        (p) => p.hash === inputPortHash,
      );
      if (!inputPort) {
        return;
      }

      const edgeId = `edge_${generateHash(8)}`;

      edges.push({
        id: edgeId,
        source: sourceNodeId,
        outputPortHash,
        target: targetNodeId,
        inputPortHash: inputPort.hash,
        edgeType: 'default',
      });
    });
  });

  // Добавляем Resharder ноду
  if (shouldShowResharder) {
    nodes.push({
      id: 'Resharder',
      label: 'Resharder',
      outputPorts: resharderOutputPorts,
      inputPorts: [],
      type: CubeType.RESHARDER,
    });
  }

  // Добавляем Retrier ноду для retry кубов
  const retryCubes = cubes.filter((cube) => cube.CubeType === CubeType.RETRY);
  if (retryCubes.length > 0) {
    const retrierOutputPorts: PortInfo[] = retryCubes.map((cube) => ({
      name: cube.Name || `cube_${cube.Hash}`,
      hash: `retrier_${cube.Hash}`,
    }));

    nodes.push({
      id: 'Retrier',
      label: 'Retrier',
      outputPorts: retrierOutputPorts,
      inputPorts: [],
      type: CubeType.RETRIER,
    });
  }

  // Фильтруем edges с несуществующими портами
  const resharderNode = nodes.find((n) => n.id === 'Resharder');
  const resharderOutputHashSet = new Set(
    resharderNode?.outputPorts.map((p) => p.hash) || [],
  );

  const retrierNode = nodes.find((n) => n.id === 'Retrier');
  const retrierOutputHashSet = new Set(
    retrierNode?.outputPorts.map((p) => p.hash) || [],
  );

  const allCubeOutputHashSet = new Set<string>();
  nodes.forEach((node) => {
    if (node.type === CubeType.CUBE || node.type === CubeType.RETRY) {
      node.outputPorts.forEach((p) => allCubeOutputHashSet.add(p.hash));
    }
  });

  const filteredEdges = edges.filter((edge) => {
    if (edge.source === 'Resharder') {
      return resharderOutputHashSet.has(edge.outputPortHash);
    }
    if (edge.source === 'Retrier') {
      return retrierOutputHashSet.has(edge.outputPortHash);
    }
    return allCubeOutputHashSet.has(edge.outputPortHash);
  });

  return {
    nodes,
    edges: filteredEdges,
  };
}

// ============================================================================
// Вспомогательные функции
// ============================================================================

/**
 * Проверяет, является ли нода внешним источником данных (не куб)
 */
export function isExternalNode(nodeId: string, nodes: GraphNode[]): boolean {
  return !nodes.some((node) => node.id === nodeId);
}

/**
 * Получает все входящие edges для ноды
 */
export function getIncomingEdges(
  nodeId: string,
  edges: GraphEdge[],
): GraphEdge[] {
  return edges.filter((edge) => edge.target === nodeId);
}

/**
 * Получает все исходящие edges для ноды
 */
export function getOutgoingEdges(
  nodeId: string,
  edges: GraphEdge[],
): GraphEdge[] {
  return edges.filter((edge) => edge.source === nodeId);
}

/**
 * Находит все внешние источники данных (ноды, которые не являются кубами)
 */
export function findExternalSources(
  edges: GraphEdge[],
  nodes: GraphNode[],
): string[] {
  const externalSources = new Set<string>();

  edges.forEach((edge) => {
    if (isExternalNode(edge.source, nodes)) {
      externalSources.add(edge.source);
    }
  });

  return Array.from(externalSources);
}
