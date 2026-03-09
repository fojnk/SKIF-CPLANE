import {
  generateHash,
  createExperimentCube,
  createPortsWithHash,
  CubeIOType,
  CubeType,
  type EditExperimentCube,
  type EditCubeInputMapping,
  type CubeWithId,
  type DroppedCube,
  type DroppedCubeOutputMapping,
  type DroppedMapping,
  parseCubeConfig,
  createCubeTypeIdMap,
  getCubeConfigItems,
  type CubeConfigItem,
} from '@/modules/stream-flow/entities/cubes';
import { getFormInitialValues } from '@/modules/stream-flow/shared/components/forms/utils';
import {
  CubeInfoDC,
  CubeListDC,
  ParamsDC,
} from '@/modules/stream-flow/shared/types';

/**
 * Генерирует уникальный hash для порта resharder
 */
const generatePortHash = (): string => {
  return `port_${generateHash(8)}`;
};

/**
 * Преобразует custom поля в JSON строки на основе схемы параметров
 * @param params - Значения параметров из конфига
 * @param schema - Схема параметров (args из cube_params)
 * @returns Преобразованные параметры с custom полями как JSON строками
 */
const transformCustomParams = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>,
  schema: ParamsDC[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> => {
  if (!params || !schema || schema.length === 0) {
    return params;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = { ...params };

  schema.forEach((paramSchema) => {
    const paramName = paramSchema.name;
    if (!paramName || !(paramName in result)) {
      return;
    }

    const paramType = paramSchema.type?.type;

    // Если тип custom — преобразуем значение в JSON строку
    if (paramType === 'custom') {
      const value = result[paramName];
      if (value !== undefined && value !== null && typeof value !== 'string') {
        try {
          result[paramName] = JSON.stringify(value, null, 2);
        } catch {
          result[paramName] = '';
        }
      }
    }
  });

  return result;
};

/**
 * Интерфейс для InputSource в форме (с portHash)
 */
export interface FormInputSource {
  SourceName: string;
  OutputName?: string;
  portHash: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Получает отображаемое имя порта Resharder
 * Приоритет: OutputName > SourceName
 */
export const getResharderPortDisplayName = (
  source: FormInputSource,
): string => {
  if (source.OutputName && source.OutputName.trim() !== '') {
    return source.OutputName;
  }
  return source.SourceName || '';
};

/**
 * Интерфейс для Resharder в форме
 */
export interface FormResharder {
  InputSources?: FormInputSource[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Интерфейс для GraphConfig в форме
 * Cubes хранятся как Record по hash для стабильной работы с формой
 */
export interface FormGraphConfig {
  Name?: string;
  Cubes?: Record<string, EditExperimentCube>;
  /** Кубы, которые не удалось распознать (без CubeID или не найдены в списке) */
  DroppedCubes?: DroppedCube[];
  /** Невалидные маппинги, которые были удалены при парсинге */
  DroppedMappings?: DroppedMapping[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Интерфейс для Worker в форме
 */
export interface FormWorker {
  GraphConfig?: FormGraphConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Интерфейс для значений формы experiment
 */
export interface ExperimentFormValues {
  Resharder?: FormResharder;
  Worker?: FormWorker;
  Resources?: {
    Resharder?: Record<string, unknown>;
    Worker?: Record<string, unknown>;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Инициализирует форму редактирования experiment
 * Форма является единственным источником истины (single source of truth)
 *
 * @param config - JSON строка с конфигурацией
 * @param cubeConfigJson - JSON строка cubeConfig (additional_information) с CubeTypeID и InputNames
 * @param formData - Параметры формы (схема)
 * @param cubesList - Список доступных кубов из API
 * @returns Объект с начальными значениями для формы
 */
export const initExperimentEditorValues = (
  config: string,
  cubeConfigJson: string,
  formData: ParamsDC[] | undefined,
  cubesList: CubeListDC[] | null,
): ExperimentFormValues => {
  if (!formData) {
    return {};
  }

  try {
    // Получаем базовые значения формы
    const initialValues = getFormInitialValues(
      config || '',
      formData,
    ) as ExperimentFormValues;

    // ========================================================================
    // Шаг 1: Обрабатываем Resharder.InputSources — добавляем portHash
    // Используем OutputName как ключ для маппинга (приоритет: OutputName > SourceName)
    // ========================================================================
    const resharder = initialValues.Resharder;
    const resharderPortNameToHash = new Map<string, string>();

    if (resharder && Array.isArray(resharder.InputSources)) {
      resharder.InputSources = resharder.InputSources.map(
        (source: FormInputSource) => {
          const portHash = generatePortHash();
          // Используем OutputName как ключ для маппинга (он уникален)
          // Fallback на SourceName для обратной совместимости
          const displayName = getResharderPortDisplayName(source);
          if (displayName) {
            resharderPortNameToHash.set(displayName, portHash);
          }
          return {
            ...source,
            portHash,
          };
        },
      );
    }

    // ========================================================================
    // Шаг 2: Парсим cubeConfig для получения CubeTypeID и InputNames
    // ========================================================================
    const cubeConfig = parseCubeConfig(cubeConfigJson);
    const cubeTypeIdMap = createCubeTypeIdMap(cubeConfig);
    const cubeConfigItems = getCubeConfigItems(cubeConfig);

    // Создаём Map для быстрого доступа к CubeConfigItem по имени
    const cubeConfigItemsMap = new Map<string, CubeConfigItem>();
    cubeConfigItems.forEach((item) => {
      if (item.Name) {
        cubeConfigItemsMap.set(item.Name, item);
      }
    });

    // ========================================================================
    // Шаг 3: Обрабатываем кубы — конвертируем в EditExperimentCube[]
    // ========================================================================
    if (!cubesList || cubesList.length === 0) {
      return initialValues;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any;
    try {
      parsed = config ? JSON.parse(config) : {};
    } catch {
      parsed = {};
    }

    const cubesArray = parsed?.Worker?.GraphConfig?.Cubes;
    if (!Array.isArray(cubesArray) || cubesArray.length === 0) {
      // Инициализируем пустой Record кубов
      if (!initialValues.Worker) {
        initialValues.Worker = {};
      }
      if (!initialValues.Worker.GraphConfig) {
        initialValues.Worker.GraphConfig = {};
      }
      initialValues.Worker.GraphConfig.Cubes = {};

      // Проверяем Worker.GraphConfig.Name — если пусто, генерируем Worker_hash4
      if (
        !initialValues.Worker.GraphConfig.Name ||
        (typeof initialValues.Worker.GraphConfig.Name === 'string' &&
          initialValues.Worker.GraphConfig.Name.trim() === '')
      ) {
        initialValues.Worker.GraphConfig.Name = `Worker_${generateHash(4)}`;
      }

      return initialValues;
    }

    const configCubes: CubeWithId[] = cubesArray;

    // Временное хранилище для кубов (сохраняем порядок для обработки InputsMapping)
    const cubesWithPorts: Array<{
      cube: EditExperimentCube;
      configCube: CubeWithId;
    }> = [];

    // Record для финального результата (по hash)
    const cubesRecord: Record<string, EditExperimentCube> = {};

    // Маппинг: имя куба → hash куба (для обычных кубов CIT_CUBE)
    const cubeNameToHash = new Map<string, string>();

    // Маппинг: имя куба → hash куба (только для RETRY кубов)
    const retryCubeNameToHash = new Map<string, string>();

    // Маппинг: hash куба → Map<имя выходного порта, hash порта>
    const cubeOutputPortNameToHash = new Map<string, Map<string, string>>();

    // Массив для dropped кубов (временный, без OutputMappings)
    const droppedCubesTemp: Array<{
      cube: DroppedCube;
      configCube: CubeWithId;
    }> = [];

    // Set имён dropped кубов для быстрого поиска
    const droppedCubeNames = new Set<string>();

    for (const configCube of configCubes) {
      // Получаем имя куба из конфига
      const cubeName = configCube.Name || '';

      // Получаем CubeID из cubeConfig по имени куба
      // (вместо config.CubeID теперь используем cubeConfig.CubeTypeID)
      const cubeId = cubeTypeIdMap.get(cubeName);

      // Если нет CubeID — добавляем в dropped
      if (cubeId === undefined) {
        const inputNames = Object.keys(configCube.InputsMapping || {});
        const outputNames = configCube.OutputNames || [];
        droppedCubeNames.add(cubeName);
        droppedCubesTemp.push({
          cube: {
            Name: cubeName || 'Unknown',
            reason: 'no_cube_type_id',
            InputNames: createPortsWithHash(inputNames),
            OutputNames: createPortsWithHash(outputNames),
            Params: configCube,
            CubeType: CubeType.CUBE,
          },
          configCube,
        });
        continue;
      }

      // Ищем куб с таким id в списке
      const baseCube = cubesList.find((c) => c.id === cubeId);
      if (!baseCube) {
        const inputNames = Object.keys(configCube.InputsMapping || {});
        const outputNames = configCube.OutputNames || [];
        droppedCubeNames.add(cubeName);
        droppedCubesTemp.push({
          cube: {
            Name: cubeName || 'Unknown',
            reason: 'cube_not_found_in_list',
            InputNames: createPortsWithHash(inputNames),
            OutputNames: createPortsWithHash(outputNames),
            Params: configCube,
            CubeType: CubeType.CUBE,
          },
          configCube,
        });
        continue;
      }

      // Создаем EditExperimentCube из базового куба
      const editCube = createExperimentCube(baseCube as CubeInfoDC);
      if (!editCube) {
        continue;
      }

      // Устанавливаем имя из конфига
      editCube.Name = cubeName || editCube.Name;

      // Загружаем Params из configCube по ключу ParamsName
      if (editCube.ParamsName && configCube[editCube.ParamsName]) {
        // Получаем схему параметров куба для преобразования custom полей
        let cubeParamsSchema: ParamsDC[] = [];
        if (editCube.CubeParams) {
          try {
            const parsed = JSON.parse(editCube.CubeParams);
            cubeParamsSchema = parsed?.args || [];
          } catch {
            cubeParamsSchema = [];
          }
        }

        // Преобразуем custom поля в JSON строки
        editCube.Params = transformCustomParams(
          configCube[editCube.ParamsName],
          cubeParamsSchema,
        );
      }

      // Сохраняем маппинг имя куба → hash куба
      // Для CIT_CUBE сохраняем в общий маппинг
      // Для CIT_RETRY сохраняем в отдельный маппинг для RETRY кубов
      cubeNameToHash.set(cubeName, editCube.Hash);
      if (editCube.CubeType === CubeType.RETRY) {
        retryCubeNameToHash.set(cubeName, editCube.Hash);
      }

      // Если OutputType dynamic - берем OutputNames из configCube
      if (editCube.OutputType === CubeIOType.DYNAMIC) {
        const outputNames = configCube.OutputNames ?? [];
        editCube.OutputNames = createPortsWithHash(outputNames);
      }

      // Если InputType dynamic - собираем входные порты из InputsMapping (config) + InputNames (cubeConfig)
      if (editCube.InputType === CubeIOType.DYNAMIC) {
        // 1. Берём все ключи из InputsMapping (из config)
        const inputsMappingKeys = Object.keys(configCube.InputsMapping || {});
        const allInputNames = new Set(inputsMappingKeys);

        // 2. Добавляем InputNames из cubeConfig (additional_information)
        const cubeConfigItem = cubeConfigItemsMap.get(cubeName);
        if (cubeConfigItem?.InputNames) {
          cubeConfigItem.InputNames.forEach((name: string) => {
            allInputNames.add(name);
          });
        }

        // 3. Создаём порты для всех найденных имён
        if (allInputNames.size > 0) {
          editCube.InputNames = createPortsWithHash(Array.from(allInputNames));
        } else {
          editCube.InputNames = [];
        }
      }

      // Сохраняем маппинг выходных портов: имя → hash
      const outputPortMap = new Map<string, string>(
        (editCube.OutputNames || []).map((port) => [port.name, port.hash]),
      );
      cubeOutputPortNameToHash.set(editCube.Hash, outputPortMap);

      // Пока сохраняем без InputsMapping
      editCube.InputsMapping = {};

      cubesWithPorts.push({ cube: editCube, configCube });
    }

    // ========================================================================
    // Шаг 3.5: Исправляем дубликаты имён кубов — добавляем суффикс _hash4
    // Первый куб с таким именем остаётся без изменений, остальные получают суффикс
    // ========================================================================
    // Считаем сколько раз встречается каждое имя
    const nameOccurrences = new Map<string, number>();
    for (const { cube } of cubesWithPorts) {
      const name = cube.Name;
      nameOccurrences.set(name, (nameOccurrences.get(name) || 0) + 1);
    }

    // Находим имена с дубликатами
    const duplicateNames = new Set<string>();
    nameOccurrences.forEach((count, name) => {
      if (count > 1) {
        duplicateNames.add(name);
      }
    });

    // Если есть дубликаты — исправляем имена, добавляя _hash4
    // Первый куб с таким именем остаётся без изменений
    if (duplicateNames.size > 0) {
      // Сбрасываем cubeNameToHash и retryCubeNameToHash для пересоздания
      cubeNameToHash.clear();
      retryCubeNameToHash.clear();

      // Отслеживаем какие имена уже были использованы (первый куб занимает имя)
      const usedOriginalNames = new Set<string>();

      for (const { cube } of cubesWithPorts) {
        const originalName = cube.Name;

        if (duplicateNames.has(originalName)) {
          if (usedOriginalNames.has(originalName)) {
            // Это дубликат — добавляем суффикс _hash4
            const hashSuffix = cube.Hash.substring(0, 4);
            cube.Name = `${originalName}_${hashSuffix}`;
          } else {
            // Это первый куб с таким именем — оставляем как есть
            usedOriginalNames.add(originalName);
          }
        }

        // Пересоздаём маппинги имя → hash
        cubeNameToHash.set(cube.Name, cube.Hash);
        if (cube.CubeType === CubeType.RETRY) {
          retryCubeNameToHash.set(cube.Name, cube.Hash);
        }
      }
    }

    // ========================================================================
    // Шаг 4: Проставляем InputsMapping с реальными hash
    // ========================================================================
    // Массив для невалидных маппингов
    const droppedMappings: DroppedMapping[] = [];

    for (const { cube, configCube } of cubesWithPorts) {
      const rawInputsMapping = configCube.InputsMapping || {};
      const resolvedInputsMapping: Record<string, EditCubeInputMapping> = {};

      // Маппинг входных портов куба: имя → hash
      const inputPortNameToHash = new Map<string, string>(
        (cube.InputNames || []).map((port) => [port.name, port.hash]),
      );

      for (const [inputPortName, mapping] of Object.entries(rawInputsMapping)) {
        // Получаем hash входного порта по имени
        const inputPortHash = inputPortNameToHash.get(inputPortName);
        if (!inputPortHash) {
          droppedMappings.push({
            cubeName: cube.Name,
            inputName: inputPortName,
            sourceType: String(mapping.Type),
            sourceCubeName: mapping.CubeName,
            sourceOutputName: mapping.OutputName,
            reason: 'Input port not found',
          });
          continue;
        }

        if (mapping.Type === CubeType.RESHARDER) {
          // Для RESHARDER: OutputName → hash порта resharder
          if (!mapping.OutputName) {
            droppedMappings.push({
              cubeName: cube.Name,
              inputName: inputPortName,
              sourceType: 'CIT_RESHARDER',
              sourceOutputName: mapping.OutputName,
              reason: 'Missing output name',
            });
            continue;
          }
          const outputPortHash = resharderPortNameToHash.get(
            mapping.OutputName,
          );
          if (!outputPortHash) {
            droppedMappings.push({
              cubeName: cube.Name,
              inputName: inputPortName,
              sourceType: 'CIT_RESHARDER',
              sourceOutputName: mapping.OutputName,
              reason: 'Resharder output not found',
            });
            continue;
          }

          resolvedInputsMapping[inputPortHash] = {
            Type: CubeType.RESHARDER,
            OutputPortHash: outputPortHash,
          };
        } else if (mapping.Type === CubeType.CUBE) {
          // Для CIT_CUBE: CubeName → hash куба, OutputName → hash порта куба
          const sourceCubeName = mapping.CubeName;
          if (!sourceCubeName) {
            droppedMappings.push({
              cubeName: cube.Name,
              inputName: inputPortName,
              sourceType: 'CIT_CUBE',
              sourceOutputName: mapping.OutputName,
              reason: 'Missing source cube name',
            });
            continue;
          }

          // Для CIT_CUBE ищем любой куб с таким именем
          const sourceCubeHash = cubeNameToHash.get(sourceCubeName);
          if (!sourceCubeHash) {
            droppedMappings.push({
              cubeName: cube.Name,
              inputName: inputPortName,
              sourceType: 'CIT_CUBE',
              sourceCubeName,
              sourceOutputName: mapping.OutputName,
              reason: 'Source cube not found',
            });
            continue;
          }

          const sourceOutputPorts =
            cubeOutputPortNameToHash.get(sourceCubeHash);
          if (!sourceOutputPorts) {
            droppedMappings.push({
              cubeName: cube.Name,
              inputName: inputPortName,
              sourceType: 'CIT_CUBE',
              sourceCubeName,
              sourceOutputName: mapping.OutputName,
              reason: 'Source cube has no outputs',
            });
            continue;
          }

          if (!mapping.OutputName) {
            droppedMappings.push({
              cubeName: cube.Name,
              inputName: inputPortName,
              sourceType: 'CIT_CUBE',
              sourceCubeName,
              reason: 'Missing output name',
            });
            continue;
          }
          const outputPortHash = sourceOutputPorts.get(mapping.OutputName);
          if (!outputPortHash) {
            droppedMappings.push({
              cubeName: cube.Name,
              inputName: inputPortName,
              sourceType: 'CIT_CUBE',
              sourceCubeName,
              sourceOutputName: mapping.OutputName,
              reason: 'Output port not found',
            });
            continue;
          }

          resolvedInputsMapping[inputPortHash] = {
            Type: mapping.Type,
            OutputPortHash: outputPortHash,
            OutputCubeHash: sourceCubeHash,
          };
        } else if (mapping.Type === CubeType.RETRY) {
          // Для CIT_RETRY: CubeName содержит имя retry куба
          // Преобразуем имя → hash для внутреннего хранения
          const sourceCubeName = mapping.CubeName;
          if (!sourceCubeName) {
            droppedMappings.push({
              cubeName: cube.Name,
              inputName: inputPortName,
              sourceType: 'CIT_RETRY',
              reason: 'Missing retry cube name',
            });
            continue;
          }

          // Ищем retry куб по имени и получаем его hash
          const retryCube = cubesWithPorts.find(
            (c) =>
              c.cube.Name === sourceCubeName &&
              c.cube.CubeType === CubeType.RETRY,
          );
          if (!retryCube) {
            droppedMappings.push({
              cubeName: cube.Name,
              inputName: inputPortName,
              sourceType: 'CIT_RETRY',
              sourceCubeName,
              reason: 'Retry cube not found',
            });
            continue;
          }

          resolvedInputsMapping[inputPortHash] = {
            Type: CubeType.RETRY,
            RetryCubeHash: retryCube.cube.Hash,
          };
        }
      }

      cube.InputsMapping = resolvedInputsMapping;
      // Добавляем в Record по hash
      cubesRecord[cube.Hash] = cube;
    }

    // ========================================================================
    // Шаг 5: Собираем OutputMappings для dropped кубов
    // ========================================================================
    // Проходим по всем кубам в конфиге и ищем те, которые ссылаются на dropped кубы
    const droppedCubeOutputMappings = new Map<
      string,
      DroppedCubeOutputMapping[]
    >();

    // Инициализируем пустые массивы для каждого dropped куба
    droppedCubeNames.forEach((name) => {
      droppedCubeOutputMappings.set(name, []);
    });

    // Проходим по всем кубам в конфиге
    for (const configCube of configCubes) {
      const targetCubeName = configCube.Name || '';
      const inputsMapping = configCube.InputsMapping || {};

      // Проверяем каждый input mapping
      Object.entries(inputsMapping).forEach(([inputName, mapping]) => {
        // Если тип CIT_CUBE и CubeName ссылается на dropped куб
        // Type может быть строкой 'CIT_CUBE' или enum CubeType.CUBE
        const mappingType = String(mapping.Type);
        const isCubeType =
          mappingType === 'CIT_CUBE' || mappingType === CubeType.CUBE;

        if (
          isCubeType &&
          mapping.CubeName &&
          droppedCubeNames.has(mapping.CubeName)
        ) {
          const outputMappings = droppedCubeOutputMappings.get(
            mapping.CubeName,
          );
          if (outputMappings) {
            outputMappings.push({
              outputName: mapping.OutputName || '?',
              targetCubeName,
              targetInputName: inputName,
            });
          }
        }
      });
    }

    // Собираем финальный массив dropped кубов с OutputMappings
    const droppedCubes: DroppedCube[] = droppedCubesTemp.map(({ cube }) => ({
      ...cube,
      OutputMappings: droppedCubeOutputMappings.get(cube.Name) || [],
    }));

    // ========================================================================
    // Шаг 6: Собираем InputsMapping от dropped кубов в droppedMappings
    // ========================================================================
    for (const { cube, configCube } of droppedCubesTemp) {
      const rawInputsMapping = configCube.InputsMapping || {};

      Object.entries(rawInputsMapping).forEach(([inputPortName, mapping]) => {
        const mappingType = String(mapping.Type);

        droppedMappings.push({
          cubeName: cube.Name,
          inputName: inputPortName,
          sourceType: mappingType,
          sourceCubeName: mapping.CubeName,
          sourceOutputName: mapping.OutputName,
          reason: `Cube «${cube.Name}» was dropped (${cube.reason})`,
        });
      });
    }

    // Сохраняем кубы в форму как Record
    if (!initialValues.Worker) {
      initialValues.Worker = {};
    }
    if (!initialValues.Worker.GraphConfig) {
      initialValues.Worker.GraphConfig = {};
    }
    initialValues.Worker.GraphConfig.Cubes = cubesRecord;
    initialValues.Worker.GraphConfig.DroppedCubes = droppedCubes;
    initialValues.Worker.GraphConfig.DroppedMappings = droppedMappings;

    // Проверяем Worker.GraphConfig.Name — если пусто, генерируем Worker_hash4
    if (
      !initialValues.Worker.GraphConfig.Name ||
      (typeof initialValues.Worker.GraphConfig.Name === 'string' &&
        initialValues.Worker.GraphConfig.Name.trim() === '')
    ) {
      initialValues.Worker.GraphConfig.Name = `Worker_${generateHash(4)}`;
    }

    return initialValues;
  } catch (error) {
    console.error('Failed to init experiment editor values:', error);
    return {};
  }
};

/**
 * @deprecated Используйте initExperimentEditorValues
 * Получает начальные значения для формы редактирования experiment
 */
export const getExperimentEditInitialValues = (
  config: string,
  formData: ParamsDC[] | undefined,
): Record<string, unknown> => {
  if (!formData) {
    return {};
  }

  try {
    const initialValues = getFormInitialValues(config || '', formData);

    const resharder = initialValues.Resharder as
      | Record<string, unknown>
      | undefined;
    if (resharder && Array.isArray(resharder.InputSources)) {
      resharder.InputSources = resharder.InputSources.map(
        (source: Record<string, unknown>) => ({
          ...source,
          portHash: generatePortHash(),
        }),
      );
    }

    return initialValues;
  } catch (error) {
    console.error('Failed to get experiment edit initial values:', error);
    return {};
  }
};

/**
 * Проверяет, есть ли параметр Worker в formData
 * @param formData - Параметры формы
 * @returns true если параметр Worker существует
 */
export const hasWorkerParam = (formData: ParamsDC[] | undefined): boolean => {
  if (!formData) return false;
  return formData.some((param) => param.name === 'Worker');
};

/**
 * Получает параметры Experiment (без Worker)
 * @param formData - Параметры формы
 * @returns Массив параметров без Worker
 */
export const getExperimentParams = (
  formData: ParamsDC[] | undefined,
): ParamsDC[] => {
  if (!formData) return [];
  return formData.filter((param) => param.name !== 'Worker');
};

/**
 * Получает параметр Worker и его вложенные параметры
 * @param formData - Параметры формы
 * @returns Параметр Worker или undefined
 */
export const getWorkerParam = (
  formData: ParamsDC[] | undefined,
): ParamsDC | undefined => {
  if (!formData) return undefined;
  return formData.find((param) => param.name === 'Worker');
};

/**
 * Получает вложенные параметры Worker с сортировкой
 * @param formData - Параметры формы
 * @returns Отсортированный массив параметров Worker (простые поля сначала, структуры потом)
 */
export const getWorkerStructParams = (
  formData: ParamsDC[] | undefined,
): ParamsDC[] => {
  const workerParam = getWorkerParam(formData);
  if (!workerParam) return [];

  const workerStructParams = workerParam.type?.struct_params || [];

  // Сортируем параметры: сначала простые поля, потом структуры
  return [...workerStructParams].sort((a, b) => {
    const aIsStruct = a.type?.type === 'struct';
    const bIsStruct = b.type?.type === 'struct';

    if (aIsStruct && !bIsStruct) return 1; // a после b
    if (!aIsStruct && bIsStruct) return -1; // a перед b
    return 0; // порядок не меняется
  });
};
