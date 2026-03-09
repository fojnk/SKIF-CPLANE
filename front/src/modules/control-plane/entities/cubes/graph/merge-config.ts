/**
 * Утилиты для объединения основного config и cubeConfig
 *
 * Основная задача: взять Cubes из config (без CubeID) и добавить к ним
 * CubeID из cubeConfig (additional_information), связывая по имени куба (Name)
 */

import type {
  ConfigCube,
  CubeConfigItem,
  MergedConfig,
  MergedConfigCube,
  ParsedExperimentConfig,
} from '../types';

import type { DebugCollector } from './debug-collector';
import { getCubeConfigItems, parseCubeConfig } from './parse-cube-config';

/**
 * Парсит основной config пайплайна
 *
 * @param configJson - JSON строка с основным конфигом
 * @param debug - Опциональный коллектор debug информации
 * @returns Распарсенный config или пустой объект при ошибке
 */
export function parseExperimentConfig(
  configJson: string,
  debug?: DebugCollector,
): ParsedExperimentConfig | null {
  if (!configJson || configJson.trim() === '' || configJson === 'undefined') {
    debug?.warning('parse_config', 'Experiment config is empty or undefined');
    return null;
  }

  try {
    const parsed = JSON.parse(configJson) as ParsedExperimentConfig;
    const cubesCount = parsed?.Worker?.GraphConfig?.Cubes?.length ?? 0;
    debug?.info('parse_config', 'Successfully parsed experiment config', {
      cubesCount,
      hasResharder: !!parsed?.Resharder,
      hasResources: !!parsed?.Resources,
    });
    return parsed;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    debug?.error('parse_config', 'Failed to parse experiment config JSON', {
      error: errorMessage,
    });
    console.error('Failed to parse experiment config:', error);
    return null;
  }
}

/**
 * Объединяет куб из config с информацией из cubeConfig
 *
 * @param configCube - Куб из основного config
 * @param cubeTypeIdMap - Map с CubeTypeID по имени
 * @param cubeConfigItemsMap - Map с CubeConfigItem по имени (для InputNames)
 * @param debug - Опциональный коллектор debug информации
 * @returns Объединённый куб с CubeID и CubeConfigInputNames
 */
function mergeCube(
  configCube: ConfigCube,
  cubeConfigItemsMap: Map<string, CubeConfigItem>,
  debug?: DebugCollector,
): MergedConfigCube {
  const cubeName = configCube.Name;

  if (!cubeName) {
    debug?.error('merge_configs', 'Cube without Name in config', {
      cube: configCube,
    });
  }

  // Получаем CubeConfigItem из cubeConfig (для InputNames и CubeTypeID)
  const cubeConfigItem = cubeName
    ? cubeConfigItemsMap.get(cubeName)
    : undefined;

  // Проверяем наличие куба в cubeConfig и CubeTypeID
  let cubeTypeId: number | undefined;

  if (cubeName) {
    if (!cubeConfigItem) {
      // Куб не найден в cubesInfo
      debug?.error('merge_configs', `${cubeName} not found in cubesInfo`);
    } else if (
      cubeConfigItem.CubeTypeID === undefined ||
      cubeConfigItem.CubeTypeID === null
    ) {
      // Куб найден, но CubeTypeID не задан
      debug?.warning(
        'merge_configs',
        `${cubeName} has no CubeTypeID in cubesInfo`,
      );
    } else {
      cubeTypeId = cubeConfigItem.CubeTypeID;
    }
  }

  const cubeConfigInputNames = cubeConfigItem?.InputNames;

  return {
    ...configCube,
    // Добавляем CubeID из cubeConfig (CubeTypeID)
    CubeID: cubeTypeId,
    // Добавляем InputNames из cubeConfig
    CubeConfigInputNames: cubeConfigInputNames,
  };
}

/**
 * Объединяет основной config и cubeConfig
 *
 * Процесс:
 * 1. Парсим основной config и cubeConfig
 * 2. Создаём Map<CubeName, CubeTypeID> из cubeConfig
 * 3. Для каждого куба из config добавляем CubeID по имени
 *
 * @param configJson - JSON строка основного конфига
 * @param cubeConfigJson - JSON строка cubeConfig (additional_information)
 * @param debug - Опциональный коллектор debug информации
 * @returns Объединённая конфигурация с кубами, содержащими CubeID
 *
 * @example
 * const merged = mergeConfigs(config, cubeConfig);
 * merged.cubes[0].CubeID // CubeTypeID из cubeConfig
 */
export function mergeConfigs(
  configJson: string,
  cubeConfigJson: string,
  debug?: DebugCollector,
): MergedConfig | null {
  // Парсим основной config
  const parsedConfig = parseExperimentConfig(configJson, debug);

  if (!parsedConfig) {
    debug?.error('merge_configs', 'Cannot merge: experiment config is invalid');
    return null;
  }

  // Парсим cubeConfig
  const cubeConfig = parseCubeConfig(cubeConfigJson, debug);

  // Создаём Map для быстрого поиска CubeConfigItem по имени
  const cubeConfigItems = getCubeConfigItems(cubeConfig);
  const cubeConfigItemsMap = new Map<string, CubeConfigItem>();
  cubeConfigItems.forEach((item) => {
    if (item.Name) {
      cubeConfigItemsMap.set(item.Name, item);
    }
  });

  // Получаем кубы из config
  const configCubes = parsedConfig.Worker?.GraphConfig?.Cubes ?? [];

  // Объединяем каждый куб с информацией из cubeConfig
  const mergedCubes: MergedConfigCube[] = configCubes.map((cube) =>
    mergeCube(cube, cubeConfigItemsMap, debug),
  );

  // Проверяем кубы без CubeID
  const cubesWithoutId = mergedCubes.filter((c) => c.CubeID === undefined);
  if (cubesWithoutId.length > 0) {
    debug?.warning(
      'merge_configs',
      `${cubesWithoutId.length} cube(s) without CubeTypeID`,
      {
        cubeNames: cubesWithoutId.map((c) => c.Name),
      },
    );
  }

  debug?.info('merge_configs', 'Successfully merged configs', {
    totalCubes: mergedCubes.length,
    cubesWithId: mergedCubes.length - cubesWithoutId.length,
    cubesWithoutId: cubesWithoutId.length,
  });

  return {
    cubes: mergedCubes,
    originalConfig: parsedConfig,
  };
}

/**
 * Проверяет, есть ли у Resharder ресурсы в конфиге
 *
 * @param config - Распарсенный config
 * @returns true если есть Resources.Resharder
 */
export function hasResharderResources(
  config: ParsedExperimentConfig | null,
): boolean {
  if (!config?.Resources?.Resharder) return false;
  return Object.keys(config.Resources.Resharder).length > 0;
}

/**
 * Получает InputSources из Resharder конфига
 *
 * Приоритет имени: OutputName (если есть) > SourceName
 *
 * @param config - Распарсенный config
 * @returns Массив имён источников
 */
export function getResharderInputSources(
  config: ParsedExperimentConfig | null,
): string[] {
  if (!config?.Resharder?.InputSources) {
    return [];
  }

  return config.Resharder.InputSources.map((source) => {
    // Приоритет: OutputName > SourceName
    const outputName =
      typeof source.OutputName === 'string' ? source.OutputName.trim() : '';
    if (outputName) {
      return outputName;
    }
    return typeof source.SourceName === 'string' ? source.SourceName : '';
  }).filter(Boolean);
}
