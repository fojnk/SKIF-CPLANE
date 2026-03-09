import { Plus } from '@gravity-ui/icons';
import {
  Flex,
  withTableActions,
  Table,
  TableActionConfig,
  Text,
} from '@gravity-ui/uikit';
import { Link } from 'atomic-router-react';
import { useUnit } from 'effector-react';
import React, { useCallback, useEffect, useMemo } from 'react';

import { SFModule } from '@/modules/stream-flow/config';
import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors';
import { ExperimentDsLinkDC } from '@/modules/stream-flow/shared/types';
import { Button } from '@/shared/ui/button';
import { GlobalLoader } from '@/shared/ui/loaders';

const TableRenderer = withTableActions<ExperimentDsLinkDC>(Table);

interface Props {
  experiment_id: number;
  project_id: number;
}

interface DsTabState {
  loading: boolean;
  failed: boolean;
  data: ExperimentDsLinkDC[] | null;
  canAddDataset: boolean;
}

interface DsTabHandlers {
  onAddDsClick: () => void;
  onReload: () => void;
  setSelected: (value: string | null) => void;
}

const useDsTab = (
  experiment_id: number,
): {
  state: DsTabState;
  handlers: DsTabHandlers;
} => {
  const {
    load,
    $loading: loading,
    $data: data,
    $failed: failed,
    reset,
  } = useUnit(projectPageModel.experiment.ds);

  const experiment = useUnit(projectPageModel.experiment.active.$data);
  const addExperimentDataset = useUnit(projectPageModel.addExperimentDataset);
  const setSelected = useUnit(projectPageModel.selected.setSelected);

  const onAddDsClick = useCallback(() => {
    addExperimentDataset({ experiment_id });
  }, [addExperimentDataset, experiment_id]);

  const onReload = useCallback(() => {
    load(experiment_id);
  }, [load, experiment_id]);

  // Проверка прав на создание связи с источником данных
  const canAddDataset = useMemo(
    () =>
      (experiment?.rights ?? []).includes(
        streamFlowApi.dc.AclRightDC.RightCreateDataset,
      ),
    [experiment?.rights],
  );

  // Мемоизация состояния
  const state = useMemo<DsTabState>(
    () => ({
      loading,
      failed,
      data,
      canAddDataset,
    }),
    [loading, failed, data, canAddDataset],
  );

  const handlers = useMemo<DsTabHandlers>(
    () => ({
      onAddDsClick,
      onReload,
      setSelected,
    }),
    [onAddDsClick, onReload, setSelected],
  );

  useEffect(() => {
    load(experiment_id);
    return () => {
      reset();
    };
  }, [experiment_id, load, reset]);

  return { state, handlers };
};

export const DsTab = ({ experiment_id, project_id }: Props) => {
  const { state, handlers } = useDsTab(experiment_id);

  const [removeExperimentDataset, renameExperimentDataset] = useUnit([
    projectPageModel.removeExperimentDataset,
    projectPageModel.renameExperimentDataset,
  ]);

  const experiment = useUnit(projectPageModel.experiment.active.$data);
  const rights = experiment?.rights ?? [];
  const canEditName = rights.includes(
    streamFlowApi.dc.AclRightDC.RightDeleteDataset,
  );
  const canDelete = rights.includes(
    streamFlowApi.dc.AclRightDC.RightDeleteDataset,
  );

  const getRowActions = (
    item: ExperimentDsLinkDC,
  ): TableActionConfig<ExperimentDsLinkDC>[] => {
    const actions: TableActionConfig<ExperimentDsLinkDC>[] = [];

    if (canEditName) {
      actions.push({
        text: 'Переименовать',
        theme: 'normal',
        handler: () => {
          renameExperimentDataset({
            experiment_id,
            link_id: item.link_id!,
            alias: item.alias!,
          });
        },
      });
    }

    if (canDelete) {
      actions.push({
        text: 'Удалить',
        theme: 'danger',
        handler: () => {
          removeExperimentDataset({
            experiment_id,
            link_id: item.link_id!,
            alias: item.alias!,
          });
        },
      });
    }

    return actions;
  };

  const COLUMNS = [
    {
      id: 'id',
      name: 'ID',
      width: 60,
      template: (item: ExperimentDsLinkDC) => item.link_id,
    },
    {
      id: 'alias',
      name: 'Alias',
      template: (item: ExperimentDsLinkDC) => item.alias,
    },
    {
      id: 'project',
      name: 'Проект',
      template: (item: ExperimentDsLinkDC) =>
        item.project_id && item.project_name ? (
          <Link
            className="g-link g-link_view_normal"
            to={`${SFModule.routes.project.path}?id=${item.project_id}`}
            onClick={(e) => {
              if (project_id === item.project_id) {
                e.preventDefault();
                handlers.setSelected(null);
              }
            }}
          >
            {item.project_name}
          </Link>
        ) : (
          <Text variant="body-1" ellipsis>
            {item.project_name || '-'}
          </Text>
        ),
    },
    {
      id: 'dataset',
      name: 'Датасет',
      template: (item: ExperimentDsLinkDC) =>
        item.project_id && item.dataset_id ? (
          <Link
            className="g-link g-link_view_normal"
            to={`${SFModule.routes.project.path}?id=${item.project_id}&selected=ds-${item.dataset_id}`}
            onClick={(e) => {
              if (project_id === item.project_id) {
                e.preventDefault();
                handlers.setSelected(`ds-${item.dataset_id}`);
              }
            }}
          >
            {item.name}
          </Link>
        ) : (
          <Text variant="body-1" ellipsis>
            {item.name}
          </Text>
        ),
    },
  ];

  if (state.loading && state.data === null) {
    return <GlobalLoader absolute />;
  }

  if (state.failed) {
    return (
      <ErrorMessage
        message="Не удалось загрузить данные"
        reload={handlers.onReload}
        pending={state.loading}
      />
    );
  }

  return (
    <Flex
      direction="column"
      justifyContent="flex-start"
      gapRow={3}
      style={{ maxWidth: '990px', width: '100%' }}
    >
      {state.canAddDataset && (
        <Button
          style={{ width: 'fit-content' }}
          size="m"
          onClick={handlers.onAddDsClick}
        >
          <Button.Icon>
            <Plus />
          </Button.Icon>
          Привязать датасет
        </Button>
      )}

      {state.data && state.data.length > 0 && (
        <TableRenderer
          data={state.data}
          columns={COLUMNS}
          emptyMessage="К этому эксперименту не привязано ни одного датасета"
          className="table--full-width"
          getRowDescriptor={(item) => ({ id: item.link_id!.toString() })}
          getRowActions={getRowActions}
        />
      )}
    </Flex>
  );
};
