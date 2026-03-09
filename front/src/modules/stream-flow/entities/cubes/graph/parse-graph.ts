/**
 * Основная функция парсинга графа с использованием нового формата конфигурации
 *
 * CubeID берётся из cubeConfig (additional_information),
 * остальные данные куба — из основного config
 */

import { DtoCubeTypeDC } from '@/modules/stream-flow/shared/api/__generated__/data-contracts';
import type { CubeListDC } from '@/modules/stream-flow/shared/types';

import {
  CubeIOType,
  CubeType,
  MappingErrorType,
  type ConfigInputMapping,
  type GraphEdge,
  type GraphNode,
  type MappingError,
  type MergedConfigCube,
  type PortInfo,
  type ValidatedCubeData,
  type ValidatedInputMapping,
  type CubesGraphParamsWithDebug,
} from '../types';

import { createDebugCollector } from './debug-collector';
import {
  getResharderInputSources,
  hasResharderResources,
  mergeConfigs,
} from './merge-config';
import { createPortsWithHash, generateHash } from './utils';
import { validateInputNames, validateOutputNames } from './validate-ports';

// ============================================================================
// Вспомогательные типы
// ============================================================================

/** Внутренний тип куба с hash и портами */
interface ParsedCube {
  index: number;
  hash: string;
  name: string;
  cubeId: number;
  cubeType: CubeType;
  inputType: CubeIOType;
  outputType: CubeIOType;
  inputPorts: PortInfo[];
  outputPorts: PortInfo[];
  inputsMapping: Record<string, ConfigInputMapping>;
  hasError: boolean;
  paramsName?: string;
  paramsValues?: Record<string, unknown>;
}

// ============================================================================
// Вспомогательные функции
// ============================================================================

/**
 * Определяет тип куба (CUBE или RETRY) по CubeID из списка базовых кубов
 */
function getCubeTypeFromBaseCubes(
  cubeId: number,
  baseCubes: CubeListDC[],
): CubeType {
  const baseCube = baseCubes.find((c) => c.id === cubeId);
  if (!baseCube?.type) return CubeType.CUBE;
  return baseCube.type === DtoCubeTypeDC.Retry ? CubeType.RETRY : CubeType.CUBE;
}

// ============================================================================
// Основная функция парсинга
// ============================================================================

/**
 * Парсит конфигурацию графа с использованием нового формата
 *
 * @param config - JSON строка основного конфига пайплайна
 * @param cubeConfig - JSON строка cubeConfig (additional_information) с CubeTypeID
 * @param baseCubes - Список базовых кубов из API
 * @returns CubesGraphParamsWithDebug для построения графа (включает debug информацию)
 *
 * @example
 * const graphData = parseGraphConfig(config, cubeConfig, baseCubes);
 * // Теперь graphData содержит кубы с CubeID из cubeConfig и debug информацию
 */
export function parseGraphConfig(
  config: string,
  cubeConfig: string,
  baseCubes: CubeListDC[],
): CubesGraphParamsWithDebug | null {
  // Создаём коллектор debug информации
  const debug = createDebugCollector();

  // Объединяем config и cubeConfig
  const merged = mergeConfigs(config, cubeConfig, debug);

  if (!merged) {
    debug.error('build_graph', 'Cannot build graph: merged config is null');
    return null;
  }

  const { cubes: mergedCubes, originalConfig } = merged;

  // ========================================================================
  // Валидация Resharder
  // ========================================================================
  const resharderSourceNames = getResharderInputSources(originalConfig);
  const showResharder =
    resharderSourceNames.length > 0 || hasResharderResources(originalConfig);

  // Проверяем на дубликаты имён источников Resharder
  const resharderNameCount = new Map<string, number>();
  resharderSourceNames.forEach((name) => {
    resharderNameCount.set(name, (resharderNameCount.get(name) || 0) + 1);
  });

  const duplicateResharderNames: string[] = [];
  resharderNameCount.forEach((count, name) => {
    if (count > 1) {
      duplicateResharderNames.push(name);
      debug.error(
        'validate_resharder',
        `Duplicate Resharder source name «${name}» (${count} occurrences)`,
      );
    }
  });

  // Оставляем только уникальные имена для портов
  const uniqueResharderSourceNames = Array.from(new Set(resharderSourceNames));

  // Создаём порты Resharder (только уникальные)
  const resharderPorts: PortInfo[] = uniqueResharderSourceNames.map((name) => ({
    name,
    hash: `port_${generateHash(8)}`,
  }));

  // Логируем успешную валидацию Resharder
  debug.info('validate_resharder', 'Resharder validation completed', {
    totalSources: resharderSourceNames.length,
    uniqueSources: uniqueResharderSourceNames.length,
    duplicates: duplicateResharderNames.length,
    hasResources: hasResharderResources(originalConfig),
  });

  // ========================================================================
  // Парсим кубы
  // ========================================================================
  const parsedCubes: ParsedCube[] = [];
  const cubeNameToHash = new Map<string, string>();

  mergedCubes.forEach((cube: MergedConfigCube, index: number) => {
    const cubeHash = generateHash(8);

    if (cube.Name && !cubeNameToHash.has(cube.Name)) {
      cubeNameToHash.set(cube.Name, cubeHash);
    }

    const hasEmptyName = !cube.Name || cube.Name.trim() === '';

    if (hasEmptyName) {
      debug.error('validate_cubes', `Cube at index ${index} has empty name`);
    }

    // Если CubeID нет (ошибка уже залогирована в merge-config)
    // Всё равно пытаемся построить порты из доступных данных
    if (cube.CubeID === undefined || cube.CubeID === null) {
      // InputNames берём из ключей InputsMapping
      const inputsMappingKeys = Object.keys(cube.InputsMapping || {});
      const inputPorts = createPortsWithHash(inputsMappingKeys);

      // OutputNames берём напрямую из config (если есть)
      const outputNames = Array.isArray(cube.OutputNames)
        ? cube.OutputNames
        : [];
      const outputPorts = createPortsWithHash(outputNames);

      parsedCubes.push({
        index,
        hash: cubeHash,
        name: cube.Name || '',
        cubeId: 0,
        cubeType: CubeType.CUBE,
        inputType:
          inputPorts.length > 0 ? CubeIOType.DYNAMIC : CubeIOType.EMPTY,
        outputType:
          outputPorts.length > 0 ? CubeIOType.DYNAMIC : CubeIOType.EMPTY,
        inputPorts,
        outputPorts,
        inputsMapping: cube.InputsMapping || {},
        hasError: true,
      });
      return;
    }

    // Находим базовый куб по CubeID
    const baseCube = baseCubes.find((bc) => bc.id === cube.CubeID);

    if (!baseCube) {
      debug.warning(
        'validate_cubes',
        `Base cube with ID ${cube.CubeID} not found for "${cube.Name}"`,
      );
    }
    const cubeType = getCubeTypeFromBaseCubes(cube.CubeID, baseCubes);

    // Валидируем OutputNames с учётом типа из базового куба
    // - empty: игнорируем OutputNames из config
    // - static: берём из базового куба
    // - dynamic: берём из config и отсекаем дубли
    const { outputType, outputNames: validatedOutputNames } =
      validateOutputNames(baseCube?.cube_params, cube.OutputNames);

    // Валидируем InputNames с учётом типа из базового куба
    // - empty: игнорируем все InputNames
    // - static: берём из базового куба
    // - dynamic: объединяем ключи из InputsMapping (config) и InputNames из cubeConfig
    const inputsMappingKeys = Object.keys(cube.InputsMapping || {});
    const { inputType, inputNames: validatedInputNames } = validateInputNames(
      baseCube?.cube_params,
      inputsMappingKeys,
      cube.CubeConfigInputNames,
    );

    // Создаём порты
    let inputPorts: PortInfo[] = [];
    let outputPorts: PortInfo[] = [];

    // InputPorts: используем валидированные InputNames
    if (validatedInputNames.length > 0) {
      inputPorts = createPortsWithHash(validatedInputNames);
    }

    // OutputPorts: используем валидированные OutputNames
    if (validatedOutputNames.length > 0) {
      outputPorts = createPortsWithHash(validatedOutputNames);
    }

    const hasError = hasEmptyName;
    const paramsName = baseCube?.params_name;
    const paramsValues =
      paramsName && cube[paramsName] && typeof cube[paramsName] === 'object'
        ? (cube[paramsName] as Record<string, unknown>)
        : undefined;

    parsedCubes.push({
      index,
      hash: cubeHash,
      name: cube.Name || '',
      cubeId: cube.CubeID,
      cubeType,
      inputType,
      outputType,
      inputPorts,
      outputPorts,
      inputsMapping: cube.InputsMapping || {},
      hasError,
      paramsName,
      paramsValues,
    });
  });

  // Проверяем дубликаты имён
  const nameCount = new Map<string, number>();
  parsedCubes.forEach((cube) => {
    if (cube.name) {
      nameCount.set(cube.name, (nameCount.get(cube.name) || 0) + 1);
    }
  });

  const duplicateNames = new Set<string>();
  nameCount.forEach((count, name) => {
    if (count > 1) {
      duplicateNames.add(name);
      debug.error(
        'validate_cubes',
        `«${name}» - duplicate cube name (${count} occurrences)`,
      );
    }
  });

  // Считаем кубы с ошибками (без CubeID или с пустым именем)
  const cubesWithErrors = parsedCubes.filter(
    (c) => c.cubeId === 0 || !c.name || c.name.trim() === '',
  ).length;

  // Логируем результат валидации кубов
  debug.info('validate_cubes', 'Cubes validation completed', {
    totalCubes: parsedCubes.length,
    duplicateNames: duplicateNames.size,
    cubesWithoutId: parsedCubes.filter((c) => c.cubeId === 0).length,
    cubesWithEmptyName: parsedCubes.filter(
      (c) => !c.name || c.name.trim() === '',
    ).length,
    cubesWithErrors,
  });

  // ========================================================================
  // Валидация маппингов
  // ========================================================================
  const cubeMappingErrors = new Map<string, boolean>();
  let totalMappings = 0;
  let invalidMappings = 0;

  parsedCubes.forEach((cube) => {
    if (cube.cubeId === 0) {
      cubeMappingErrors.set(cube.hash, false);
      return;
    }

    let hasMappingErrors = false;

    Object.entries(cube.inputsMapping).forEach(([inputName, mapping]) => {
      totalMappings++;

      const hasInputPort = cube.inputPorts.some((p) => p.name === inputName);
      if (!hasInputPort) {
        hasMappingErrors = true;
        invalidMappings++;
        debug.error(
          'validate_mappings',
          `${cube.name} - invalid input «${inputName}»`,
        );
        return;
      }

      if (mapping.Type === 'CIT_RESHARDER') {
        const hasOutputPort = resharderPorts.some(
          (p) => p.name === mapping.OutputName,
        );
        if (!hasOutputPort && mapping.OutputName) {
          hasMappingErrors = true;
          invalidMappings++;
          debug.error(
            'validate_mappings',
            `${cube.name} - invalid resharder output «${mapping.OutputName}» for input «${inputName}»`,
          );
        }
      } else if (mapping.Type === 'CIT_CUBE') {
        if (!mapping.CubeName) {
          hasMappingErrors = true;
          invalidMappings++;
          debug.error(
            'validate_mappings',
            `${cube.name} - missing source cube name for input «${inputName}»`,
          );
        } else {
          const matchingCubes = parsedCubes.filter(
            (c) => c.name === mapping.CubeName,
          );
          if (matchingCubes.length === 0) {
            hasMappingErrors = true;
            invalidMappings++;
            debug.error(
              'validate_mappings',
              `${cube.name} - source cube «${mapping.CubeName}» not found for input «${inputName}»`,
            );
          } else {
            let foundOutputPort = false;
            for (const sourceCube of matchingCubes) {
              if (
                sourceCube.outputPorts.some(
                  (p) => p.name === mapping.OutputName,
                )
              ) {
                foundOutputPort = true;
                break;
              }
            }
            if (!foundOutputPort && mapping.OutputName) {
              hasMappingErrors = true;
              invalidMappings++;
              debug.error(
                'validate_mappings',
                `${cube.name} - invalid output «${mapping.OutputName}» from cube «${mapping.CubeName}» for input «${inputName}»`,
              );
            }
          }
        }
      } else if (mapping.Type === 'CIT_RETRY') {
        if (!mapping.CubeName) {
          hasMappingErrors = true;
          invalidMappings++;
          debug.error(
            'validate_mappings',
            `${cube.name} - missing retry cube name for input «${inputName}»`,
          );
        } else {
          // Сначала проверяем, существует ли куб с таким именем
          const cubeByName = parsedCubes.find(
            (c) => c.name === mapping.CubeName,
          );
          if (!cubeByName) {
            hasMappingErrors = true;
            invalidMappings++;
            debug.error(
              'validate_mappings',
              `${cube.name} - cube «${mapping.CubeName}» not found for input «${inputName}»`,
            );
          } else if (cubeByName.cubeType !== CubeType.RETRY) {
            // Куб существует, но его тип не RETRY
            hasMappingErrors = true;
            invalidMappings++;
            debug.error(
              'validate_mappings',
              `${cube.name} - CIT_RETRY requires RETRY cube, but «${mapping.CubeName}» is not a RETRY cube`,
            );
          }
        }
      }
    });

    cubeMappingErrors.set(cube.hash, hasMappingErrors);
  });

  // Логируем результат валидации маппингов
  debug.info('validate_mappings', 'Mappings validation completed', {
    totalMappings,
    validMappings: totalMappings - invalidMappings,
    invalidMappings,
  });

  // ========================================================================
  // Создаём GraphNode[]
  // ========================================================================
  const nodes: GraphNode[] = [];

  parsedCubes.forEach((cube) => {
    const hasDuplicateName = cube.name ? duplicateNames.has(cube.name) : false;
    const hasMappingErrors = cubeMappingErrors.get(cube.hash) || false;

    // id всегда в формате cube_HASH8
    const nodeId = `cube_${cube.hash}`;
    // label - имя куба для отображения
    const label = cube.name || nodeId;

    const hasError = cube.hasError || hasDuplicateName || hasMappingErrors;

    // Получаем имя базового куба из baseCubes, если cubeId доступен
    const baseCube =
      cube.cubeId && cube.cubeId > 0
        ? baseCubes.find((bc) => bc.id === cube.cubeId)
        : undefined;
    const baseCubeName = baseCube?.name;

    nodes.push({
      id: nodeId,
      label,
      cubeHash: cube.hash,
      cubeId: cube.cubeId > 0 ? cube.cubeId : undefined,
      baseCubeName,
      inputPorts: cube.inputPorts,
      outputPorts: cube.outputPorts,
      type: cube.cubeType,
      hasError,
      errorCode: hasError ? 'error' : undefined,
    });
  });

  // Добавляем Resharder
  if (showResharder) {
    nodes.push({
      id: 'Resharder',
      label: 'Resharder',
      inputPorts: [],
      outputPorts: resharderPorts,
      type: CubeType.RESHARDER,
    });
  }

  // Добавляем Retrier для retry кубов
  const retryCubes = parsedCubes.filter(
    (cube) => cube.cubeType === CubeType.RETRY,
  );
  if (retryCubes.length > 0) {
    const retrierOutputPorts: PortInfo[] = retryCubes.map((cube) => ({
      name: cube.name || `cube_${cube.hash}`,
      hash: `retrier_${cube.hash}`,
    }));

    nodes.push({
      id: 'Retrier',
      label: 'Retrier',
      inputPorts: [],
      outputPorts: retrierOutputPorts,
      type: CubeType.RETRIER,
    });
  }

  // ========================================================================
  // Создаём GraphEdge[]
  // ========================================================================
  const edges: GraphEdge[] = [];

  const resharderPortByName = new Map<string, PortInfo>();
  resharderPorts.forEach((port) => {
    resharderPortByName.set(port.name, port);
  });

  const resharderNode = nodes.find((n) => n.id === 'Resharder');

  parsedCubes.forEach((cube) => {
    const targetNode = nodes.find((n) => n.cubeHash === cube.hash);
    if (!targetNode) return;

    Object.entries(cube.inputsMapping).forEach(([inputName, mapping]) => {
      const inputPort = targetNode.inputPorts.find((p) => p.name === inputName);
      if (!inputPort) return;

      let sourceNodeId: string | undefined;
      let outputPort: PortInfo | undefined;

      if (mapping.Type === 'CIT_RESHARDER') {
        if (!resharderNode || !mapping.OutputName) return;
        outputPort = resharderPortByName.get(mapping.OutputName);
        if (!outputPort) return;
        sourceNodeId = 'Resharder';
      } else if (mapping.Type === 'CIT_CUBE') {
        if (!mapping.CubeName) return;

        const matchingCubes = parsedCubes.filter(
          (c) => c.name === mapping.CubeName,
        );
        if (matchingCubes.length === 0) return;

        for (const sourceCube of matchingCubes) {
          const sourceNode = nodes.find((n) => n.cubeHash === sourceCube.hash);
          if (!sourceNode) continue;

          const foundPort = sourceNode.outputPorts.find(
            (p) => p.name === mapping.OutputName,
          );
          if (foundPort) {
            sourceNodeId = sourceNode.id;
            outputPort = foundPort;
            break;
          }
        }

        if (!sourceNodeId || !outputPort) return;
      } else if (mapping.Type === 'CIT_RETRY') {
        if (!mapping.CubeName) return;

        // Для CIT_RETRY edge идёт от Retrier, а не от retry куба напрямую
        const retrierNode = nodes.find((n) => n.id === 'Retrier');
        if (!retrierNode) return;

        // Находим retry куб по имени
        const matchingRetryCube = parsedCubes.find(
          (c) => c.name === mapping.CubeName && c.cubeType === CubeType.RETRY,
        );
        if (!matchingRetryCube) return;

        // Порт на Retrier имеет формат retrier_{cubeHash}
        const retrierPortHash = `retrier_${matchingRetryCube.hash}`;
        const retrierPort = retrierNode.outputPorts.find(
          (p) => p.hash === retrierPortHash,
        );
        if (!retrierPort) return;

        sourceNodeId = 'Retrier';
        outputPort = retrierPort;
      } else {
        return;
      }

      const edgeId = `edge_${generateHash(8)}`;

      edges.push({
        id: edgeId,
        source: sourceNodeId,
        outputPortHash: outputPort.hash,
        target: targetNode.id,
        inputPortHash: inputPort.hash,
        edgeType: 'default',
      });
    });
  });

  // ========================================================================
  // Создаём validatedCubes
  // ========================================================================
  const validatedCubes: ValidatedCubeData[] = parsedCubes.map((cube) => {
    const validatedMappings: ValidatedInputMapping[] = [];

    if (cube.cubeId !== 0) {
      Object.entries(cube.inputsMapping).forEach(([inputName, mapping]) => {
        const errors: MappingError[] = [];
        let sourceName = '';
        const outputPortName = mapping.OutputName || '';
        let mappingType: CubeType = CubeType.CUBE;

        const hasInputPort = cube.inputPorts.some((p) => p.name === inputName);
        if (!hasInputPort) {
          errors.push({
            type: MappingErrorType.INVALID_INPUT,
            name: inputName,
          });
        }

        if (mapping.Type === 'CIT_RESHARDER') {
          mappingType = CubeType.RESHARDER;
          sourceName = 'Resharder';

          const hasOutputPort = resharderPorts.some(
            (p) => p.name === mapping.OutputName,
          );
          if (!hasOutputPort && mapping.OutputName) {
            errors.push({
              type: MappingErrorType.INVALID_OUTPUT,
              name: mapping.OutputName,
              inputPortName: inputName,
              sourceName: 'Resharder',
            });
          }
        } else if (mapping.Type === 'CIT_CUBE') {
          mappingType = CubeType.CUBE;
          sourceName = mapping.CubeName || '';

          if (mapping.CubeName) {
            const matchingCubes = parsedCubes.filter(
              (c) => c.name === mapping.CubeName,
            );

            if (matchingCubes.length === 0) {
              errors.push({
                type: MappingErrorType.CUBE_NOT_FOUND,
                name: mapping.CubeName,
                inputPortName: inputName,
              });
            } else {
              let foundOutputPort = false;
              for (const sourceCube of matchingCubes) {
                if (
                  sourceCube.outputPorts.some(
                    (p) => p.name === mapping.OutputName,
                  )
                ) {
                  foundOutputPort = true;
                  break;
                }
              }
              if (!foundOutputPort && mapping.OutputName) {
                errors.push({
                  type: MappingErrorType.INVALID_OUTPUT,
                  name: mapping.OutputName,
                  inputPortName: inputName,
                  sourceName: mapping.CubeName,
                });
              }
            }
          } else {
            errors.push({
              type: MappingErrorType.MISSING_CUBE_NAME,
              name: inputName,
              inputPortName: inputName,
            });
          }
        } else if (mapping.Type === 'CIT_RETRY') {
          mappingType = CubeType.RETRY;
          sourceName = mapping.CubeName || '';

          if (mapping.CubeName) {
            // Сначала проверяем, существует ли куб с таким именем
            const cubeByName = parsedCubes.find(
              (c) => c.name === mapping.CubeName,
            );

            if (!cubeByName) {
              errors.push({
                type: MappingErrorType.CUBE_NOT_FOUND,
                name: mapping.CubeName,
                inputPortName: inputName,
              });
            } else if (cubeByName.cubeType !== CubeType.RETRY) {
              // Куб существует, но его тип не RETRY
              errors.push({
                type: MappingErrorType.INVALID_CUBE_TYPE,
                name: mapping.CubeName,
                inputPortName: inputName,
              });
            }
          } else {
            errors.push({
              type: MappingErrorType.MISSING_CUBE_NAME,
              name: inputName,
              inputPortName: inputName,
            });
          }
        }

        validatedMappings.push({
          inputPortName: inputName,
          type: mappingType,
          sourceName,
          outputPortName,
          isValid: errors.length === 0,
          errors,
        });
      });
    }

    const hasMappingErrors = validatedMappings.some((m) => !m.isValid);
    const hasDuplicateName = duplicateNames.has(cube.name);

    return {
      index: cube.index,
      hash: cube.hash,
      name: cube.name,
      cubeId: cube.cubeId,
      cubeType: cube.cubeType,
      inputType: cube.inputType,
      outputType: cube.outputType,
      inputNames: cube.inputPorts.map((p) => p.name),
      outputNames: cube.outputPorts.map((p) => p.name),
      validatedMappings,
      hasError: cube.hasError || hasDuplicateName || hasMappingErrors,
      hasDuplicateName,
      paramsName: cube.paramsName,
      paramsValues: cube.paramsValues,
    };
  });

  // Добавляем итоговую информацию о построении графа
  debug.info('build_graph', 'Graph built successfully', {
    nodesCount: nodes.length,
    edgesCount: edges.length,
    cubesCount: validatedCubes.length,
    cubesWithErrors: validatedCubes.filter((c) => c.hasError).length,
  });

  return {
    nodes,
    edges,
    validatedCubes,
    debug: debug.getResult(),
  };
}
