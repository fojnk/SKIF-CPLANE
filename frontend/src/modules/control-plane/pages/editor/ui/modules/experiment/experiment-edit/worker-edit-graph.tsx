import { Flex } from '@gravity-ui/uikit';
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
  layoutGraph,
  parseCubeConfig,
  parseGraphConfig,
  type EditCubeInputMapping,
  type EditExperimentCube,
  type PortInfo,
} from '@/modules/control-plane/entities/cubes';
import { editorPageModel } from '@/modules/control-plane/pages/editor';
import {
  Graph,
  type ConnectionData,
} from '@/modules/control-plane/shared/components/graph/experiment';
import {
  CubeListDC,
  ExperimentVariableItem,
} from '@/modules/control-plane/shared/types';

import type { ExperimentFormValues } from './utils';

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

  // Флаг: использовать ли сохранённые позиции (только при первом рендере)
  const useSavedPositionsRef = useRef(true);

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
      return { nodes: parsed.nodes, edges: parsed.edges };
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
    cubes,
    hasResharderResources,
    resharderInputSources,
    cubesList,
  ]);

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
      .map((e) => `${e.source}->${e.target}`)
      .sort()
      .join('|');
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

    const structureChanged =
      prevGraphStructureKeyRef.current !== graphStructureKey;

    // Если структура не изменилась — обновляем только данные нод (имена портов)
    // без пересчёта layout
    if (!structureChanged && nodes.length > 0) {
      // Обновляем данные нод, сохраняя текущие позиции
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
            },
          };
        }
        return existingNode;
      });
      setNodes(updatedNodes);
      return;
    }

    // Структура изменилась — пересчитываем layout
    prevGraphStructureKeyRef.current = graphStructureKey;

    // Используем ELK layout (асинхронный)
    layoutGraph(graphData.nodes, graphData.edges)
      .then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
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
    [supervisorGraphMode, cubes, updateCubeInForm, isValidMapping],
  );

  // Обработчик удаления соединения на графе
  const handleConnectionDelete = useCallback(
    (connection: ConnectionData) => {
      if (supervisorGraphMode) {
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
    [supervisorGraphMode, cubes, updateCubeInForm],
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
        isEditable={!supervisorGraphMode}
        allowKeyboardCubeDelete={supervisorGraphMode}
        experiment_id={experiment_id}
        experiment_name={experiment_name}
        variables={variables}
      />
    </Flex>
  );
};
