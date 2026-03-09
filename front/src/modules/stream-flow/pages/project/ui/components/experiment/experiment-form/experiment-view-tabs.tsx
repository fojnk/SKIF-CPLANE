import { Flex, Tab, TabList, TabProvider, Text } from '@gravity-ui/uikit';
import React, { useCallback, useEffect, useState } from 'react';

import type { CubesGraphParamsWithDebug } from '@/modules/stream-flow/entities/cubes';
import {
  FormParamView,
  getFormInitialValues,
} from '@/modules/stream-flow/shared/components/forms';
import { ParamsDC } from '@/modules/stream-flow/shared/types';
import { ResizablePanel } from '@/modules/stream-flow/shared/ui/resizer';

import { WorkerViewCubes } from './worker-view-cubes';

export type TabId = 'experiment' | 'worker' | 'cubes';

interface Props {
  formData: ParamsDC[];
  config: string;
  cubeConfig: string;
  selectedCubeHash?: string | null;
  graphData: CubesGraphParamsWithDebug | null;
  onCubeSelect?: (cubeHash: string | null) => void;
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
  focusedParam?: string | null;
  /** Список имён доступных переменных для подсветки ${variableName} */
  variableNames?: string[];
  /** Callback при клике на переменную */
  onVariableClick?: (variableName: string) => void;
}

export const ExperimentViewTabs = ({
  formData,
  config,
  cubeConfig,
  selectedCubeHash,
  graphData,
  onCubeSelect,
  activeTab: externalActiveTab,
  onTabChange,
  focusedParam,
  variableNames,
  onVariableClick,
}: Props) => {
  const [internalActiveTab, setInternalActiveTab] =
    useState<TabId>('experiment');
  const [showPanel, setShowPanel] = useState(true);

  // Используем внешнее состояние если передано
  const activeTab = externalActiveTab ?? internalActiveTab;
  const setActiveTab = useCallback(
    (tab: TabId) => {
      if (onTabChange) {
        onTabChange(tab);
      } else {
        setInternalActiveTab(tab);
      }
    },
    [onTabChange],
  );

  const togglePanel = () => setShowPanel((prev) => !prev);

  // При клике на кубе в графе — переключаемся на таб Cubes
  useEffect(() => {
    if (selectedCubeHash) {
      setActiveTab('cubes');
      // Также открываем панель если она скрыта
      setShowPanel(true);
    }
  }, [selectedCubeHash, setActiveTab]);

  // При изменении focusedParam — открываем панель
  useEffect(() => {
    if (focusedParam) {
      setShowPanel(true);
    }
  }, [focusedParam]);

  // Получаем начальные значения из конфига
  const initialValues = getFormInitialValues(config, formData, false);

  // Experiment параметры (без Worker)
  const experimentParams = formData.filter((param) => param.name !== 'Worker');
  const isExperimentEmpty = experimentParams.length === 0;

  // Worker параметры
  const workerParam = formData.find((param) => param.name === 'Worker');
  const workerStructParams = workerParam?.type?.struct_params || [];
  const sortedWorkerParams = [...workerStructParams].sort((a, b) => {
    const aIsStruct = a.type?.type === 'struct';
    const bIsStruct = b.type?.type === 'struct';
    if (aIsStruct && !bIsStruct) return 1;
    if (!aIsStruct && bIsStruct) return -1;
    return 0;
  });
  const isWorkerEmpty = !workerParam || sortedWorkerParams.length === 0;
  const workerInitValue =
    workerParam && 'Worker' in initialValues
      ? initialValues['Worker']
      : undefined;

  // Количество кубов для отображения в табе
  const cubesCount = graphData?.validatedCubes?.length ?? 0;

  const tabs = [
    {
      id: 'experiment' as TabId,
      title: 'Experiment Config',
    },
    { id: 'worker' as TabId, title: 'Worker' },
    { id: 'cubes' as TabId, title: `Models (${cubesCount})` },
  ];

  return (
    <TabProvider
      value={activeTab}
      onUpdate={(value) => setActiveTab(value as TabId)}
    >
      <ResizablePanel
        pageId="experiment-view-tabs-size"
        resizerPosition="left"
        showPanel={showPanel}
        togglePanel={togglePanel}
        header={
          <TabList size="m" style={{ width: '100%', padding: '0 18px' }}>
            {tabs.map((tab) => (
              <Tab key={tab.id} value={tab.id}>
                {tab.title}
              </Tab>
            ))}
          </TabList>
        }
      >
        {/* Все табы рендерятся одновременно, скрываются через display: none */}
        <Flex
          direction="column"
          style={{ display: activeTab === 'experiment' ? 'flex' : 'none' }}
        >
          {isExperimentEmpty ? (
            <Text variant="subheader-1" color="secondary">
              Empty config
            </Text>
          ) : (
            <FormParamView
              params={experimentParams}
              values={initialValues}
              disclosure
              defaultOpen={!focusedParam}
              focusedParam={focusedParam}
              variableNames={variableNames}
              onVariableClick={onVariableClick}
            />
          )}
        </Flex>

        <Flex
          direction="column"
          style={{ display: activeTab === 'worker' ? 'flex' : 'none' }}
        >
          {isWorkerEmpty ? (
            <Text variant="subheader-1" color="secondary">
              Empty config
            </Text>
          ) : (
            <FormParamView
              params={sortedWorkerParams}
              values={
                workerInitValue && typeof workerInitValue === 'object'
                  ? (workerInitValue as Record<string, unknown>)
                  : {}
              }
              disclosure
              defaultOpen
              variableNames={variableNames}
              onVariableClick={onVariableClick}
            />
          )}
        </Flex>

        <Flex
          direction="column"
          style={{ display: activeTab === 'cubes' ? 'flex' : 'none' }}
        >
          <WorkerViewCubes
            selectedCubeHash={selectedCubeHash}
            graphData={graphData}
            config={config}
            cubeConfig={cubeConfig}
            onCubeSelect={onCubeSelect}
            variableNames={variableNames}
            onVariableClick={onVariableClick}
          />
        </Flex>
      </ResizablePanel>
    </TabProvider>
  );
};
