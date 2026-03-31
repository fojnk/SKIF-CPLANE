/**
 * Утилиты для парсинга cubeConfig (additional_information)
 */

import type {
  CubeConfig,
  CubeConfigItem,
  GraphLayoutData,
  GraphNodePosition,
} from '../types';

import type { DebugCollector } from './debug-collector';

/**
 * Парсит JSON строку cubeConfig (additional_information)
 *
 * @param cubeConfigJson - JSON строка с информацией о кубах
 * @param debug - Опциональный коллектор debug информации
 * @returns Распарсенный CubeConfig или null при ошибке
 *
 * @example
 * const cubeConfig = parseCubeConfig('{"Cubes":[{"CubeTypeID":10,"Name":"Cube_OUTO"}]}');
 * // { Cubes: [{ CubeTypeID: 10, Name: "Cube_OUTO" }] }
 */
export function parseCubeConfig(
  cubeConfigJson: string,
  debug?: DebugCollector,
): CubeConfig | null {
  if (!cubeConfigJson || cubeConfigJson.trim() === '') {
    debug?.warning('parse_cube_config', 'cubeConfig is empty or undefined');
    return null;
  }

  try {
    const parsed = JSON.parse(cubeConfigJson);
    debug?.info('parse_cube_config', 'Successfully parsed cubeConfig', {
      cubesCount: parsed?.Cubes?.length ?? 0,
    });
    return parsed as CubeConfig;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    debug?.error('parse_cube_config', `Failed to parse cubeConfig JSON`, {
      error: errorMessage,
    });
    console.error('Failed to parse cubeConfig:', error);
    return null;
  }
}

/**
 * Создаёт Map для быстрого поиска CubeTypeID по имени куба
 *
 * @param cubeConfig - Распарсенный cubeConfig
 * @returns Map<CubeName, CubeTypeID>
 *
 * @example
 * const map = createCubeTypeIdMap(cubeConfig);
 * const cubeTypeId = map.get('Cube_OUTO'); // 10
 */
export function createCubeTypeIdMap(
  cubeConfig: CubeConfig | null,
): Map<string, number> {
  const map = new Map<string, number>();

  if (!cubeConfig?.Cubes) {
    return map;
  }

  cubeConfig.Cubes.forEach((cube) => {
    if (cube.Name && cube.CubeTypeID !== undefined) {
      map.set(cube.Name, cube.CubeTypeID);
    }
  });

  return map;
}

/**
 * Получает CubeTypeID по имени куба
 *
 * @param cubeName - Имя куба
 * @param cubeTypeIdMap - Map с CubeTypeID
 * @returns CubeTypeID или undefined если не найден
 */
export function getCubeTypeId(
  cubeName: string | undefined,
  cubeTypeIdMap: Map<string, number>,
): number | undefined {
  if (!cubeName) {
    return undefined;
  }
  return cubeTypeIdMap.get(cubeName);
}

/**
 * Получает все CubeConfigItem из cubeConfig
 *
 * @param cubeConfig - Распарсенный cubeConfig
 * @returns Массив CubeConfigItem
 */
export function getCubeConfigItems(
  cubeConfig: CubeConfig | null,
): CubeConfigItem[] {
  return cubeConfig?.Cubes ?? [];
}

/**
 * Получает данные layout графа из cubeConfig
 *
 * @param cubeConfig - Распарсенный cubeConfig
 * @returns GraphLayoutData или null если нет данных
 */
export function getGraphLayoutData(
  cubeConfig: CubeConfig | null,
): GraphLayoutData | null {
  return cubeConfig?.Graph ?? null;
}

/**
 * Получает позиции узлов графа из cubeConfig
 *
 * @param cubeConfig - Распарсенный cubeConfig
 * @returns Массив GraphNodePosition
 */
export function getGraphNodePositions(
  cubeConfig: CubeConfig | null,
): GraphNodePosition[] {
  return cubeConfig?.Graph?.nodes ?? [];
}

/**
 * Создаёт Map для быстрого поиска позиции узла по hash
 *
 * @param cubeConfig - Распарсенный cubeConfig
 * @returns Map<CubeHash, {x, y}>
 */
export function createNodePositionsMap(
  cubeConfig: CubeConfig | null,
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();

  const positions = getGraphNodePositions(cubeConfig);
  positions.forEach((pos) => {
    if (pos.hash) {
      map.set(pos.hash, { x: pos.x, y: pos.y });
    }
  });

  return map;
}
