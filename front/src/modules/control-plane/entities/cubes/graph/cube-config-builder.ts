/**
 * Утилиты для построения cubeConfig (additional_information) из формы редактирования
 *
 * CubeConfig содержит:
 * - CubeTypeID: ID базового куба
 * - Name: имя куба
 * - InputNames: имена входных портов (для dynamic типа)
 * - Graph: данные layout графа (позиции узлов)
 */

import type { Node } from '@xyflow/react';

import {
  CubeIOType,
  type CubeConfig,
  type CubeConfigItem,
  type GraphLayoutData,
  type GraphNodePosition,
} from '../types';

/**
 * Данные куба из формы редактирования
 */
export interface EditFormCube {
  /** Уникальный hash куба */
  Hash: string;
  /** Имя куба */
  Name?: string;
  /** ID базового куба */
  CubeID?: number;
  /** Тип входных портов */
  InputType?: CubeIOType;
  /** Входные порты (для dynamic типа) */
  InputNames?: Array<{ name: string; hash: string }>;
}

/**
 * Создаёт элемент CubeConfigItem из данных куба формы
 *
 * @param cube - Данные куба из формы
 * @returns CubeConfigItem или null если данные невалидны
 */
export function createCubeConfigItem(
  cube: EditFormCube,
): CubeConfigItem | null {
  // Пропускаем кубы без CubeID, Name или Hash
  if (cube.CubeID === undefined || cube.CubeID === null) {
    return null;
  }

  if (!cube.Name || cube.Name.trim() === '') {
    return null;
  }

  if (!cube.Hash || cube.Hash.trim() === '') {
    return null;
  }

  const item: CubeConfigItem = {
    CubeTypeID: cube.CubeID,
    Name: cube.Name,
    Hash: cube.Hash,
  };

  // Добавляем InputNames только для dynamic типа
  if (cube.InputType === CubeIOType.DYNAMIC && Array.isArray(cube.InputNames)) {
    const inputNames = cube.InputNames.map((port) => port.name).filter(Boolean);
    if (inputNames.length > 0) {
      item.InputNames = inputNames;
    }
  }

  return item;
}

/**
 * Строит cubeConfig (additional_information) из массива кубов формы
 *
 * @param cubes - Массив кубов из формы редактирования
 * @returns CubeConfig объект
 *
 * @example
 * const cubeConfig = buildCubeConfig(cubesArray);
 * // { Cubes: [{ CubeTypeID: 10, Name: "Cube_ABC" }, ...] }
 */
export function buildCubeConfig(cubes: EditFormCube[]): CubeConfig {
  const cubeItems: CubeConfigItem[] = [];

  for (const cube of cubes) {
    const item = createCubeConfigItem(cube);
    if (item) {
      cubeItems.push(item);
    }
  }

  return {
    Cubes: cubeItems,
  };
}

/**
 * Сериализует cubeConfig в JSON строку
 *
 * @param cubeConfig - CubeConfig объект
 * @returns JSON строка
 */
export function stringifyCubeConfig(cubeConfig: CubeConfig): string {
  try {
    return JSON.stringify(cubeConfig);
  } catch {
    return '{"Cubes":[]}';
  }
}

/**
 * Строит cubeConfig JSON строку из массива кубов формы
 *
 * @param cubes - Массив кубов из формы редактирования
 * @returns JSON строка cubeConfig
 *
 * @example
 * const json = buildCubeConfigJson(cubesArray);
 * // '{"Cubes":[{"CubeTypeID":10,"Name":"Cube_ABC"},...]}'
 */
export function buildCubeConfigJson(cubes: EditFormCube[]): string {
  const config = buildCubeConfig(cubes);
  return stringifyCubeConfig(config);
}

/**
 * Извлекает позиции узлов из React Flow nodes
 *
 * @param nodes - Массив узлов React Flow
 * @returns GraphLayoutData с позициями узлов
 */
export function extractGraphLayout(nodes: Node[]): GraphLayoutData {
  const nodePositions: GraphNodePosition[] = [];

  for (const node of nodes) {
    // Получаем hash куба из data.cubeHash или из id (убираем префикс cube_)
    const cubeHash = node.data?.cubeHash || node.id.replace(/^cube_/, '');

    if (cubeHash && node.position) {
      nodePositions.push({
        hash: cubeHash as string,
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      });
    }
  }

  return {
    nodes: nodePositions,
  };
}

/**
 * Строит полный cubeConfig с данными кубов и графа (из React Flow nodes)
 *
 * @param cubes - Массив кубов из формы редактирования
 * @param nodes - Массив узлов React Flow (опционально)
 * @returns CubeConfig объект с Cubes и Graph
 */
export function buildFullCubeConfig(
  cubes: EditFormCube[],
  nodes?: Node[],
): CubeConfig {
  const config = buildCubeConfig(cubes);

  if (nodes && nodes.length > 0) {
    config.Graph = extractGraphLayout(nodes);
  }

  return config;
}

/**
 * Строит полный cubeConfig с данными кубов и позициями узлов
 *
 * @param cubes - Массив кубов из формы редактирования
 * @param nodePositions - Массив позиций узлов (опционально)
 * @returns CubeConfig объект с Cubes и Graph
 */
export function buildFullCubeConfigWithPositions(
  cubes: EditFormCube[],
  nodePositions?: GraphNodePosition[],
): CubeConfig {
  const config = buildCubeConfig(cubes);

  if (nodePositions && nodePositions.length > 0) {
    config.Graph = { nodes: nodePositions };
  }

  return config;
}

/**
 * Строит полный cubeConfig JSON с данными кубов и графа (из React Flow nodes)
 *
 * @param cubes - Массив кубов из формы редактирования
 * @param nodes - Массив узлов React Flow (опционально)
 * @returns JSON строка cubeConfig
 */
export function buildFullCubeConfigJson(
  cubes: EditFormCube[],
  nodes?: Node[],
): string {
  const config = buildFullCubeConfig(cubes, nodes);
  return stringifyCubeConfig(config);
}

/**
 * Строит полный cubeConfig JSON с данными кубов и позициями узлов
 *
 * @param cubes - Массив кубов из формы редактирования
 * @param nodePositions - Массив позиций узлов (опционально)
 * @returns JSON строка cubeConfig
 */
export function buildFullCubeConfigJsonWithPositions(
  cubes: EditFormCube[],
  nodePositions?: GraphNodePosition[],
): string {
  const config = buildFullCubeConfigWithPositions(cubes, nodePositions);
  return stringifyCubeConfig(config);
}
