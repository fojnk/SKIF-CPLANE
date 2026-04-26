import { TriangleExclamation } from '@gravity-ui/icons';
import {
  Button,
  Flex,
  Icon,
  Tab,
  TabList,
  TabProvider,
  Text,
} from '@gravity-ui/uikit';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { supervisorModelFromBaseCube } from '@/modules/control-plane/entities/cubes';
import { ShowCubesMarketModel } from '@/modules/control-plane/features/cubes/market';
import { FormParamEdit } from '@/modules/control-plane/shared/components/forms';
import { ParamsDC } from '@/modules/control-plane/shared/types';
import { ResizablePanel } from '@/modules/control-plane/shared/ui/resizer';

import {
  getExperimentParams,
  getWorkerParam,
  getWorkerStructParams,
  hasWorkerParam,
  ExperimentFormValues,
} from './utils';
import { WorkerEditConfigCubes } from './worker-edit-cubes';

/** models[] только из маркетплейса — без ручного «Add Item» в форме */
const EXPERIMENT_MODELS_ARRAY_NO_MANUAL_ADD: readonly string[] = ['models'];

export type TabId = 'experiment' | 'worker' | 'cubes';

interface Props {
  formData: ParamsDC[];
  selectedCubeHash?: string | null;
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
  focusedParam?: string | null;
  onFocusedParamChange?: (param: string | null) => void;
  onCubeSelect?: (cubeHash: string | null) => void;
  /** Список имён доступных переменных для валидации ${variableName} */
  variableNames?: Set<string>;
}

export const ExperimentEditTabs = ({
  formData,
  selectedCubeHash,
  activeTab: externalActiveTab,
  onTabChange,
  focusedParam,
  onFocusedParamChange,
  onCubeSelect,
  variableNames,
}: Props) => {
  // Внутреннее состояние таба, синхронизируется с внешним
  const [internalActiveTab, setInternalActiveTab] = useState<TabId>(
    externalActiveTab || 'experiment',
  );
  const [showPanel, setShowPanel] = useState(true);

  const togglePanel = () => setShowPanel((prev) => !prev);

  const hasWorker = hasWorkerParam(formData);

  const form = useForm();

  const { values } = useFormState({
    subscription: { values: true },
  }) as { values: ExperimentFormValues };

  const experimentParams = getExperimentParams(formData);
  const hasModelsParam = experimentParams.some((p) => p.name === 'models');

  useEffect(() => {
    if (!hasModelsParam) {
      return undefined;
    }
    const unsubscribe = ShowCubesMarketModel.checkout.watch((cube) => {
      const state = form.getState();
      const current = state.values as ExperimentFormValues;
      const models = Array.isArray(current.models) ? [...current.models] : [];
      const nextOrder =
        models.length > 0
          ? Math.max(
              ...models.map((m) => {
                if (!m || typeof m !== 'object' || !('order' in m)) {
                  return 0;
                }
                const raw = (m as { order?: unknown }).order;
                const n = typeof raw === 'number' ? raw : Number(raw);
                return Number.isFinite(n) ? n : 0;
              }),
            ) + 1
          : 1;
      const row = supervisorModelFromBaseCube(cube, nextOrder);
      if (row) {
        form.change('models', [...models, row]);
      }
    });
    return () => unsubscribe();
  }, [form, hasModelsParam]);

  // Синхронизация с внешним activeTab
  useEffect(() => {
    if (externalActiveTab && externalActiveTab !== internalActiveTab) {
      setInternalActiveTab(externalActiveTab);
    }
  }, [externalActiveTab, internalActiveTab]);

  // Обработчик смены таба
  const handleTabChange = (tab: TabId) => {
    setInternalActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
    // Сбрасываем focusedParam при ручном переключении таба
    if (onFocusedParamChange) {
      onFocusedParamChange(null);
    }
  };

  // При изменении selectedCubeHash переключаемся на таб cubes и открываем панель
  useEffect(() => {
    if (!hasWorker) {
      return;
    }
    if (selectedCubeHash) {
      setInternalActiveTab('cubes');
      setShowPanel(true);
      if (onTabChange) {
        onTabChange('cubes');
      }
    }
  }, [hasWorker, selectedCubeHash, onTabChange]);

  // Режим только Meta/models: не оставляем открытыми табы Worker/Cubes
  useEffect(() => {
    if (
      !hasWorker &&
      (internalActiveTab === 'worker' || internalActiveTab === 'cubes')
    ) {
      setInternalActiveTab('experiment');
      onTabChange?.('experiment');
    }
  }, [hasWorker, internalActiveTab, onTabChange]);

  // При изменении focusedParam — открываем панель
  useEffect(() => {
    if (focusedParam) {
      setShowPanel(true);
    }
  }, [focusedParam]);

  const workerParam = getWorkerParam(formData);
  const sortedWorkerParams = getWorkerStructParams(formData);

  const isExperimentEmpty = experimentParams.length === 0;
  const isWorkerEmpty = !workerParam || sortedWorkerParams.length === 0;

  // Количество кубов для отображения в табе
  const cubesRecord = useMemo(
    () => values?.Worker?.GraphConfig?.Cubes || {},
    [values?.Worker?.GraphConfig?.Cubes],
  );
  const cubesCount = Object.keys(cubesRecord).length;

  // Получаем dropped кубы для показа иконки ошибки
  const droppedCubes = useMemo(
    () => values?.Worker?.GraphConfig?.DroppedCubes || [],
    [values?.Worker?.GraphConfig?.DroppedCubes],
  );
  const hasDroppedCubes = droppedCubes.length > 0;

  // Проверяем наличие ошибок в кубах (пустые имена, дубликаты)
  const hasCubesErrors = useMemo(() => {
    if (hasDroppedCubes) return true;

    const cubes = Object.values(cubesRecord);
    // Проверяем пустые имена
    const hasEmptyNames = cubes.some((c) => !c.Name || c.Name.trim() === '');
    if (hasEmptyNames) return true;

    // Проверяем дубликаты имен
    const names = cubes.map((c) => c.Name).filter(Boolean);
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) return true;

    return false;
  }, [cubesRecord, hasDroppedCubes]);

  // Иконка предупреждения для таба Cubes
  const cubesTabIcon = hasCubesErrors ? (
    <Icon data={TriangleExclamation} size={14} />
  ) : undefined;

  const tabs = hasWorker
    ? [
        {
          id: 'experiment' as TabId,
          title: 'Experiment Config',
          icon: undefined,
        },
        { id: 'worker' as TabId, title: 'Worker', icon: undefined },
        {
          id: 'cubes' as TabId,
          title: `Models (${cubesCount})`,
          icon: cubesTabIcon,
        },
      ]
    : [
        {
          id: 'experiment' as TabId,
          title: 'Experiment Config',
          icon: undefined,
        },
      ];

  return (
    <TabProvider
      value={internalActiveTab}
      onUpdate={(value) => handleTabChange(value as TabId)}
    >
      <ResizablePanel
        pageId="experiment-edit-tabs-size"
        resizerPosition="left"
        showPanel={showPanel}
        togglePanel={togglePanel}
        header={
          <TabList size="m" style={{ width: '100%', padding: '0 18px' }}>
            {tabs.map((tab) => (
              <Tab key={tab.id} value={tab.id} icon={tab.icon}>
                {tab.title}
              </Tab>
            ))}
          </TabList>
        }
      >
        {/* Все табы рендерятся одновременно, скрываются через display: none */}
        <Flex
          direction="column"
          style={{
            display: internalActiveTab === 'experiment' ? 'flex' : 'none',
          }}
        >
          {hasModelsParam ? (
            <Flex direction="row" style={{ padding: '0 0 12px' }}>
              <Button
                view="outlined"
                size="m"
                onClick={() =>
                  ShowCubesMarketModel.start({
                    canAdd: true,
                  })
                }
              >
                Добавить модель из маркетплейса
              </Button>
            </Flex>
          ) : null}
          {isExperimentEmpty ? (
            <Text variant="subheader-1" color="secondary">
              Empty config
            </Text>
          ) : (
            <FormParamEdit
              params={experimentParams}
              size="m"
              disclosure
              addButtonVariant="normal"
              focusedParam={focusedParam}
              variableNames={variableNames}
              arrayStructAddDisabledPaths={
                hasModelsParam ? EXPERIMENT_MODELS_ARRAY_NO_MANUAL_ADD : undefined
              }
            />
          )}
        </Flex>

        {hasWorker ? (
          <>
            <Flex
              direction="column"
              style={{
                display: internalActiveTab === 'worker' ? 'flex' : 'none',
              }}
            >
              {isWorkerEmpty ? (
                <Text variant="subheader-1" color="secondary">
                  Empty config
                </Text>
              ) : (
                <FormParamEdit
                  params={sortedWorkerParams}
                  fieldNamePrefix="Worker"
                  size="m"
                  disclosure
                  defaultOpen
                  defaultExpanded
                  addButtonVariant="normal"
                  variableNames={variableNames}
                />
              )}
            </Flex>

            <Flex
              direction="column"
              style={{
                display: internalActiveTab === 'cubes' ? 'flex' : 'none',
              }}
            >
              <WorkerEditConfigCubes
                selectedCubeHash={selectedCubeHash}
                onCubeSelect={onCubeSelect}
                variableNames={variableNames}
              />
            </Flex>
          </>
        ) : null}
      </ResizablePanel>
    </TabProvider>
  );
};
