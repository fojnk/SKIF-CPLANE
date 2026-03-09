import { Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { parseGraphConfig } from '@/modules/stream-flow/entities/cubes';
import { ExperimentVariablesModel } from '@/modules/stream-flow/entities/variables/list';
import { ResharderViewModel } from '@/modules/stream-flow/features/cubes/resharder-view';
import { VariableShowModel } from '@/modules/stream-flow/features/variable/version/show';
import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { getFormInitialValues } from '@/modules/stream-flow/shared/components/forms';
import {
  ParamsDC,
  ExperimentVariableItem,
} from '@/modules/stream-flow/shared/types';

import { ExperimentViewTabs, TabId } from './experiment-view-tabs';
import { WorkerViewGraph } from './worker-view-graph';

interface Props {
  formData: ParamsDC[];
  config: string;
  /** JSON строка с информацией о кубах (additional_information) */
  cubeConfig: string;
  experiment_id?: number;
}

export const ExperimentFormViewer = ({
  formData,
  config,
  cubeConfig,
  experiment_id,
}: Props) => {
  const [selectedCubeHash, setSelectedCubeHash] = useState<string | null>(null);
  // Отдельное состояние для центрирования — меняется только при явном запросе (NodesRight)
  const [centerOnCubeHash, setCenterOnCubeHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('experiment');
  const [focusedParam] = useState<string | null>(null);
  const cubesList = useUnit(projectPageModel.experiment.cubes.$data);

  // Загрузка переменных для experiment
  const variablesData = useUnit(ExperimentVariablesModel.list.$data);
  const loadVariables = useUnit(ExperimentVariablesModel.list.load);
  const showVariable = useUnit(VariableShowModel.start);
  const showResharder = useUnit(ResharderViewModel.start);

  // Загружаем переменные при монтировании
  useEffect(() => {
    if (experiment_id) {
      loadVariables(experiment_id);
    }
  }, [experiment_id, loadVariables]);

  // Создаём список имён переменных
  const variableNames = useMemo(() => {
    if (!variablesData || variablesData.length === 0) return undefined;
    return variablesData.map((v) => v.name);
  }, [variablesData]);

  // Обработчик клика по переменной
  const handleVariableClick = useCallback(
    (variableName: string) => {
      if (!variablesData) return;

      // Находим переменную по имени
      const variable = variablesData.find((v) => v.name === variableName);
      if (!variable) return;

      // Открываем модалку просмотра переменной
      showVariable({
        item: variable as ExperimentVariableItem,
        canEdit: false,
        mode: 'view',
        head: true,
      });
    },
    [variablesData, showVariable],
  );

  // Парсим граф с использованием нового формата (config + cubeConfig)
  // CubeID теперь берётся из cubeConfig (additional_information)
  const graphData = useMemo(() => {
    try {
      return parseGraphConfig(config, cubeConfig, cubesList ?? []);
    } catch (error) {
      console.error('Failed to parse graph config:', error);
      return null;
    }
  }, [config, cubeConfig, cubesList]);

  // Получаем начальные значения из конфига
  const initialValues = useMemo(() => {
    return getFormInitialValues(config, formData, false);
  }, [config, formData]);

  // Обработчик клика по Resharder на графе
  const handleResharderClick = useCallback(() => {
    showResharder({
      formData,
      config,
      initialValues,
      variableNames,
      onVariableClick: handleVariableClick,
    });
  }, [
    formData,
    config,
    initialValues,
    variableNames,
    handleVariableClick,
    showResharder,
  ]);

  // Обработчик клика по кубу на графе — только выделяем, без центрирования
  const handleCubeClick = useCallback((cubeHash: string | null) => {
    setSelectedCubeHash(cubeHash);
    // Не вызываем setCenterOnCubeHash — центрирование не нужно
  }, []);

  // Обработчик выбора куба из списка (кнопка NodesRight) — выделяем И центрируем
  const handleCubeSelect = useCallback((cubeHash: string | null) => {
    setSelectedCubeHash(cubeHash);
    setCenterOnCubeHash(cubeHash);
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
        borderTop: '1px solid var(--g-color-line-generic)',
      }}
    >
      <WorkerViewGraph
        graphData={graphData}
        selectedCubeHash={selectedCubeHash}
        centerOnCubeHash={centerOnCubeHash}
        onCubeClick={handleCubeClick}
        onResharderClick={handleResharderClick}
        experiment_id={experiment_id}
      />
      <ExperimentViewTabs
        formData={formData}
        config={config}
        cubeConfig={cubeConfig}
        selectedCubeHash={selectedCubeHash}
        graphData={graphData}
        onCubeSelect={handleCubeSelect}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        focusedParam={focusedParam}
        variableNames={variableNames}
        onVariableClick={handleVariableClick}
      />
    </Flex>
  );
};
