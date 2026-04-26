import { Flex } from '@gravity-ui/uikit';
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
  CubeType,
  EditExperimentCube,
  PortInfo,
} from '@/modules/control-plane/entities/cubes';
import { ResharderEditModel } from '@/modules/control-plane/features/cubes/resharder-edit';
import { ActionConfirmModel } from '@/modules/control-plane/features/dialogs';
import {
  ExperimentDebug,
  ExperimentDebugModel,
} from '@/modules/control-plane/features/experiment/debug';
import { editorPageModel } from '@/modules/control-plane/pages/editor';
import {
  ParamsDC,
  ExperimentVariableItem,
} from '@/modules/control-plane/shared/types';

import { ExperimentEditTabs, TabId } from './experiment-edit-tabs';
import { ExperimentFormValues, hasWorkerParam } from './utils';
import { WorkerEditGraph } from './worker-edit-graph';

interface Props {
  formData: ParamsDC[];
  experiment_id: number;
  experiment_name: string;
  variables?: ExperimentVariableItem[] | null;
  debugMode?: boolean;
  currentConfig: string;
}

export const ExperimentEditForm = ({
  formData,
  experiment_id,
  experiment_name,
  variables,
  debugMode = false,
  currentConfig,
}: Props) => {
  const form = useForm();
  const { values } = useFormState({
    subscription: { values: true },
  }) as { values: ExperimentFormValues };

  const [cubesList] = useUnit([editorPageModel.cubes.$data]);

  const [selectedCubeHash, setSelectedCubeHash] = useState<string | null>(null);
  // Отдельное состояние для центрирования — меняется только при явном запросе (NodesRight)
  const [centerOnCubeHash, setCenterOnCubeHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('experiment');
  const [focusedParam, setFocusedParam] = useState<string | null>(null);

  const isStreamflowPipeline = hasWorkerParam(formData);

  // Создаём Set с именами переменных для валидации ${variableName}
  const variableNames = useMemo(() => {
    if (!variables || variables.length === 0) return undefined;
    return new Set(variables.map((v) => v.name));
  }, [variables]);

  const showResharder = useUnit(ResharderEditModel.start);

  // Удаляет куб из формы и очищает все маппинги, ссылающиеся на него:
  // - CIT_CUBE маппинги где OutputCubeHash === cubeHash
  // - CIT_RETRY маппинги где RetryCube === имя удаляемого retry куба
  const removeCubeFromForm = useCallback(
    (cubeHash: string) => {
      const currentCubes = values?.Worker?.GraphConfig?.Cubes || {};
      const cubeToRemove = currentCubes[cubeHash];

      // Получаем данные удаляемого куба
      const removedCubeName = cubeToRemove?.Name;
      const isRetryCube = cubeToRemove?.CubeType === CubeType.RETRY;

      // Создаём новый объект без удалённого куба
      const { [cubeHash]: _removed, ...remainingCubes } = currentCubes;

      // Очищаем все маппинги, ссылающиеся на удалённый куб
      const updatedCubes = Object.fromEntries(
        Object.entries(remainingCubes).map(([hash, cube]) => {
          const typedCube = cube as EditExperimentCube;
          if (!typedCube.InputsMapping) {
            return [hash, cube];
          }

          // Фильтруем маппинги — удаляем те, которые ссылаются на удалённый куб
          const filteredMappings = Object.fromEntries(
            Object.entries(typedCube.InputsMapping).filter(([, mapping]) => {
              // Удаляем CIT_CUBE маппинги, ссылающиеся на удалённый куб по hash
              if (
                mapping.Type === CubeType.CUBE &&
                mapping.OutputCubeHash === cubeHash
              ) {
                return false;
              }
              // Удаляем CIT_RETRY маппинги, ссылающиеся на удалённый retry куб по hash или имени (для обратной совместимости)
              if (
                isRetryCube &&
                mapping.Type === CubeType.RETRY &&
                (mapping.RetryCubeHash === cubeHash ||
                  (removedCubeName && mapping.RetryCube === removedCubeName))
              ) {
                return false;
              }
              return true;
            }),
          );

          return [hash, { ...typedCube, InputsMapping: filteredMappings }];
        }),
      );

      form.change('Worker.GraphConfig.Cubes', updatedCubes);

      // Сбрасываем выделение если удалили выделенный куб
      if (selectedCubeHash === cubeHash) {
        setSelectedCubeHash(null);
      }
    },
    [form, values?.Worker?.GraphConfig?.Cubes, selectedCubeHash],
  );

  // Подписываемся на подтверждение удаления куба (для горячих клавиш с графа)
  useEffect(() => {
    if (!isStreamflowPipeline) {
      return undefined;
    }
    const unsubscribe = ActionConfirmModel.confirmed.watch((payload) => {
      if (payload.mode === 'delete' && payload.meta?.cubeHash) {
        const cubeHash = payload.meta.cubeHash as string;
        removeCubeFromForm(cubeHash);
      }
    });
    return () => unsubscribe();
  }, [isStreamflowPipeline, removeCubeFromForm]);

  // Получаем текущие порты Resharder
  // Важно: порт остается в списке, даже если имя пустое (пока есть portHash)
  // Это предотвращает разрыв связей при временном удалении имени
  // Приоритет имени: OutputName > SourceName
  const resharderInputSources = useMemo(() => {
    const sources: PortInfo[] = [];
    const inputSources = values?.Resharder?.InputSources;
    if (Array.isArray(inputSources)) {
      inputSources.forEach((source) => {
        // Порт остается, если есть portHash (даже если имя пустое)
        // onBlur автоматически восстановит имя при потере фокуса
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

  // Отслеживаем удаление портов Resharder и очищаем связанные маппинги
  const prevResharderPortHashes = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!isStreamflowPipeline) {
      return;
    }
    const currentHashes = new Set(resharderInputSources.map((p) => p.hash));
    const prevHashes = prevResharderPortHashes.current;

    // Находим удалённые порты
    const removedHashes: string[] = [];
    prevHashes.forEach((hash) => {
      if (!currentHashes.has(hash)) {
        removedHashes.push(hash);
      }
    });

    // Если есть удалённые порты — очищаем маппинги
    if (removedHashes.length > 0) {
      const currentCubes = values?.Worker?.GraphConfig?.Cubes || {};
      const updatedCubes = Object.fromEntries(
        Object.entries(currentCubes).map(([hash, cube]) => {
          const typedCube = cube as EditExperimentCube;
          if (!typedCube.InputsMapping) {
            return [hash, cube];
          }

          // Фильтруем маппинги — удаляем CIT_RESHARDER с удалёнными портами
          const filteredMappings = Object.fromEntries(
            Object.entries(typedCube.InputsMapping).filter(([, mapping]) => {
              if (
                mapping.Type === CubeType.RESHARDER &&
                mapping.OutputPortHash &&
                removedHashes.includes(mapping.OutputPortHash)
              ) {
                return false;
              }
              return true;
            }),
          );

          return [hash, { ...typedCube, InputsMapping: filteredMappings }];
        }),
      );

      form.change('Worker.GraphConfig.Cubes', updatedCubes);
    }

    // Обновляем ref
    prevResharderPortHashes.current = currentHashes;
  }, [
    isStreamflowPipeline,
    resharderInputSources,
    values?.Worker?.GraphConfig?.Cubes,
    form,
  ]);

  // Обработчик клика по Resharder — открываем модалку редактирования
  const handleResharderClick = useCallback(() => {
    showResharder({
      formData,
      config: '', // Не используется в режиме редактирования
      initialValues: values || {},
      form,
      variableNames,
    });
  }, [formData, values, form, variableNames, showResharder]);

  // Обработчик выбора куба из списка (кнопка NodesRight) — выделяем И центрируем
  const handleCubeSelect = useCallback((cubeHash: string | null) => {
    setSelectedCubeHash(cubeHash);
    setCenterOnCubeHash(cubeHash);
  }, []);

  // Обработчик клика по кубу на графе — только выделяем, без центрирования
  const handleCubeClick = useCallback(
    (cubeHash: string | null) => {
      setSelectedCubeHash(cubeHash);
      if (!isStreamflowPipeline || !cubeHash) {
        return;
      }
      const cubes = values?.Worker?.GraphConfig?.Cubes;
      const cubeName = cubes?.[cubeHash]?.Name;
      if (cubeName) {
        ExperimentDebugModel.handleCubeClick(cubeName);
      }
    },
    [isStreamflowPipeline, values?.Worker?.GraphConfig?.Cubes],
  );

  // Обработчик удаления куба по горячей клавише — показываем диалог подтверждения
  const handleCubeDelete = useCallback((cubeHash: string, cubeName: string) => {
    ActionConfirmModel.start({
      mode: 'delete',
      name: `cube ${cubeName}`,
      meta: { cubeHash },
    });
  }, []);

  return (
    <Flex
      direction="row"
      gapRow={3}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
      }}
    >
      <Flex
        direction="column"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Flex
          direction="column"
          style={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
          }}
        >
          <WorkerEditGraph
            selectedCubeHash={selectedCubeHash}
            centerOnCubeHash={centerOnCubeHash}
            onCubeClick={handleCubeClick}
            onCubeDelete={handleCubeDelete}
            onResharderClick={handleResharderClick}
            experiment_id={experiment_id}
            experiment_name={experiment_name}
            variables={variables}
            cubesList={cubesList ?? []}
            supervisorGraphMode={!isStreamflowPipeline}
          />
          {debugMode && (
            <ExperimentDebug
              debugMode={debugMode}
              experiment_id={experiment_id}
              experiment_name={experiment_name}
              config={currentConfig}
            />
          )}
        </Flex>
      </Flex>

      <ExperimentEditTabs
        formData={formData}
        selectedCubeHash={selectedCubeHash}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        focusedParam={focusedParam}
        onFocusedParamChange={setFocusedParam}
        onCubeSelect={handleCubeSelect}
        variableNames={variableNames}
      />
    </Flex>
  );
};
