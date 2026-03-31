import {
  ChevronDown,
  ChevronUp,
  NodesRight,
  TriangleExclamation,
} from '@gravity-ui/icons';
import {
  Button,
  Flex,
  Icon,
  Select,
  Tab,
  TabList,
  TabProvider,
  Text,
  TextInput,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm, useFormState } from 'react-final-form';

import {
  buildGraphFromCubes,
  CubeIOType,
  CubeType,
  createDebugCollector,
  createExperimentCube,
  type DroppedCube,
  type DroppedMapping,
  type EditCubeInputMapping,
  type EditExperimentCube,
  type ParseDebugInfo,
  type PortInfo,
  generateHash,
} from '@/modules/control-plane/entities/cubes';
import { CubesDebuggerModel } from '@/modules/control-plane/features/cubes/debugger';
import { ShowCubesMarketModel } from '@/modules/control-plane/features/cubes/market';
import { ActionConfirmModel } from '@/modules/control-plane/features/dialogs';
import { editorPageModel } from '@/modules/control-plane/pages/editor';
import {
  CubeBaseInfo,
  CubeDisclosure,
  CubeUnknownViewer,
} from '@/modules/control-plane/shared/components/cubes';
import {
  AddButton,
  DeleteButton,
  FormParamEdit,
  ValueText,
} from '@/modules/control-plane/shared/components/forms';
import {
  CubeInfoDC,
  CubeListDC,
  ParamsDC,
} from '@/modules/control-plane/shared/types';

import type { ExperimentFormValues } from './utils';

// Тип для обновлений куба
interface CubeUpdates {
  Name?: string;
  InputsMapping?: EditExperimentCube['InputsMapping'];
  OutputNames?: PortInfo[];
  InputNames?: PortInfo[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Params?: Record<string, any>;
}

// ============================================================================
// Компонент для редактирования динамического массива портов (PortInfo[])
// ============================================================================

interface DynamicArrayEditProps {
  values: PortInfo[];
  onChange: (values: PortInfo[]) => void;
  onRemove?: (removedPort: PortInfo) => void;
  addButtonLabel?: string;
  defaultValuePrefix?: string;
}

const DynamicArrayEdit: React.FC<DynamicArrayEditProps> = ({
  values,
  onChange,
  onRemove,
  addButtonLabel = 'Add',
  defaultValuePrefix = 'Item',
}) => {
  // Защита от некорректных данных: если values не массив, используем пустой массив
  const safeValues = useMemo(
    () => (Array.isArray(values) ? values : []),
    [values],
  );

  // Проверка на дубликаты — возвращает Set с именами, которые дублируются
  const duplicateNames = useMemo(() => {
    const nameCount = new Map<string, number>();
    safeValues.forEach((port) => {
      const name = port.name.trim();
      if (name) {
        nameCount.set(name, (nameCount.get(name) || 0) + 1);
      }
    });
    const duplicates = new Set<string>();
    nameCount.forEach((count, name) => {
      if (count > 1) {
        duplicates.add(name);
      }
    });
    return duplicates;
  }, [safeValues]);

  const handleAdd = () => {
    const newPortName = `${defaultValuePrefix}_${generateHash(4)}`;
    const newPort: PortInfo = {
      name: newPortName,
      hash: `port_${generateHash(24)}`, // Генерируем уникальный hash для порта
    };
    onChange([...safeValues, newPort]);
  };

  const handleRemove = (index: number) => {
    const removedPort = safeValues[index];
    onChange(safeValues.filter((_, i) => i !== index));
    // Вызываем callback для очистки связанных данных
    if (onRemove && removedPort) {
      onRemove(removedPort);
    }
  };

  const handleChange = (index: number, newName: string) => {
    const newValues = [...safeValues];
    // Сохраняем hash, меняем только name
    newValues[index] = { ...newValues[index], name: newName };
    onChange(newValues);
  };

  // Обработчик потери фокуса — автоисправление пустых и дублирующихся имён
  const handleBlur = (index: number) => {
    const port = safeValues[index];
    const trimmedName = port.name.trim();
    const hash4 = port.hash.substring(port.hash.length - 4);

    // Если имя пустое — генерируем defaultValuePrefix_hash4
    if (!trimmedName) {
      const generatedName = `${defaultValuePrefix}_${hash4}`;
      const newValues = [...safeValues];
      newValues[index] = { ...port, name: generatedName };
      onChange(newValues);
      return;
    }

    // Проверяем на дубликаты среди других элементов
    const isDuplicate = safeValues.some(
      (p, i) => i !== index && p.name.trim() === trimmedName,
    );

    if (isDuplicate) {
      // Добавляем _hash4 к имени
      const uniqueName = `${trimmedName}_${hash4}`;
      const newValues = [...safeValues];
      newValues[index] = { ...port, name: uniqueName };
      onChange(newValues);
    }
  };

  // Получение состояния валидации для конкретного элемента
  const getValidationState = (port: PortInfo): 'invalid' | undefined => {
    const name = port.name.trim();
    if (!name) return 'invalid';
    if (duplicateNames.has(name)) return 'invalid';
    return undefined;
  };

  // Получение сообщения об ошибке для конкретного элемента
  const getErrorMessage = (port: PortInfo): string | undefined => {
    const name = port.name.trim();
    if (!name) return 'Name is required';
    if (duplicateNames.has(name)) return 'Name must be unique';
    return undefined;
  };

  return (
    <Flex direction="column" gap={2}>
      {safeValues.map((port, index) => (
        <Flex key={port.hash} gap={1} alignItems="center">
          <TextInput
            value={port.name}
            onUpdate={(val) => handleChange(index, val)}
            onBlur={() => handleBlur(index)}
            size="m"
            style={{ flex: 1 }}
            validationState={getValidationState(port)}
            errorMessage={getErrorMessage(port)}
          />
          <DeleteButton onClick={() => handleRemove(index)} size="m" />
        </Flex>
      ))}
      <AddButton onClick={handleAdd} variant="normal">
        {addButtonLabel}
      </AddButton>
    </Flex>
  );
};

// ============================================================================
// Компонент для отображения InputNames/OutputNames в зависимости от типа
// ============================================================================

interface NamesFieldProps {
  label: string;
  type: CubeIOType;
  names: PortInfo[];
  onNamesChange?: (names: PortInfo[]) => void;
  onPortRemove?: (removedPort: PortInfo) => void;
  addButtonLabel?: string;
  defaultValuePrefix?: string;
}

const NamesField: React.FC<NamesFieldProps> = ({
  label,
  type,
  names,
  onNamesChange,
  onPortRemove,
  addButtonLabel,
  defaultValuePrefix,
}) => {
  // Защита от некорректных данных: если names не массив, используем пустой массив
  const safeNames = Array.isArray(names) ? names : [];

  // Определяем цвет текста в зависимости от типа
  const getTypeColor = (): 'secondary' | 'positive' | 'warning' => {
    switch (type) {
      case CubeIOType.STATIC:
        return 'positive';
      case CubeIOType.DYNAMIC:
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Empty - просто показываем label и тип
  if (type === CubeIOType.EMPTY) {
    return (
      <Flex direction="row" gap={2} alignItems="center">
        <Text variant="body-1" style={{ fontWeight: 600 }}>
          {label}:
        </Text>
        <Text variant="body-1" color={getTypeColor()}>
          {type}
        </Text>
      </Flex>
    );
  }

  // Static - показываем label и список значений (только чтение)
  if (type === CubeIOType.STATIC) {
    return (
      <Flex direction="column" gap={1}>
        <Flex direction="row" gap={2} alignItems="center">
          <Text variant="body-1" style={{ fontWeight: 600 }}>
            {label}:
          </Text>
          <Text variant="body-1" color={getTypeColor()}>
            {type}
          </Text>
        </Flex>
        {safeNames.length === 0 ? (
          <Text variant="body-1" color="secondary">
            no items
          </Text>
        ) : (
          <Flex direction="row" gap={1} style={{ flexWrap: 'wrap' }}>
            {safeNames.map((port) => (
              <ValueText key={port.hash} value={port.name} />
            ))}
          </Flex>
        )}
      </Flex>
    );
  }

  // Dynamic - показываем label и редактируемый список
  if (type === CubeIOType.DYNAMIC) {
    return (
      <Flex direction="column" gap={1}>
        <Flex direction="row" gap={2} alignItems="center">
          <Text variant="body-1" style={{ fontWeight: 600 }}>
            {label}:
          </Text>
          <Text variant="body-1" color={getTypeColor()}>
            {type}
          </Text>
        </Flex>
        <DynamicArrayEdit
          values={safeNames}
          onChange={onNamesChange || (() => {})}
          onRemove={onPortRemove}
          addButtonLabel={addButtonLabel}
          defaultValuePrefix={defaultValuePrefix}
        />
      </Flex>
    );
  }

  return null;
};

// ============================================================================
// Компонент для редактирования InputsMapping
// ============================================================================

interface InputsMappingEditProps {
  inputsMapping: Record<string, EditCubeInputMapping>;
  inputPorts: PortInfo[];
  availableCubes: EditExperimentCube[];
  resharderInputSources: PortInfo[];
  onInputsMappingChange: (
    mapping: Record<string, EditCubeInputMapping>,
  ) => void;
}

const InputsMappingEdit: React.FC<InputsMappingEditProps> = ({
  inputsMapping,
  inputPorts,
  availableCubes,
  resharderInputSources,
  onInputsMappingChange,
}) => {
  // RETRY кубы — для отображения Retrier (агрегирующий узел)
  const retryCubes = availableCubes.filter(
    (cube) => cube.CubeType === CubeType.RETRY,
  );

  // Проверяем наличие источников данных
  const hasResharderSources = resharderInputSources.length > 0;
  // Все кубы с output портами (включая RETRY) доступны для CIT_CUBE маппинга
  const hasCubesWithOutputs = availableCubes.some(
    (cube) => cube.OutputNames && cube.OutputNames.length > 0,
  );

  // Retrier доступен если есть retry кубы
  const hasRetrierSource = retryCubes.length > 0;

  // Получаем занятые порты (hash которых уже есть в inputsMapping)
  const usedInputPortHashes = new Set(Object.keys(inputsMapping));

  // Доступные (незанятые) входные порты
  const availableInputPorts = inputPorts.filter(
    (port) => !usedInputPortHashes.has(port.hash),
  );

  // Кнопка "Add Input Mapping" disabled, если:
  // - нет свободных входных портов у куба, ИЛИ
  // - нет источников данных (ни resharder, ни кубов с output портами, ни retrier)
  const hasNoSources =
    !hasResharderSources && !hasCubesWithOutputs && !hasRetrierSource;
  const hasNoAvailableInputPorts = availableInputPorts.length < 1;
  const isAddMappingDisabled = hasNoAvailableInputPorts || hasNoSources;

  // Опции для выбора типа источника (динамически формируются)
  const typeOptions = [
    ...(hasResharderSources
      ? [{ value: CubeType.RESHARDER, content: CubeType.RESHARDER }]
      : []),
    ...(hasCubesWithOutputs
      ? [{ value: CubeType.CUBE, content: CubeType.CUBE }]
      : []),
    ...(hasRetrierSource
      ? [{ value: CubeType.RETRY, content: CubeType.RETRY }]
      : []),
  ];

  // Все кубы с выходными портами (для выбора источника CIT_CUBE)
  // Включает и обычные кубы, и RETRY кубы — у них одинаковая логика input/output
  const cubesWithOutputs = availableCubes.filter(
    (cube) => cube.OutputNames && cube.OutputNames.length > 0,
  );

  const handleAddMapping = () => {
    if (availableInputPorts.length === 0) return;

    // Если доступен только один порт — выбираем его автоматически
    // Если несколько — используем временный ключ, пользователь выберет сам
    const inputPortHash =
      availableInputPorts.length === 1
        ? availableInputPorts[0].hash
        : `pending_${generateHash(8)}`;

    const newMapping: EditCubeInputMapping = {
      Type: '' as CubeType, // Пользователь должен выбрать тип
      OutputPortHash: '',
    };
    onInputsMappingChange({
      ...inputsMapping,
      [inputPortHash]: newMapping,
    });
  };

  const handleRemoveMapping = (inputPortHash: string) => {
    const newMapping = { ...inputsMapping };
    delete newMapping[inputPortHash];
    onInputsMappingChange(newMapping);
  };

  const handleUpdateMapping = (
    inputPortHash: string,
    updates: Partial<EditCubeInputMapping>,
  ) => {
    onInputsMappingChange({
      ...inputsMapping,
      [inputPortHash]: {
        ...inputsMapping[inputPortHash],
        ...updates,
      },
    });
  };

  const handleInputPortChange = (oldPortHash: string, newPortHash: string) => {
    if (oldPortHash === newPortHash) return;

    const newMapping = { ...inputsMapping };
    newMapping[newPortHash] = newMapping[oldPortHash];
    delete newMapping[oldPortHash];
    onInputsMappingChange(newMapping);
  };

  return (
    <Flex direction="column" gap={2}>
      {Object.entries(inputsMapping).length === 0 ? (
        <Text variant="body-1" color="secondary">
          no mappings
        </Text>
      ) : (
        <Flex direction="column" gap={3}>
          {Object.entries(inputsMapping).map(([inputPortHash, mapping]) => {
            // Проверяем, выбран ли порт (pending_ означает не выбран)
            const isPending = inputPortHash.startsWith('pending_');

            // Доступные порты для выбора: все незанятые
            // (текущий включаем только если он не pending)
            const selectableInputPorts = inputPorts.filter(
              (port) =>
                (!isPending && port.hash === inputPortHash) ||
                !usedInputPortHashes.has(port.hash),
            );

            return (
              <Flex
                key={inputPortHash}
                direction="column"
                gap={2}
                style={{
                  padding: '12px',
                  border: '1px dashed var(--g-color-line-generic)',
                  borderRadius: '0px',
                  position: 'relative',
                }}
              >
                <DeleteButton
                  onClick={() => handleRemoveMapping(inputPortHash)}
                  size="m"
                  style={{ position: 'absolute', top: 2, right: 2 }}
                />
                {/* Input Port */}
                <Flex direction="column" gap={1}>
                  <Text variant="body-1">
                    InputPort
                    <Text
                      color="danger"
                      style={{ display: 'inline', marginLeft: '2px' }}
                    >
                      *
                    </Text>
                  </Text>
                  <Select
                    value={isPending ? [] : [inputPortHash]}
                    onUpdate={(values) => {
                      if (values[0]) {
                        handleInputPortChange(inputPortHash, values[0]);
                      }
                    }}
                    filterable
                    placeholder="Select input port"
                    size="m"
                    width="max"
                    validationState={isPending ? 'invalid' : undefined}
                  >
                    {selectableInputPorts.map((port) => (
                      <Select.Option key={port.hash} value={port.hash}>
                        {port.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Flex>
                {/* Type */}
                <Flex direction="column" gap={1}>
                  <Text variant="body-1">
                    Type
                    <Text
                      color="danger"
                      style={{ display: 'inline', marginLeft: '2px' }}
                    >
                      *
                    </Text>
                  </Text>
                  <Select
                    value={mapping.Type ? [mapping.Type] : []}
                    onUpdate={(values) => {
                      if (values[0]) {
                        const newType = values[0] as CubeType;

                        // Для RESHARDER автовыбираем порт если он единственный
                        const autoResharderPort =
                          newType === CubeType.RESHARDER &&
                          resharderInputSources.length === 1
                            ? resharderInputSources[0].hash
                            : '';

                        // Для RETRY автовыбираем retry куб если он единственный
                        const autoRetryCubeHash =
                          newType === CubeType.RETRY && retryCubes.length === 1
                            ? retryCubes[0].Hash
                            : '';

                        handleUpdateMapping(inputPortHash, {
                          Type: newType,
                          OutputCubeHash:
                            newType === CubeType.CUBE ? '' : undefined,
                          OutputPortHash:
                            newType === CubeType.RETRY
                              ? undefined
                              : autoResharderPort,
                          RetryCubeHash:
                            newType === CubeType.RETRY
                              ? autoRetryCubeHash
                              : undefined,
                        });
                      }
                    }}
                    placeholder="Select type"
                    size="m"
                    width="max"
                    validationState={!mapping.Type ? 'invalid' : undefined}
                  >
                    {typeOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.content}
                      </Select.Option>
                    ))}
                  </Select>
                </Flex>
                {/* OutputCube CubeName - только для Type = CUBE */}
                {mapping.Type === CubeType.CUBE && (
                  <Flex direction="column" gap={1}>
                    <Text variant="body-1">
                      CubeName
                      <Text
                        color="danger"
                        style={{ display: 'inline', marginLeft: '2px' }}
                      >
                        *
                      </Text>
                    </Text>
                    <Select
                      value={
                        mapping.OutputCubeHash ? [mapping.OutputCubeHash] : []
                      }
                      onUpdate={(values) => {
                        const selectedCubeHash = values[0] || '';
                        const selectedCube = cubesWithOutputs.find(
                          (c) => c.Hash === selectedCubeHash,
                        );
                        const outputPorts = selectedCube?.OutputNames || [];
                        // Автовыбор порта если он единственный
                        const autoSelectedPort =
                          outputPorts.length === 1 ? outputPorts[0].hash : '';
                        handleUpdateMapping(inputPortHash, {
                          OutputCubeHash: selectedCubeHash,
                          OutputPortHash: autoSelectedPort,
                        });
                      }}
                      filterable
                      placeholder="Select cube"
                      size="m"
                      width="max"
                      validationState={
                        !mapping.OutputCubeHash ? 'invalid' : undefined
                      }
                    >
                      {cubesWithOutputs.map((cube) => (
                        <Select.Option key={cube.Hash} value={cube.Hash}>
                          {cube.Name || cube.Hash.substring(0, 12)}
                        </Select.Option>
                      ))}
                    </Select>
                  </Flex>
                )}
                {/* OutputPort OutputName для RESHARDER - показываем сразу после выбора типа */}
                {mapping.Type === CubeType.RESHARDER && (
                  <Flex direction="column" gap={1}>
                    <Text variant="body-1">
                      OutputName
                      <Text
                        color="danger"
                        style={{ display: 'inline', marginLeft: '2px' }}
                      >
                        *
                      </Text>
                    </Text>
                    <Select
                      value={
                        mapping.OutputPortHash ? [mapping.OutputPortHash] : []
                      }
                      onUpdate={(values) =>
                        handleUpdateMapping(inputPortHash, {
                          OutputPortHash: values[0] || '',
                        })
                      }
                      filterable
                      placeholder="Select output port"
                      size="m"
                      width="max"
                      validationState={
                        !mapping.OutputPortHash ? 'invalid' : undefined
                      }
                    >
                      {resharderInputSources.map((port) => (
                        <Select.Option key={port.hash} value={port.hash}>
                          {port.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Flex>
                )}
                {/* OutputPort OutputName для CUBE - показываем только после выбора куба */}
                {mapping.Type === CubeType.CUBE && mapping.OutputCubeHash && (
                  <Flex direction="column" gap={1}>
                    <Text variant="body-1">
                      OutputName
                      <Text
                        color="danger"
                        style={{ display: 'inline', marginLeft: '2px' }}
                      >
                        *
                      </Text>
                    </Text>
                    <Select
                      value={
                        mapping.OutputPortHash ? [mapping.OutputPortHash] : []
                      }
                      onUpdate={(values) =>
                        handleUpdateMapping(inputPortHash, {
                          OutputPortHash: values[0] || '',
                        })
                      }
                      filterable
                      placeholder="Select output port"
                      size="m"
                      width="max"
                      validationState={
                        !mapping.OutputPortHash ? 'invalid' : undefined
                      }
                    >
                      {(
                        cubesWithOutputs.find(
                          (c) => c.Hash === mapping.OutputCubeHash,
                        )?.OutputNames || []
                      ).map((port) => (
                        <Select.Option key={port.hash} value={port.hash}>
                          {port.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Flex>
                )}
                {/* RetryCube CubeName для CIT_RETRY (из Retrier) - отображаем имя, храним hash */}
                {mapping.Type === CubeType.RETRY && (
                  <Flex direction="column" gap={1}>
                    <Text variant="body-1">
                      CubeName (RetryCube)
                      <Text
                        color="danger"
                        style={{ display: 'inline', marginLeft: '2px' }}
                      >
                        *
                      </Text>
                    </Text>
                    <Select
                      value={
                        mapping.RetryCubeHash
                          ? [
                              retryCubes.find(
                                (c) => c.Hash === mapping.RetryCubeHash,
                              )?.Name || '',
                            ]
                          : mapping.RetryCube
                            ? [mapping.RetryCube]
                            : []
                      }
                      onUpdate={(values) => {
                        const selectedName = values[0] || '';
                        // Находим куб по имени и получаем его hash
                        const selectedCube = retryCubes.find(
                          (c) => c.Name === selectedName,
                        );
                        handleUpdateMapping(inputPortHash, {
                          RetryCubeHash: selectedCube?.Hash || '',
                        });
                      }}
                      filterable
                      placeholder="Select retry cube"
                      size="m"
                      width="max"
                      validationState={
                        !(mapping.RetryCubeHash || mapping.RetryCube)
                          ? 'invalid'
                          : undefined
                      }
                    >
                      {retryCubes.map((cube) => (
                        <Select.Option
                          key={cube.Hash}
                          value={cube.Name || cube.Hash.substring(0, 12)}
                        >
                          {cube.Name || cube.Hash.substring(0, 12)}
                        </Select.Option>
                      ))}
                    </Select>
                  </Flex>
                )}
              </Flex>
            );
          })}
        </Flex>
      )}
      <AddButton
        onClick={handleAddMapping}
        variant="normal"
        disabled={isAddMappingDisabled}
      >
        Add Input Mapping
      </AddButton>
    </Flex>
  );
};

// ============================================================================
// Основные компоненты
// ============================================================================

interface CubeEditFormProps {
  cube: EditExperimentCube;
  cubesList: CubeListDC[];
  availableCubes: EditExperimentCube[];
  resharderInputSources: PortInfo[];
  onUpdateCube: (hash: string, updates: CubeUpdates) => void;
  onSelect?: () => void;
  /** Callback при удалении input порта — для очистки маппинга */
  onInputPortRemove?: (cubeHash: string, removedPort: PortInfo) => void;
  /** Callback при удалении output порта — для очистки маппингов в других кубах */
  onOutputPortRemove?: (cubeHash: string, removedPort: PortInfo) => void;
  /** Список имён доступных переменных для валидации ${variableName} */
  variableNames?: Set<string>;
}

const CubeEditForm = React.memo<CubeEditFormProps>(function CubeEditForm({
  cube,
  cubesList,
  availableCubes,
  resharderInputSources,
  onUpdateCube,
  onSelect,
  onInputPortRemove,
  onOutputPortRemove,
  variableNames,
}) {
  // Проверка наличия CubeID
  const hasCubeId = cube.CubeID !== undefined && cube.CubeID !== null;

  // Поиск базового куба (если есть ID)
  const baseCube = hasCubeId
    ? cubesList.find((c) => c.id === cube.CubeID)
    : null;

  // Локальное состояние для CubeName
  const [cubeName, setCubeName] = useState(cube.Name || '');

  // Локальное состояние для InputNames и OutputNames (только для dynamic)
  const [inputNames, setInputNames] = useState<PortInfo[]>(
    cube.InputNames || [],
  );
  const [outputNames, setOutputNames] = useState<PortInfo[]>(
    cube.OutputNames || [],
  );

  // Локальное состояние для InputsMapping
  const [inputsMapping, setInputsMapping] = useState<
    Record<string, EditCubeInputMapping>
  >(cube.InputsMapping || {});

  // Парсим CubeParams для получения параметров (args)
  const cubeParamsSchema = useMemo((): ParamsDC[] => {
    if (!cube.CubeParams) return [];
    try {
      const parsed = JSON.parse(cube.CubeParams);
      if (parsed?.args && Array.isArray(parsed.args)) {
        return parsed.args as ParamsDC[];
      }
      return [];
    } catch {
      return [];
    }
  }, [cube.CubeParams]);

  // Синхронизация локального состояния с props (для обновлений из графа)
  useEffect(() => {
    setCubeName(cube.Name || '');
  }, [cube.Name]);

  useEffect(() => {
    setInputNames(cube.InputNames || []);
  }, [cube.InputNames]);

  useEffect(() => {
    setOutputNames(cube.OutputNames || []);
  }, [cube.OutputNames]);

  useEffect(() => {
    setInputsMapping(cube.InputsMapping || {});
  }, [cube.InputsMapping]);

  // Валидация CubeName
  const isNameEmpty = !cubeName || cubeName.trim() === '';

  // Проверка на дубликат имени (среди других кубов)
  const isNameDuplicate = useMemo(() => {
    const trimmedName = cubeName.trim();
    if (!trimmedName) return false;
    return availableCubes.some(
      (c) => c.Name === trimmedName && c.Hash !== cube.Hash,
    );
  }, [cubeName, availableCubes, cube.Hash]);

  // Определяем состояние валидации и сообщение об ошибке
  const nameValidationState =
    isNameEmpty || isNameDuplicate ? 'invalid' : undefined;
  const nameErrorMessage = isNameEmpty
    ? 'CubeName is required'
    : isNameDuplicate
      ? 'CubeName must be unique'
      : undefined;

  // Обработчик изменения имени
  const handleNameChange = useCallback(
    (value: string) => {
      setCubeName(value);
      onUpdateCube(cube.Hash, { Name: value });
    },
    [cube.Hash, onUpdateCube],
  );

  // Обработчик потери фокуса — проверяем на пустоту и дубликаты
  const handleNameBlur = useCallback(() => {
    const trimmedName = cubeName.trim();
    const hash4 = cube.Hash.substring(0, 4);

    // Если имя пустое — генерируем BaseCubeName_hash4
    if (!trimmedName) {
      const baseCubeName = baseCube?.name || 'Cube';
      const generatedName = `${baseCubeName}_${hash4}`;
      setCubeName(generatedName);
      onUpdateCube(cube.Hash, { Name: generatedName });
      return;
    }

    // Проверяем на дубликаты среди других кубов
    const isDuplicate = availableCubes.some(
      (c) => c.Name === trimmedName && c.Hash !== cube.Hash,
    );

    if (isDuplicate) {
      // Добавляем _hash4 к имени
      const uniqueName = `${trimmedName}_${hash4}`;
      setCubeName(uniqueName);
      onUpdateCube(cube.Hash, { Name: uniqueName });
    }
  }, [cubeName, cube.Hash, baseCube?.name, availableCubes, onUpdateCube]);

  // Обработчик изменения InputNames
  const handleInputNamesChange = useCallback(
    (names: PortInfo[]) => {
      setInputNames(names);
      onUpdateCube(cube.Hash, { InputNames: names });
    },
    [cube.Hash, onUpdateCube],
  );

  // Обработчик удаления input порта — вызывает callback для очистки маппинга
  const handleInputPortRemove = useCallback(
    (removedPort: PortInfo) => {
      if (onInputPortRemove) {
        onInputPortRemove(cube.Hash, removedPort);
      }
    },
    [cube.Hash, onInputPortRemove],
  );

  // Обработчик изменения OutputNames
  const handleOutputNamesChange = useCallback(
    (names: PortInfo[]) => {
      setOutputNames(names);
      onUpdateCube(cube.Hash, { OutputNames: names });
    },
    [cube.Hash, onUpdateCube],
  );

  // Обработчик удаления output порта — вызывает callback для очистки маппингов в других кубах
  const handleOutputPortRemove = useCallback(
    (removedPort: PortInfo) => {
      if (onOutputPortRemove) {
        onOutputPortRemove(cube.Hash, removedPort);
      }
    },
    [cube.Hash, onOutputPortRemove],
  );

  // Обработчик изменения InputsMapping
  const handleInputsMappingChange = useCallback(
    (mapping: Record<string, EditCubeInputMapping>) => {
      setInputsMapping(mapping);
      onUpdateCube(cube.Hash, { InputsMapping: mapping });
    },
    [cube.Hash, onUpdateCube],
  );

  // Состояние для активного таба
  const [activeTab, setActiveTab] = useState('general');

  // Определяем, есть ли параметры у куба
  const hasParams = cubeParamsSchema.length > 0;

  return (
    <Flex direction="column" gap={3} style={{ paddingBottom: '12px' }}>
      <Flex direction="row" alignItems="center" gap={2}>
        <TabProvider value={activeTab} onUpdate={setActiveTab}>
          <TabList style={{ flex: 1 }}>
            <Tab value="general">General</Tab>
            <Tab value="params" disabled={!hasParams}>
              Params
            </Tab>
            <Tab value="mappings" counter={Object.keys(inputsMapping).length}>
              Mappings
            </Tab>
          </TabList>
        </TabProvider>
        {onSelect && (
          <Button view="flat-action" size="xs" onClick={onSelect}>
            <Icon data={NodesRight} size={14} />
          </Button>
        )}
      </Flex>

      {/* Tab: General */}
      {activeTab === 'general' && (
        <Flex direction="column" gap={3}>
          {/* Информация о базовом кубе */}
          <CubeBaseInfo
            baseCube={baseCube ?? null}
            paramsKey={cube.ParamsName}
            canAddInMarket
          />

          {/* CubeName - обязательное поле */}
          <Flex direction="column" gap={1}>
            <Text variant="body-1" style={{ fontWeight: 600 }}>
              CubeName
              <Text
                variant="body-1"
                color="danger"
                style={{ display: 'inline' }}
              >
                *
              </Text>
            </Text>
            <TextInput
              value={cubeName}
              onUpdate={handleNameChange}
              onBlur={handleNameBlur}
              placeholder="Enter cube name"
              size="m"
              validationState={nameValidationState}
              errorMessage={nameErrorMessage}
            />
          </Flex>

          {/* InputNames */}
          <NamesField
            label="InputNames"
            type={cube.InputType}
            names={
              cube.InputType === CubeIOType.DYNAMIC
                ? inputNames
                : cube.InputNames || []
            }
            onNamesChange={handleInputNamesChange}
            onPortRemove={handleInputPortRemove}
            addButtonLabel="Add input"
            defaultValuePrefix="Input"
          />

          {/* OutputNames */}
          <NamesField
            label="OutputNames"
            type={cube.OutputType}
            names={
              cube.OutputType === CubeIOType.DYNAMIC
                ? outputNames
                : cube.OutputNames || []
            }
            onNamesChange={handleOutputNamesChange}
            onPortRemove={handleOutputPortRemove}
            addButtonLabel="Add output"
            defaultValuePrefix="Output"
          />
        </Flex>
      )}

      {/* Tab: Params */}
      {activeTab === 'params' && hasParams && (
        <FormParamEdit
          params={cubeParamsSchema}
          fieldNamePrefix={`Worker.GraphConfig.Cubes.${cube.Hash}.Params`}
          size="m"
          addButtonVariant="normal"
          variableNames={variableNames}
        />
      )}

      {/* Tab: Mappings */}
      {activeTab === 'mappings' && (
        <InputsMappingEdit
          inputsMapping={inputsMapping}
          inputPorts={cube.InputNames || []}
          availableCubes={availableCubes.filter((c) => c.Hash !== cube.Hash)}
          resharderInputSources={resharderInputSources}
          onInputsMappingChange={handleInputsMappingChange}
        />
      )}
    </Flex>
  );
});

// ============================================================================
// Debug Section
// ============================================================================

interface DebugSectionProps {
  debugInfo: ParseDebugInfo | null;
  onOpenInitialDebugger: () => void;
  onOpenCurrentDebugger: () => void;
}

const DebugSection = ({
  debugInfo,
  onOpenInitialDebugger,
  onOpenCurrentDebugger,
}: DebugSectionProps) => {
  const errorCount = debugInfo?.errorCount ?? 0;
  const hasErrors = errorCount > 0;

  const textColor = hasErrors ? 'danger' : 'secondary';
  const title = 'Cubes Debug:';

  return (
    <Flex
      direction="row"
      alignItems="center"
      gap={4}
      style={{ marginTop: '36px' }}
    >
      <Text variant="code-1" color={textColor}>
        {title}
      </Text>
      <Button view="flat-secondary" size="xs" onClick={onOpenInitialDebugger}>
        {`Initial (${errorCount})`}
      </Button>
      <Button view="flat-secondary" size="xs" onClick={onOpenCurrentDebugger}>
        Current
      </Button>
    </Flex>
  );
};

// ============================================================================
// Dropped Mappings Section
// ============================================================================

interface DroppedCubesSectionProps {
  droppedCubes: DroppedCube[];
}

const DroppedCubesSection = ({ droppedCubes }: DroppedCubesSectionProps) => {
  const [expanded, setExpanded] = useState(true);

  if (droppedCubes.length === 0) {
    return null;
  }

  return (
    <Flex direction="column" gap={2} style={{ marginTop: '24px' }}>
      {/* Header with disclosure toggle */}
      <Flex
        direction="row"
        alignItems="center"
        gap={2}
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <Icon
          data={TriangleExclamation}
          size={14}
          style={{ color: 'var(--g-color-text-danger)' }}
        />
        <Text variant="subheader-1" color="danger">
          Dropped Cubes ({droppedCubes.length})
        </Text>
        <Icon
          data={expanded ? ChevronUp : ChevronDown}
          size={16}
          style={{ color: 'var(--g-color-text-danger)' }}
        />
      </Flex>

      {/* Content */}
      {expanded && (
        <Flex direction="column" gap={2} style={{ paddingLeft: '22px' }}>
          <Text variant="body-1" color="secondary">
            These cubes were removed because their CubeTypeID was not found
          </Text>
          {droppedCubes.map((cube, index) => (
            <CubeUnknownViewer
              key={`dropped-${cube.Name}-${index}`}
              cube={cube}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
};

// ============================================================================
// Dropped Mappings Section
// ============================================================================

interface DroppedMappingsSectionProps {
  droppedMappings: DroppedMapping[];
}

/**
 * Форматирует dropped mapping для отображения
 */
const formatDroppedMapping = (mapping: DroppedMapping): string => {
  const sourceType = mapping.sourceType;
  let sourceText = '';

  if (sourceType === 'CIT_CUBE' || sourceType === 'CubeT') {
    sourceText = `Cube «${mapping.sourceCubeName || '?'}» output «${mapping.sourceOutputName || '?'}»`;
  } else if (sourceType === 'CIT_RESHARDER' || sourceType === 'Resharder') {
    sourceText = `Resharder output «${mapping.sourceOutputName || '?'}»`;
  } else if (sourceType === 'CIT_RETRY' || sourceType === 'Retry') {
    sourceText = `Retrier cube «${mapping.sourceCubeName || '?'}»`;
  } else {
    sourceText = `${sourceType} «${mapping.sourceCubeName || mapping.sourceOutputName || '?'}»`;
  }

  return `${sourceText} → Cube «${mapping.cubeName}» input «${mapping.inputName}»`;
};

const DroppedMappingsSection = ({
  droppedMappings,
}: DroppedMappingsSectionProps) => {
  const [expanded, setExpanded] = useState(false);

  if (droppedMappings.length === 0) {
    return null;
  }

  return (
    <Flex direction="column" gap={2} style={{ marginTop: '24px' }}>
      {/* Header with disclosure toggle */}
      <Flex
        direction="row"
        alignItems="center"
        gap={2}
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <Icon
          data={TriangleExclamation}
          size={14}
          style={{ color: 'var(--g-color-text-danger)' }}
        />
        <Text variant="subheader-1" color="danger">
          Dropped Mappings ({droppedMappings.length})
        </Text>
        <Icon
          data={expanded ? ChevronUp : ChevronDown}
          size={16}
          style={{ color: 'var(--g-color-text-danger)' }}
        />
      </Flex>

      {/* Content */}
      {expanded && (
        <Flex direction="column" gap={2} style={{ paddingLeft: '22px' }}>
          {droppedMappings.map((mapping, index) => (
            <Text
              key={`dropped-mapping-${index}`}
              variant="code-1"
              style={{ fontFamily: 'monospace' }}
            >
              {formatDroppedMapping(mapping)}
            </Text>
          ))}
        </Flex>
      )}
    </Flex>
  );
};

// ============================================================================
// Основной компонент
// ============================================================================

interface WorkerEditConfigCubesProps {
  selectedCubeHash?: string | null;
  onCubeSelect?: (cubeHash: string | null) => void;
  /** Список имён доступных переменных для валидации ${variableName} */
  variableNames?: Set<string>;
}

export const WorkerEditConfigCubes = ({
  selectedCubeHash,
  onCubeSelect,
  variableNames,
}: WorkerEditConfigCubesProps) => {
  const form = useForm();
  const { values } = useFormState({
    subscription: { values: true },
  }) as { values: ExperimentFormValues };

  const [
    cubesList,
    failed,
    expandedCubeHashes,
    toggleCube,
    openOnlyCube,
    initialCubeConfig,
    currentCubeConfig,
  ] = useUnit([
    editorPageModel.cubes.$data,
    editorPageModel.cubes.$failed,
    editorPageModel.graph.experiment.$expandedCubeHashes,
    editorPageModel.graph.experiment.toggleCube,
    editorPageModel.graph.experiment.openOnlyCube,
    editorPageModel.editor.$initialCubeConfig,
    editorPageModel.editor.$currentCubeConfig,
  ]);

  // Получаем кубы из формы (Record → массив)
  const cubes = useMemo(() => {
    const cubesRecord = values?.Worker?.GraphConfig?.Cubes || {};
    return Object.values(cubesRecord);
  }, [values?.Worker?.GraphConfig?.Cubes]);

  // Получаем dropped кубы из формы
  const droppedCubes = useMemo((): DroppedCube[] => {
    return values?.Worker?.GraphConfig?.DroppedCubes || [];
  }, [values?.Worker?.GraphConfig?.DroppedCubes]);

  // Получаем dropped маппинги из формы
  const droppedMappings = useMemo((): DroppedMapping[] => {
    return values?.Worker?.GraphConfig?.DroppedMappings || [];
  }, [values?.Worker?.GraphConfig?.DroppedMappings]);

  // Получаем resharder inputSources из формы
  // Порт остается в списке, даже если имя пустое (пока есть portHash)
  // Приоритет имени: OutputName > SourceName
  const resharderInputSources = useMemo(() => {
    const sources: PortInfo[] = [];
    const inputSources = values?.Resharder?.InputSources;
    if (Array.isArray(inputSources)) {
      inputSources.forEach((source) => {
        if (source?.portHash) {
          // Используем OutputName если есть, иначе SourceName
          const displayName =
            source.OutputName && source.OutputName.trim() !== ''
              ? source.OutputName
              : source.SourceName || '';
          sources.push({
            name: displayName,
            hash: source.portHash,
          });
        }
      });
    }
    return sources;
  }, [values?.Resharder?.InputSources]);

  // Проверяем наличие ресурсов Resharder
  const hasResharderResources = useMemo(() => {
    const resharderResources = values?.Resources?.Resharder;
    return (
      resharderResources &&
      typeof resharderResources === 'object' &&
      !Array.isArray(resharderResources) &&
      Object.keys(resharderResources).length > 0
    );
  }, [values?.Resources?.Resharder]);

  // Собираем debug информацию на основе формы
  const debugInfo = useMemo((): ParseDebugInfo => {
    const debug = createDebugCollector();

    // ========================================================================
    // Этап 1: Валидация Resharder
    // ========================================================================
    const resharderNameCount = new Map<string, number>();
    resharderInputSources.forEach((source) => {
      if (source.name) {
        resharderNameCount.set(
          source.name,
          (resharderNameCount.get(source.name) || 0) + 1,
        );
      }
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

    debug.info('validate_resharder', 'Resharder validation completed', {
      totalSources: resharderInputSources.length,
      uniqueSources: resharderNameCount.size,
      duplicates: duplicateResharderNames.length,
    });

    // ========================================================================
    // Этап 2: Валидация кубов
    // ========================================================================
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
        debug.error(
          'validate_cubes',
          `«${name}» - duplicate cube name (${count} occurrences)`,
        );
      }
    });

    // Проверяем кубы на пустые имена
    cubes.forEach((cube, index) => {
      if (!cube.Name || cube.Name.trim() === '') {
        debug.error('validate_cubes', `Cube at index ${index} has empty name`);
      }
    });

    // Добавляем информацию о dropped кубах
    droppedCubes.forEach((cube) => {
      const reasonText =
        cube.reason === 'no_cube_type_id'
          ? 'has no CubeTypeID in cubeConfig'
          : 'CubeTypeID not found in cubes list';
      debug.error(
        'validate_cubes',
        `Cube «${cube.Name}» dropped: ${reasonText}`,
      );
    });

    const cubesWithEmptyName = cubes.filter(
      (c) => !c.Name || c.Name.trim() === '',
    ).length;

    debug.info('validate_cubes', 'Cubes validation completed', {
      totalCubes: cubes.length,
      droppedCubes: droppedCubes.length,
      duplicateNames: duplicateNames.size,
      cubesWithEmptyName,
      cubesWithErrors:
        droppedCubes.length + cubesWithEmptyName + duplicateNames.size,
    });

    // ========================================================================
    // Этап 3: Валидация маппингов
    // ========================================================================
    // Создаем Map для быстрого поиска кубов по hash
    const cubesByHash = new Map<string, EditExperimentCube>();
    cubes.forEach((c) => cubesByHash.set(c.Hash, c));

    let totalMappings = 0;
    let invalidMappings = 0;

    cubes.forEach((cube) => {
      // Создаем Map для быстрого поиска портов по hash
      const inputPortsByHash = new Map<string, PortInfo>();
      cube.InputNames?.forEach((p) => inputPortsByHash.set(p.hash, p));

      Object.entries(cube.InputsMapping || {}).forEach(
        ([inputPortHash, mapping]) => {
          // Пропускаем pending маппинги
          if (inputPortHash.startsWith('pending_')) {
            return;
          }

          totalMappings++;

          // Проверяем, есть ли такой входной порт
          const inputPort = inputPortsByHash.get(inputPortHash);
          if (!inputPort) {
            invalidMappings++;
            debug.error(
              'validate_mappings',
              `${cube.Name} - invalid input «${inputPortHash}»`,
            );
            return;
          }

          const inputName = inputPort.name;

          if (mapping.Type === CubeType.RESHARDER) {
            const hasOutputPort = resharderInputSources.some(
              (p) => p.hash === mapping.OutputPortHash,
            );
            if (!hasOutputPort && mapping.OutputPortHash) {
              invalidMappings++;
              debug.error(
                'validate_mappings',
                `${cube.Name} - invalid resharder output «${mapping.OutputPortHash}» for input «${inputName}»`,
              );
            }
          } else if (mapping.Type === CubeType.CUBE) {
            if (!mapping.OutputCubeHash) {
              invalidMappings++;
              debug.error(
                'validate_mappings',
                `${cube.Name} - missing source cube for input «${inputName}»`,
              );
            } else {
              const sourceCube = cubesByHash.get(mapping.OutputCubeHash);
              if (!sourceCube) {
                invalidMappings++;
                debug.error(
                  'validate_mappings',
                  `${cube.Name} - source cube not found for input «${inputName}»`,
                );
              } else {
                const hasOutputPort = sourceCube.OutputNames?.some(
                  (p) => p.hash === mapping.OutputPortHash,
                );
                if (!hasOutputPort && mapping.OutputPortHash) {
                  invalidMappings++;
                  debug.error(
                    'validate_mappings',
                    `${cube.Name} - invalid output «${mapping.OutputPortHash}» from cube «${sourceCube.Name}» for input «${inputName}»`,
                  );
                }
              }
            }
          } else if (mapping.Type === CubeType.RETRY) {
            if (!mapping.RetryCube) {
              invalidMappings++;
              debug.error(
                'validate_mappings',
                `${cube.Name} - missing retry cube for input «${inputName}»`,
              );
            } else {
              // Сначала ищем куб по имени
              const cubeByName = cubes.find(
                (c) => c.Name === mapping.RetryCube,
              );
              if (!cubeByName) {
                invalidMappings++;
                debug.error(
                  'validate_mappings',
                  `${cube.Name} - cube «${mapping.RetryCube}» not found for input «${inputName}»`,
                );
              } else if (cubeByName.CubeType !== CubeType.RETRY) {
                invalidMappings++;
                debug.error(
                  'validate_mappings',
                  `${cube.Name} - CIT_RETRY requires RETRY cube, but «${mapping.RetryCube}» is not a RETRY cube`,
                );
              }
            }
          }
        },
      );
    });

    debug.info('validate_mappings', 'Mappings validation completed', {
      totalMappings,
      validMappings: totalMappings - invalidMappings,
      invalidMappings,
    });

    // ========================================================================
    // Этап 4: Валидация dropped mappings
    // ========================================================================
    droppedMappings.forEach((mapping) => {
      let sourceText = '';
      const isCube =
        mapping.sourceType === 'CIT_CUBE' || mapping.sourceType === 'CubeT';
      const isResharder =
        mapping.sourceType === 'CIT_RESHARDER' ||
        mapping.sourceType === 'Resharder';
      const isRetry =
        mapping.sourceType === 'CIT_RETRY' || mapping.sourceType === 'Retry';

      if (isCube) {
        const cubeName = mapping.sourceCubeName || '?';
        const outputName = mapping.sourceOutputName || '?';
        sourceText = `Cube «${cubeName}» output «${outputName}»`;
      } else if (isResharder) {
        sourceText = `Resharder output «${mapping.sourceOutputName || '?'}»`;
      } else if (isRetry) {
        sourceText = `Retrier cube «${mapping.sourceCubeName || '?'}»`;
      } else {
        const name = mapping.sourceCubeName || mapping.sourceOutputName || '?';
        sourceText = `${mapping.sourceType} «${name}»`;
      }

      debug.error(
        'dropped_mappings',
        `${sourceText} → Cube «${mapping.cubeName}» input «${mapping.inputName}» — ${mapping.reason}`,
      );
    });

    if (droppedMappings.length > 0) {
      debug.info('dropped_mappings', 'Dropped mappings summary', {
        totalDroppedMappings: droppedMappings.length,
      });
    }

    // ========================================================================
    // Этап 5: Построение графа
    // ========================================================================
    const retryCubes = cubes.filter((c) => c.CubeType === CubeType.RETRY);

    debug.info('build_graph', 'Graph built successfully', {
      nodesCount:
        cubes.length +
        (resharderInputSources.length > 0 ? 1 : 0) +
        (retryCubes.length > 0 ? 1 : 0),
      edgesCount: totalMappings - invalidMappings,
      cubesCount: cubes.length,
      droppedCubesCount: droppedCubes.length,
      cubesWithErrors: droppedCubes.length + cubesWithEmptyName,
    });

    return debug.getResult();
  }, [cubes, droppedCubes, droppedMappings, resharderInputSources]);

  // Строим граф для получения данных
  const graphData = useMemo(() => {
    return buildGraphFromCubes(cubes, {
      resharderInputSources,
      hasResharderResources: Boolean(hasResharderResources),
    });
  }, [cubes, resharderInputSources, hasResharderResources]);

  // Получаем данные редактора для оригинального конфига
  const [editorData] = useUnit([editorPageModel.editor.$data]);

  // Получаем JSON кубов из оригинального конфига (worker.cubes)
  const cubesConfigJson = useMemo(() => {
    if (!editorData?.config) {
      return '{}';
    }
    try {
      const parsed = JSON.parse(editorData.config);
      const workerCubes = parsed?.Worker?.GraphConfig?.Cubes;
      if (workerCubes) {
        return JSON.stringify({ Cubes: workerCubes }, null, 2);
      }
      return '{}';
    } catch {
      return '{}';
    }
  }, [editorData?.config]);

  // cubeConfig (additional_information) берём начальное значение из модели состояния
  const cubeConfigJson = initialCubeConfig || '{}';

  // Получаем JSON данных графа для React Flow (для debugger)
  const graphDataJson = useMemo(() => {
    return JSON.stringify(
      {
        nodes: graphData.nodes,
        edges: graphData.edges,
      },
      null,
      2,
    );
  }, [graphData]);

  // Сохраняем начальное значение graphDataJson (при первом рендере)
  const initialGraphDataJsonRef = useRef<string | null>(null);
  if (initialGraphDataJsonRef.current === null && graphDataJson !== '{}') {
    initialGraphDataJsonRef.current = graphDataJson;
  }
  const initialGraphDataJson = initialGraphDataJsonRef.current || graphDataJson;

  // Получаем текущий cubesConfigJson из формы
  const currentCubesConfigJson = useMemo(() => {
    const cubesRecord = values?.Worker?.GraphConfig?.Cubes || {};
    return JSON.stringify({ Cubes: cubesRecord }, null, 2);
  }, [values?.Worker?.GraphConfig?.Cubes]);

  // Обработчик открытия debugger модалки (Initial)
  const handleOpenInitialDebugger = useCallback(() => {
    CubesDebuggerModel.start({
      mode: 'initial',
      debugInfo,
      cubesConfigJson,
      cubeConfigJson,
      graphDataJson: initialGraphDataJson,
    });
  }, [debugInfo, cubesConfigJson, cubeConfigJson, initialGraphDataJson]);

  // Обработчик открытия debugger модалки (Current)
  const handleOpenCurrentDebugger = useCallback(() => {
    CubesDebuggerModel.start({
      mode: 'current',
      debugInfo: null,
      cubesConfigJson: currentCubesConfigJson,
      cubeConfigJson: currentCubeConfig || '{}',
      graphDataJson,
    });
  }, [currentCubesConfigJson, currentCubeConfig, graphDataJson]);

  // Refs для скролла к элементам
  const cubeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Эффект для синхронизации с выбранным кубом из графа
  useEffect(() => {
    if (selectedCubeHash) {
      // Находим куб по Hash
      const cube = cubes.find((c) => c.Hash === selectedCubeHash);
      if (!cube) {
        return;
      }

      // Открываем только этот куб, закрывая все остальные
      openOnlyCube(cube.Hash);

      // Скроллим к выбранному кубу
      setTimeout(() => {
        const element = cubeRefs.current.get(cube.Hash);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  }, [selectedCubeHash, cubes, openOnlyCube]);

  // Эффект для скролла к открытому кубу (например, при добавлении нового)
  useEffect(() => {
    // Если есть ровно один открытый куб, скроллим к нему
    if (expandedCubeHashes.size === 1) {
      const [openedHash] = Array.from(expandedCubeHashes);
      setTimeout(() => {
        const element = cubeRefs.current.get(openedHash);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  }, [expandedCubeHashes]);

  // Обновляет куб в форме по hash
  const updateCubeInForm = useCallback(
    (cubeHash: string, updates: CubeUpdates) => {
      const currentCubes = values?.Worker?.GraphConfig?.Cubes || {};
      const cube = currentCubes[cubeHash];

      if (!cube) return;

      form.change(`Worker.GraphConfig.Cubes.${cubeHash}`, {
        ...cube,
        ...updates,
      });
    },
    [form, values?.Worker?.GraphConfig?.Cubes],
  );

  // Добавляет новый куб в форму
  const addCubeToForm = useCallback(
    (newCube: EditExperimentCube) => {
      // Добавляем куб в Record по его hash
      form.change(`Worker.GraphConfig.Cubes.${newCube.Hash}`, newCube);

      // Открываем добавленный куб
      openOnlyCube(newCube.Hash);

      // Выделяем куб на графе и центрируем на нём
      if (onCubeSelect) {
        onCubeSelect(newCube.Hash);
      }
    },
    [form, openOnlyCube, onCubeSelect],
  );

  // Подписываемся на checkout из Cubes Market
  useEffect(() => {
    const unsubscribe = ShowCubesMarketModel.checkout.watch((baseCube) => {
      if (baseCube) {
        const newCube = createExperimentCube(baseCube as CubeInfoDC);
        if (newCube) {
          addCubeToForm(newCube);
        }
      }
    });
    return () => unsubscribe();
  }, [addCubeToForm]);

  const handleAddCube = () => {
    ShowCubesMarketModel.start({
      canAdd: true,
    });
  };

  // Запрашиваем подтверждение удаления куба
  const handleRemoveCube = useCallback((cubeHash: string, cubeName: string) => {
    ActionConfirmModel.start({
      mode: 'delete',
      name: `cube ${cubeName}`,
      meta: { cubeHash },
    });
  }, []);

  const handleUpdateCube = useCallback(
    (hash: string, updates: CubeUpdates) => {
      updateCubeInForm(hash, updates);
    },
    [updateCubeInForm],
  );

  // Обработчик удаления input порта — удаляет порт из InputNames и маппинг из InputsMapping
  const handleInputPortRemove = useCallback(
    (cubeHash: string, removedPort: PortInfo) => {
      const currentCubes = values?.Worker?.GraphConfig?.Cubes || {};
      const cube = currentCubes[cubeHash];
      if (!cube) return;

      // Удаляем маппинг по hash удалённого порта
      const newInputsMapping = { ...cube.InputsMapping };
      delete newInputsMapping[removedPort.hash];

      // Также удаляем порт из InputNames
      const newInputNames = (cube.InputNames || []).filter(
        (port) => port.hash !== removedPort.hash,
      );

      form.change(`Worker.GraphConfig.Cubes.${cubeHash}`, {
        ...cube,
        InputNames: newInputNames,
        InputsMapping: newInputsMapping,
      });
    },
    [form, values?.Worker?.GraphConfig?.Cubes],
  );

  // Обработчик удаления output порта — удаляет маппинги в других кубах, которые ссылались на этот output
  const handleOutputPortRemove = useCallback(
    (sourceCubeHash: string, removedPort: PortInfo) => {
      const currentCubes = values?.Worker?.GraphConfig?.Cubes || {};

      // Проходим по всем кубам и ищем маппинги, ссылающиеся на удалённый output
      Object.entries(currentCubes).forEach(([targetCubeHash, cube]) => {
        if (!cube.InputsMapping) return;

        let hasChanges = false;
        const newInputsMapping = { ...cube.InputsMapping };

        Object.entries(newInputsMapping).forEach(([inputPortHash, mapping]) => {
          // Проверяем маппинги типа CUBE, которые ссылаются на удалённый куб и порт
          if (
            mapping.Type === CubeType.CUBE &&
            mapping.OutputCubeHash === sourceCubeHash &&
            mapping.OutputPortHash === removedPort.hash
          ) {
            delete newInputsMapping[inputPortHash];
            hasChanges = true;
          }
        });

        // Обновляем куб только если были изменения
        if (hasChanges) {
          form.change(`Worker.GraphConfig.Cubes.${targetCubeHash}`, {
            ...cube,
            InputsMapping: newInputsMapping,
          });
        }
      });
    },
    [form, values?.Worker?.GraphConfig?.Cubes],
  );

  // Обработчик переключения disclosure куба
  // При закрытии выделенного куба — сбрасываем выделение
  // При открытии другого куба — сбрасываем выделение
  const handleToggleExpanded = useCallback(
    (cubeHash: string, currentlyExpanded: boolean) => {
      const willBeExpanded = !currentlyExpanded;

      if (willBeExpanded) {
        // Открываем куб — если это не выделенный куб, сбрасываем выделение
        if (selectedCubeHash && selectedCubeHash !== cubeHash) {
          onCubeSelect?.(null);
        }
      } else {
        // Закрываем куб — если это выделенный куб, сбрасываем выделение
        if (selectedCubeHash === cubeHash) {
          onCubeSelect?.(null);
        }
      }

      toggleCube(cubeHash);
    },
    [selectedCubeHash, onCubeSelect, toggleCube],
  );

  // Создаём обработчик выбора куба для каждого куба
  const handleCubeSelect = useCallback(
    (cubeHash: string) => () => {
      if (onCubeSelect) {
        onCubeSelect(cubeHash);
      }
    },
    [onCubeSelect],
  );

  if (failed) {
    return (
      <Text variant="body-1" color="danger">
        Error fetching models list from server
      </Text>
    );
  }

  return (
    <Flex direction="column">
      {cubes.length === 0 ? (
        <Text color="secondary">No models</Text>
      ) : (
        cubes.map((cube) => {
          const cubeName = cube.Name || cube.Hash.substring(0, 12);
          const isExpanded = expandedCubeHashes.has(cube.Hash);
          const isSelected = selectedCubeHash === cube.Hash;

          return (
            <CubeDisclosure
              key={cube.Hash}
              ref={(el) => {
                if (el) {
                  cubeRefs.current.set(cube.Hash, el);
                } else {
                  cubeRefs.current.delete(cube.Hash);
                }
              }}
              title={cubeName}
              cubeType={cube.CubeType}
              expanded={isExpanded}
              selected={isSelected}
              onToggle={() => handleToggleExpanded(cube.Hash, isExpanded)}
              onDelete={() => handleRemoveCube(cube.Hash, cubeName)}
            >
              <CubeEditForm
                cube={cube}
                cubesList={cubesList ?? []}
                availableCubes={cubes}
                resharderInputSources={resharderInputSources}
                onUpdateCube={handleUpdateCube}
                onSelect={handleCubeSelect(cube.Hash)}
                onInputPortRemove={handleInputPortRemove}
                onOutputPortRemove={handleOutputPortRemove}
                variableNames={variableNames}
              />
            </CubeDisclosure>
          );
        })
      )}
      <AddButton onClick={handleAddCube} variant="normal" marginTop={8}>
        Add Model
      </AddButton>

      {/* Dropped Cubes section */}
      <DroppedCubesSection droppedCubes={droppedCubes} />

      {/* Dropped Mappings section */}
      <DroppedMappingsSection droppedMappings={droppedMappings} />

      {/* Debug section */}
      <DebugSection
        debugInfo={debugInfo}
        onOpenInitialDebugger={handleOpenInitialDebugger}
        onOpenCurrentDebugger={handleOpenCurrentDebugger}
      />
    </Flex>
  );
};
