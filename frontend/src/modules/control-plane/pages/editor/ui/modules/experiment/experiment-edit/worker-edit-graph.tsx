import { Plus } from '@gravity-ui/icons';
import { Button, Dialog, Flex, Select, Text } from '@gravity-ui/uikit';
import { Edge, Node } from '@xyflow/react';
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
  CubeType,
  createNodePositionsMap,
  extractGraphLayout,
  graphEdgesToReactFlowEdges,
  layoutGraph,
  parseCubeConfig,
  parseGraphConfig,
  type EditCubeInputMapping,
  type EditExperimentCube,
  type PortInfo,
} from '@/modules/control-plane/entities/cubes';
import { editorPageModel } from '@/modules/control-plane/pages/editor';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import {
  Graph,
  type ConnectionData,
} from '@/modules/control-plane/shared/components/graph/experiment';
import {
  CubeListDC,
  ExperimentVariableItem,
} from '@/modules/control-plane/shared/types';

import type { ExperimentFormValues } from './utils';
import {
  parseExperimentModelParameters,
  serializeExperimentModelParameters,
} from './utils';

interface SupervisorModelLike {
  order?: number;
  modelId?: string;
  parameters?: Record<string, unknown>;
}

const DATASET_NODE_PREFIX = 'dataset_';

const stableSupervisorModelHash = (index: number, modelId: string): string => {
  const safe = (modelId || 'm').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `sv_${index}_${safe}`;
};

const makeDatasetNodeId = (alias: string): string =>
  `${DATASET_NODE_PREFIX}${encodeURIComponent(alias)}`;

const getAliasFromDatasetNodeId = (nodeId: string): string | null => {
  if (!nodeId.startsWith(DATASET_NODE_PREFIX)) {
    return null;
  }
  try {
    return decodeURIComponent(nodeId.slice(DATASET_NODE_PREFIX.length));
  } catch {
    return null;
  }
};

const readDatasetAlias = (item: unknown): string => {
  if (typeof item === 'string') {
    return item.trim();
  }
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    const candidate =
      obj.alias ?? obj.dataset_alias ?? obj.name ?? obj.dataset ?? '';
    return typeof candidate === 'string' ? candidate.trim() : '';
  }
  return '';
};

const getDatasetAliases = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map(readDatasetAlias).filter(Boolean);
};

const appendDatasetAlias = (raw: unknown, alias: string): unknown[] => {
  const normalized = alias.trim();
  if (!normalized) return Array.isArray(raw) ? raw : [];
  if (!Array.isArray(raw) || raw.length === 0) {
    return [normalized];
  }
  const existingAliases = new Set(getDatasetAliases(raw));
  if (existingAliases.has(normalized)) {
    return raw;
  }
  if (raw.some((item) => item && typeof item === 'object')) {
    return [...raw, { alias: normalized }];
  }
  return [...raw, normalized];
};

const removeDatasetAlias = (raw: unknown, alias: string): unknown[] => {
  if (!Array.isArray(raw)) return [];
  const normalized = alias.trim();
  return raw.filter((item) => readDatasetAlias(item) !== normalized);
};

interface WorkerEditGraphProps {
  selectedCubeHash?: string | null;
  centerOnCubeHash?: string | null;
  onCubeClick?: (cubeHash: string | null) => void;
  onCubeDelete?: (cubeHash: string, cubeName: string) => void;
  onResharderClick?: () => void;
  experiment_id?: number;
  experiment_name?: string;
  variables?: ExperimentVariableItem[] | null;
  cubesList?: CubeListDC[];
  /** Граф из Meta + models[] (супервизор), без редактирования связей */
  supervisorGraphMode?: boolean;
}

export const WorkerEditGraph = ({
  selectedCubeHash,
  centerOnCubeHash,
  onCubeClick,
  onCubeDelete,
  onResharderClick,
  experiment_id,
  experiment_name,
  variables,
  cubesList = [],
  supervisorGraphMode = false,
}: WorkerEditGraphProps) => {
  const form = useForm();
  const { values } = useFormState({
    subscription: { values: true },
  }) as { values: ExperimentFormValues };

  const [setGraphNodePositions, initialCubeConfig] = useUnit([
    editorPageModel.editor.setGraphNodePositions,
    editorPageModel.editor.$initialCubeConfig,
  ]);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [linkedDatasetAliases, setLinkedDatasetAliases] = useState<string[]>([]);
  const [selectedDatasetAliases, setSelectedDatasetAliases] = useState<string[]>(
    [],
  );
  const [datasetModalOpen, setDatasetModalOpen] = useState(false);
  const [datasetModalSelection, setDatasetModalSelection] = useState<string[]>([]);

  // Флаг: использовать ли сохранённые позиции (только при первом рендере)
  const useSavedPositionsRef = useRef(true);

  /** Защита от гонки: при быстром изменении формы применяется только последний layout */
  const layoutGenerationRef = useRef(0);

  // Получаем кубы из формы (Record → массив)
  const cubes = useMemo(() => {
    const cubesRecord = values?.Worker?.GraphConfig?.Cubes || {};
    return Object.values(cubesRecord);
  }, [values?.Worker?.GraphConfig?.Cubes]);

  // Отслеживаем изменение количества кубов
  // Layout пересчитается автоматически при изменении графа
  // Центрирование не нужно - пользователь уже видит нужную область
  const prevCubesCount = useRef(cubes.length);
  useEffect(() => {
    prevCubesCount.current = cubes.length;
  }, [cubes.length]);

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
    return Boolean(
      resharderResources &&
        typeof resharderResources === 'object' &&
        !Array.isArray(resharderResources) &&
        Object.keys(resharderResources).length > 0,
    );
  }, [values?.Resources?.Resharder]);

  useEffect(() => {
    if (!supervisorGraphMode || !experiment_id) {
      setLinkedDatasetAliases([]);
      setSelectedDatasetAliases([]);
      return;
    }
    let isCancelled = false;
    controlPlaneApi.experiment
      .v1ExperimentDatasetsList({ experiment_id })
      .then((response) => {
        if (isCancelled) return;
        const aliases = (response.data.datasets || [])
          .map((item) => (item.alias || '').trim())
          .filter(Boolean);
        const uniqueAliases = Array.from(new Set(aliases));
        setLinkedDatasetAliases(uniqueAliases);
        // Для демо-сценария сразу показываем датасорсы на графе
        setSelectedDatasetAliases((prev) =>
          prev.length > 0 ? prev : uniqueAliases,
        );
      })
      .catch(() => {
        if (!isCancelled) {
          setLinkedDatasetAliases([]);
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [supervisorGraphMode, experiment_id]);

  const graphData = useMemo(() => {
    if (supervisorGraphMode) {
      const cfg = JSON.stringify({
        experimentName: values.experimentName,
        models: values.models ?? [],
      });
      const parsed = parseGraphConfig(cfg, '', cubesList);
      if (!parsed) {
        return { nodes: [], edges: [] };
      }
      const sortedModels = (Array.isArray(values.models)
        ? values.models
        : []
      ).filter(
        (m): m is SupervisorModelLike =>
          m !== null && typeof m === 'object' && !Array.isArray(m),
      )
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const inputByModelNodeId = new Map<string, string[]>();
      const outputByModelNodeId = new Map<string, string[]>();
      const aliasesFromModels = new Set<string>();

      sortedModels.forEach((model, index) => {
        const nodeId = `cube_${stableSupervisorModelHash(index, model.modelId || `idx${index}`)}`;
        const params = parseExperimentModelParameters(model.parameters);
        const inputAliases = getDatasetAliases(params.input_datasets);
        const outputAliases = getDatasetAliases(params.output_datasets);
        inputByModelNodeId.set(nodeId, inputAliases);
        outputByModelNodeId.set(nodeId, outputAliases);
        inputAliases.forEach((alias) => aliasesFromModels.add(alias));
        outputAliases.forEach((alias) => aliasesFromModels.add(alias));
      });

      const allAliases = Array.from(
        new Set([
          ...selectedDatasetAliases,
          ...Array.from(aliasesFromModels),
        ]),
      );

      const datasetNodes = allAliases.map((alias) => ({
        id: makeDatasetNodeId(alias),
        label: `DS: ${alias}`,
        cubeHash: `dataset_${alias}`,
        cubeId: undefined,
        baseCubeName: 'Linked dataset',
        modelDescription:
          'Dataset linked to experiment. Connect to model input/output to pass data.',
        isDataset: true,
        hasError: false,
        errorCode: undefined,
        inputPorts: [{ name: 'in', hash: `dataset_in_${alias}` }],
        outputPorts: [{ name: 'out', hash: `dataset_out_${alias}` }],
        type: CubeType.CUBE,
      }));

      const datasetEdges = allAliases.flatMap((alias) => {
        const datasetNodeId = makeDatasetNodeId(alias);
        const inputEdges = Array.from(inputByModelNodeId.entries())
          .filter(([, aliases]) => aliases.includes(alias))
          .map(([modelNodeId]) => ({
            id: `edge_ds_in_${encodeURIComponent(alias)}_${modelNodeId}`,
            source: datasetNodeId,
            outputPortHash: `dataset_out_${alias}`,
            target: modelNodeId,
            inputPortHash: 'sv_in',
            edgeType: 'default' as const,
          }));
        const outputEdges = Array.from(outputByModelNodeId.entries())
          .filter(([, aliases]) => aliases.includes(alias))
          .map(([modelNodeId]) => ({
            id: `edge_ds_out_${modelNodeId}_${encodeURIComponent(alias)}`,
            source: modelNodeId,
            outputPortHash: 'sv_out',
            target: datasetNodeId,
            inputPortHash: `dataset_in_${alias}`,
            edgeType: 'default' as const,
          }));
        return [...inputEdges, ...outputEdges];
      });

      return {
        nodes: [...parsed.nodes, ...datasetNodes],
        edges: [...parsed.edges, ...datasetEdges],
      };
    }
    return buildGraphFromCubes(cubes, {
      resharderInputSources,
      hasResharderResources,
      cubesList,
    });
  }, [
    supervisorGraphMode,
    values.experimentName,
    values.models,
    linkedDatasetAliases,
    selectedDatasetAliases,
    cubes,
    hasResharderResources,
    resharderInputSources,
    cubesList,
  ]);

  useEffect(() => {
    if (!datasetModalOpen) return;
    setDatasetModalSelection(selectedDatasetAliases);
  }, [datasetModalOpen, selectedDatasetAliases]);

  const openDatasetModal = useCallback(() => {
    setDatasetModalSelection(selectedDatasetAliases);
    setDatasetModalOpen(true);
  }, [selectedDatasetAliases]);

  const applyDatasetModalSelection = useCallback(() => {
    setSelectedDatasetAliases(datasetModalSelection);
    setDatasetModalOpen(false);
  }, [datasetModalSelection]);

  // Создаём "структурный ключ" графа для определения необходимости пересчёта layout
  // Layout пересчитывается только при изменении структуры (количество нод, edges, портов)
  // При изменении только имён портов layout не пересчитывается
  const graphStructureKey = useMemo(() => {
    const nodesKey = graphData.nodes
      .map((n) => {
        const inputCount = n.inputPorts?.length ?? 0;
        const outputCount = n.outputPorts?.length ?? 0;
        return `${n.id}:${inputCount}:${outputCount}`;
      })
      .sort()
      .join('|');
    const edgesKey = graphData.edges
      .map(
        (e) =>
          `${e.source}|${e.outputPortHash ?? ''}|${e.target}|${e.inputPortHash ?? ''}`,
      )
      .sort()
      .join('||');
    return `${nodesKey}::${edgesKey}`;
  }, [graphData]);

  // Ref для отслеживания предыдущего структурного ключа
  const prevGraphStructureKeyRef = useRef<string>('');

  useEffect(() => {
    if (graphData.nodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const layoutGen = ++layoutGenerationRef.current;

    const structureChanged =
      prevGraphStructureKeyRef.current !== graphStructureKey;

    // Сразу поднимаем список рёбер до данных формы, не дожидаясь ELK — иначе после
    // удаления связи старый edge ещё долго висит в React Flow.
    const syncEdgesFromGraphData = () => {
      const nodeIds = new Set(nodes.map((n) => n.id));
      const next = graphEdgesToReactFlowEdges(graphData.edges).filter(
        (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
      );
      setEdges(next);
    };

    // Если структура не изменилась — обновляем только данные нод (имена портов)
    // без полного пересчёта позиций; рёбра всё равно пересобираем из graphData,
    // иначе после удаления связи остаются «висячие» линии из прошлого layout.
    if (!structureChanged && nodes.length > 0) {
      syncEdgesFromGraphData();
      const updatedNodes = nodes.map((existingNode) => {
        const newNodeData = graphData.nodes.find(
          (n) => n.id === existingNode.id,
        );
        if (newNodeData) {
          return {
            ...existingNode,
            data: {
              ...existingNode.data,
              label: newNodeData.label,
              inputPorts: newNodeData.inputPorts,
              outputPorts: newNodeData.outputPorts,
              hasError: newNodeData.hasError,
              errorCode: newNodeData.errorCode,
              cubeId: newNodeData.cubeId,
              baseCubeName: newNodeData.baseCubeName,
              modelDescription: newNodeData.modelDescription,
              isDataset: newNodeData.isDataset === true,
            },
          };
        }
        return existingNode;
      });
      setNodes(updatedNodes);

      layoutGraph(graphData.nodes, graphData.edges)
        .then(({ edges: layoutedEdges }) => {
          if (layoutGen !== layoutGenerationRef.current) return;
          setEdges(layoutedEdges);
        })
        .catch((err) => {
          console.error('ELK layout failed (edge sync):', err);
        });
      return;
    }

    // Структура изменилась — пересчитываем layout
    prevGraphStructureKeyRef.current = graphStructureKey;

    syncEdgesFromGraphData();

    // Используем ELK layout (асинхронный)
    layoutGraph(graphData.nodes, graphData.edges)
      .then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        if (layoutGen !== layoutGenerationRef.current) return;

        let finalNodes = layoutedNodes;

        // При первом рендере пытаемся использовать сохранённые позиции
        if (useSavedPositionsRef.current && initialCubeConfig) {
          useSavedPositionsRef.current = false;

          const cubeConfig = parseCubeConfig(initialCubeConfig);
          const savedPositions = createNodePositionsMap(cubeConfig);

          if (savedPositions.size > 0) {
            // Применяем сохранённые позиции к узлам
            // НЕ применяем к Resharder и Retrier - их позиции всегда вычисляются layout
            finalNodes = layoutedNodes.map((node) => {
              // Пропускаем Resharder и Retrier - их позиции не должны перезаписываться
              if (node.id === 'Resharder' || node.id === 'Retrier') {
                return node;
              }

              const cubeHash =
                (node.data?.cubeHash as string) ||
                node.id.replace(/^cube_/, '');
              const savedPos = savedPositions.get(cubeHash);

              if (savedPos) {
                return {
                  ...node,
                  position: { x: savedPos.x, y: savedPos.y },
                };
              }
              return node;
            });
          }
        }

        setNodes(finalNodes);
        setEdges(layoutedEdges);

        // Синхронизируем позиции узлов с effector store для сохранения
        const graphLayout = extractGraphLayout(finalNodes);
        if (graphLayout.nodes) {
          setGraphNodePositions(graphLayout.nodes);
        }
      })
      .catch((err) => {
        console.error('ELK layout failed:', err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData, graphStructureKey, setGraphNodePositions, initialCubeConfig]);

  // Обновляет куб в форме по hash
  const updateCubeInForm = useCallback(
    (cubeHash: string, updates: Partial<EditExperimentCube>) => {
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

  // Проверяет, является ли маппинг валидным и полностью заполненным
  const isValidMapping = useCallback(
    (mapping: EditCubeInputMapping | undefined): boolean => {
      if (!mapping) return false;

      // Проверяем что Type заполнен
      if (!mapping.Type) return false;

      // Для RETRY проверяем что RetryCubeHash заполнен (или RetryCube для обратной совместимости)
      if (mapping.Type === CubeType.RETRY) {
        return Boolean(mapping.RetryCubeHash || mapping.RetryCube);
      }

      // Проверяем что OutputPortHash заполнен
      if (!mapping.OutputPortHash) return false;

      // Для типа CUBE проверяем что OutputCubeHash тоже заполнен
      if (mapping.Type === CubeType.CUBE && !mapping.OutputCubeHash) {
        return false;
      }

      return true;
    },
    [],
  );

  // Обработчик создания соединения на графе
  const handleConnectionCreate = useCallback(
    (connection: ConnectionData) => {
      if (supervisorGraphMode) {
        const sourceAlias = getAliasFromDatasetNodeId(connection.sourceNodeId);
        const targetAlias = getAliasFromDatasetNodeId(connection.targetNodeId);
        const models = Array.isArray(values.models) ? [...values.models] : [];
        const sortedEntries = models
          .map((model, formIndex) => ({ model, formIndex }))
          .filter(
            (entry): entry is { model: SupervisorModelLike; formIndex: number } =>
              entry.model !== null &&
              typeof entry.model === 'object' &&
              !Array.isArray(entry.model),
          )
          .sort((a, b) => (a.model.order ?? 0) - (b.model.order ?? 0));

        const datasetAllowed = (alias: string | null): boolean => {
          if (!alias) return false;
          return (
            linkedDatasetAliases.includes(alias) ||
            selectedDatasetAliases.includes(alias)
          );
        };

        if (sourceAlias && datasetAllowed(sourceAlias)) {
          const modelEntry = sortedEntries.find(
            (entry, idx) =>
              `cube_${stableSupervisorModelHash(idx, entry.model.modelId || `idx${idx}`)}` ===
              connection.targetNodeId,
          );
          if (!modelEntry) return;
          const parsedParams = parseExperimentModelParameters(
            modelEntry.model.parameters,
          );
          const currentRaw = parsedParams.input_datasets;
          const current = getDatasetAliases(currentRaw);
          if (current.includes(sourceAlias)) return;
          const nextParams = {
            ...parsedParams,
            input_datasets: appendDatasetAlias(currentRaw, sourceAlias),
          };
          const nextModel = {
            ...modelEntry.model,
            parameters: serializeExperimentModelParameters(nextParams),
          };
          const nextModels = [...models];
          nextModels[modelEntry.formIndex] = nextModel;
          form.change('models', nextModels);
        } else if (targetAlias && datasetAllowed(targetAlias)) {
          const modelEntry = sortedEntries.find(
            (entry, idx) =>
              `cube_${stableSupervisorModelHash(idx, entry.model.modelId || `idx${idx}`)}` ===
              connection.sourceNodeId,
          );
          if (!modelEntry) return;
          const parsedParams = parseExperimentModelParameters(
            modelEntry.model.parameters,
          );
          const currentRaw = parsedParams.output_datasets;
          const current = getDatasetAliases(currentRaw);
          if (current.includes(targetAlias)) return;
          const nextParams = {
            ...parsedParams,
            output_datasets: appendDatasetAlias(currentRaw, targetAlias),
          };
          const nextModel = {
            ...modelEntry.model,
            parameters: serializeExperimentModelParameters(nextParams),
          };
          const nextModels = [...models];
          nextModels[modelEntry.formIndex] = nextModel;
          form.change('models', nextModels);
        }
        return;
      }
      const { sourcePortHash, targetPortHash } = connection;

      // nodeId имеет формат "cube_{hash}", убираем префикс для поиска
      const targetCubeHash = connection.targetNodeId.replace(/^cube_/, '');
      const targetCube = cubes.find((c) => c.Hash === targetCubeHash);
      if (!targetCube) {
        return;
      }

      // Проверяем, не занят ли уже этот входной порт валидным маппингом
      const existingMapping = targetCube.InputsMapping?.[targetPortHash];

      if (isValidMapping(existingMapping)) {
        return;
      }

      // Определяем тип источника
      const isFromResharder = connection.sourceNodeId === 'Resharder';
      const isFromRetrier = connection.sourceNodeId === 'Retrier';

      // Создаём маппинг в зависимости от источника
      let newMapping: EditCubeInputMapping;

      if (isFromResharder) {
        // Из Resharder: Type = Resharder, OutputPortHash
        newMapping = {
          Type: CubeType.RESHARDER,
          OutputPortHash: sourcePortHash,
        };
      } else if (isFromRetrier) {
        // Из Retrier: Type = CIT_RETRY, RetryCubeHash = hash retry куба
        // sourcePortHash имеет формат: retrier_{retryCubeHash}
        // Используем hash вместо имени, чтобы маппинг не рвался при изменении имени
        const retryCubeHash = sourcePortHash.replace(/^retrier_/, '');

        newMapping = {
          Type: CubeType.RETRY,
          RetryCubeHash: retryCubeHash,
        };
      } else {
        // Из обычного куба (включая Retry кубы): Type = Cube, OutputCubeHash, OutputPortHash
        // Retry куб имеет обычные input/output порты, поэтому связь как с обычным кубом
        // Убираем префикс cube_ из sourceNodeId для сохранения чистого hash
        const sourceCubeHash = connection.sourceNodeId.replace(/^cube_/, '');
        newMapping = {
          Type: CubeType.CUBE,
          OutputCubeHash: sourceCubeHash,
          OutputPortHash: sourcePortHash,
        };
      }

      // Обновляем InputsMapping куба через форму
      updateCubeInForm(targetCube.Hash, {
        InputsMapping: {
          ...targetCube.InputsMapping,
          [targetPortHash]: newMapping,
        },
      });

      // Layout пересчитается автоматически при изменении графа
      // Центрирование не нужно - пользователь уже видит нужную область
    },
    [
      supervisorGraphMode,
      values.models,
      linkedDatasetAliases,
      selectedDatasetAliases,
      form,
      cubes,
      updateCubeInForm,
      isValidMapping,
    ],
  );

  // Обработчик удаления соединения на графе
  const handleConnectionDelete = useCallback(
    (connection: ConnectionData) => {
      if (supervisorGraphMode) {
        const sourceAlias = getAliasFromDatasetNodeId(connection.sourceNodeId);
        const targetAlias = getAliasFromDatasetNodeId(connection.targetNodeId);
        const models = Array.isArray(values.models) ? [...values.models] : [];
        const sortedEntries = models
          .map((model, formIndex) => ({ model, formIndex }))
          .filter(
            (entry): entry is { model: SupervisorModelLike; formIndex: number } =>
              entry.model !== null &&
              typeof entry.model === 'object' &&
              !Array.isArray(entry.model),
          )
          .sort((a, b) => (a.model.order ?? 0) - (b.model.order ?? 0));

        if (sourceAlias) {
          const modelEntry = sortedEntries.find(
            (entry, idx) =>
              `cube_${stableSupervisorModelHash(idx, entry.model.modelId || `idx${idx}`)}` ===
              connection.targetNodeId,
          );
          if (!modelEntry) return;
          const parsedParams = parseExperimentModelParameters(
            modelEntry.model.parameters,
          );
          const currentRaw = parsedParams.input_datasets;
          const current = getDatasetAliases(currentRaw);
          const next = current.filter((alias) => alias !== sourceAlias);
          if (next.length === current.length) return;
          const nextParams = {
            ...parsedParams,
            input_datasets: removeDatasetAlias(currentRaw, sourceAlias),
          };
          const nextModel = {
            ...modelEntry.model,
            parameters: serializeExperimentModelParameters(nextParams),
          };
          const nextModels = [...models];
          nextModels[modelEntry.formIndex] = nextModel;
          form.change('models', nextModels);
        } else if (targetAlias) {
          const modelEntry = sortedEntries.find(
            (entry, idx) =>
              `cube_${stableSupervisorModelHash(idx, entry.model.modelId || `idx${idx}`)}` ===
              connection.sourceNodeId,
          );
          if (!modelEntry) return;
          const parsedParams = parseExperimentModelParameters(
            modelEntry.model.parameters,
          );
          const currentRaw = parsedParams.output_datasets;
          const current = getDatasetAliases(currentRaw);
          const next = current.filter((alias) => alias !== targetAlias);
          if (next.length === current.length) return;
          const nextParams = {
            ...parsedParams,
            output_datasets: removeDatasetAlias(currentRaw, targetAlias),
          };
          const nextModel = {
            ...modelEntry.model,
            parameters: serializeExperimentModelParameters(nextParams),
          };
          const nextModels = [...models];
          nextModels[modelEntry.formIndex] = nextModel;
          form.change('models', nextModels);
        }
        return;
      }
      const { targetPortHash } = connection;

      // Находим целевой куб (nodeId имеет формат "cube_{hash}", убираем префикс)
      const targetCubeHash = connection.targetNodeId.replace(/^cube_/, '');
      const targetCube = cubes.find((c) => c.Hash === targetCubeHash);
      if (!targetCube) return;

      // Удаляем маппинг по targetPortHash (это hash входного порта)
      const newInputsMapping = { ...targetCube.InputsMapping };
      delete newInputsMapping[targetPortHash];

      updateCubeInForm(targetCube.Hash, {
        InputsMapping: newInputsMapping,
      });

      // Layout пересчитается автоматически при изменении графа
      // Центрирование не нужно - пользователь уже видит нужную область
    },
    [supervisorGraphMode, values.models, form, cubes, updateCubeInForm],
  );

  return (
    <Flex
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {supervisorGraphMode ? (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 3,
          }}
        >
          <Button view="outlined-action" size="m" onClick={openDatasetModal}>
            <Button.Icon>
              <Plus />
            </Button.Icon>
            Добавить датасорсы
          </Button>
        </div>
      ) : null}
      <Graph
        nodes={nodes}
        edges={edges}
        selectedCubeHash={selectedCubeHash}
        centerOnCubeHash={centerOnCubeHash}
        onCubeClick={onCubeClick}
        onCubeDelete={onCubeDelete}
        onResharderClick={onResharderClick}
        onConnectionCreate={handleConnectionCreate}
        onConnectionDelete={handleConnectionDelete}
        isEditable
        allowKeyboardCubeDelete={supervisorGraphMode}
        experiment_id={experiment_id}
        experiment_name={experiment_name}
        variables={variables}
      />
      <Dialog
        open={datasetModalOpen}
        onClose={() => setDatasetModalOpen(false)}
        size="m"
        className="sf-dialog"
      >
        <Dialog.Header caption="Датасорсы на графе" />
        <Dialog.Body>
          <Flex direction="column" gap={2}>
            <Text variant="body-2" color="secondary">
              Показывать на графе можно только датасеты, привязанные к
              эксперименту.
            </Text>
            <Select
              value={datasetModalSelection}
              onUpdate={(values) => setDatasetModalSelection(values)}
              filterable
              width="max"
              size="m"
              placeholder="Выберите датасорсы"
              hasClear
            >
              {linkedDatasetAliases.map((alias) => (
                <Select.Option key={alias} value={alias}>
                  {alias}
                </Select.Option>
              ))}
            </Select>
          </Flex>
        </Dialog.Body>
        <Dialog.Footer>
          <Flex justifyContent="flex-end" gap={2} style={{ width: '100%' }}>
            <Button view="normal" size="l" onClick={() => setDatasetModalOpen(false)}>
              Отмена
            </Button>
            <Button view="action" size="l" onClick={applyDatasetModalSelection}>
              Применить
            </Button>
          </Flex>
        </Dialog.Footer>
      </Dialog>
    </Flex>
  );
};
