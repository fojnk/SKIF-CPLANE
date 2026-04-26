import { ArrowRotateRight } from '@gravity-ui/icons';
import {
  Flex,
  Table,
  Text,
  withTableActions,
  withTableSettings,
  WithTableSettingsProps,
  TableSettingsData,
  configure,
  Lang,
  Pagination,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useState } from 'react';

import { ShowJobModel } from '@/modules/control-plane/features/jobs/modals/job';
import { projectPageModel } from '@/modules/control-plane/pages/project';
import {
  JobsStagesLabel,
  JobsStatusLabel,
  StatusColumnInfo,
} from '@/modules/control-plane/pages/project/ui/components';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ErrorMessage } from '@/modules/control-plane/shared/components';
import { JobsDC, PageDataDC } from '@/modules/control-plane/shared/types';
import {
  ButtonWithProgress,
  FullDate,
  VkUser,
} from '@/modules/control-plane/shared/ui';
import { getPipeStatusColor } from '@/modules/control-plane/shared/utils/getStatusColor';
import {
  getProjectExperimentJobsPageSize,
  pageSizeOptions,
  saveProjectExperimentJobsPageSize,
} from '@/modules/control-plane/shared/utils/pageDataHelpers';
import {
  loadTableSettings,
  saveTableSettings,
} from '@/modules/control-plane/shared/utils/tableSettingsStorage';
import { GlobalLoader } from '@/shared/ui/loaders';

interface JobsTabProps {
  experiment_id: number;
}

const TableWithSettings = withTableSettings<JobsDC>({
  sortable: true,
  filterable: false,
})(Table);
const TableRender = withTableActions<JobsDC, WithTableSettingsProps>(
  TableWithSettings,
);

export const JobsTab = ({ experiment_id }: JobsTabProps) => {
  const [load, loading, failed, data, reset, total] = useUnit([
    projectPageModel.project.jobs.load,
    projectPageModel.project.jobs.$loading,
    projectPageModel.project.jobs.$failed,
    projectPageModel.project.jobs.$data,
    projectPageModel.project.jobs.reset,
    projectPageModel.project.jobs.$total,
  ]);

  const [pipeStatusLoad, pipeStatusLoading, pipeStatusData, pipeStatusReset] =
    useUnit([
      projectPageModel.experiment.status.load,
      projectPageModel.experiment.status.$loading,
      projectPageModel.experiment.status.$data,
      projectPageModel.experiment.status.reset,
    ]);
  useEffect(() => {
    configure({ lang: Lang.En });
  }, []);

  const settingsStorageKey = 'project_experiment_jobs_table_settings_v1';
  const defaultSettings: TableSettingsData = [
    { id: 'id', isSelected: true },
    { id: 'status', isSelected: true },
    { id: 'type', isSelected: true },
    { id: 'tags', isSelected: true },
    { id: 'created_at', isSelected: true },
    { id: 'created_by', isSelected: true },
  ];

  const [settings, setSettings] = useState<TableSettingsData>(() =>
    loadTableSettings(settingsStorageKey, defaultSettings),
  );

  const updateSettings = (next: TableSettingsData) => {
    setSettings(next);
    saveTableSettings(settingsStorageKey, next);
  };

  const [pageData, setPageData] = React.useState<PageDataDC>(() => ({
    page: 1,
    limit: getProjectExperimentJobsPageSize(),
  }));

  const loadFx = (page: number, limit: number) => {
    load({
      entity_id: experiment_id,
      entity_type: 'experiment',
      offset: (page - 1) * limit,
      limit,
    });
  };

  useEffect(() => {
    loadFx(1, getProjectExperimentJobsPageSize());
    pipeStatusLoad(experiment_id);
    return () => {
      reset();
      pipeStatusReset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiment_id]);

  const onUpdatePage = (page: number, limit: number) => {
    if (limit !== pageData.limit) {
      saveProjectExperimentJobsPageSize(limit);
    }
    loadFx(page, limit);
    setPageData({ page, limit });
  };

  const onRefresh = () => {
    if (loading) return;

    loadFx(pageData.page, pageData.limit);
    pipeStatusLoad(experiment_id);
  };

  const onRowClick = (row: controlPlaneApi.dc.JobdJobDC) => {
    ShowJobModel.start({
      id: row.id,
    });
  };

  const onStageClick = (id?: number, step_id?: number) => {
    ShowJobModel.start({
      id,
      step_id,
    });
  };

  if (loading && !data)
    return (
      <Flex style={{ height: '100%', width: '100%', position: 'relative' }}>
        <GlobalLoader absolute size="m" />
      </Flex>
    );
  if (failed)
    return (
      <ErrorMessage
        reload={() =>
          load({ entity_id: experiment_id, entity_type: 'experiment' })
        }
      />
    );

  const columns = [
    {
      id: 'id',
      name: 'ID',
      width: 60,
      align: 'center' as const,
      meta: { selectedAlways: true },
      template: (item: JobsDC) => (
        <Flex alignItems="center" justifyContent="center">
          {item.id}
        </Flex>
      ),
    },
    {
      id: 'status',
      name: () => <StatusColumnInfo />,
      width: 130,
      meta: { selectedAlways: true },
      template: (item: JobsDC) => (
        <JobsStatusLabel
          status={item.status}
          description={item.status_description}
        />
      ),
    },
    {
      id: 'type',
      name: 'Тип задачи',
      width: 230,
      meta: { selectedAlways: true },
      template: (item: JobsDC) => <Flex alignItems="center">{item.type}</Flex>,
    },
    {
      id: 'tags',
      name: 'Этапы',
      width: 230,
      meta: { selectedAlways: true },
      template: (item: JobsDC) => {
        return (
          <Flex alignItems="center" gap={1}>
            {item.stages?.map((stage) => (
              <Flex
                key={stage.step_id}
                onClick={(e) => {
                  onStageClick(item.id, stage.step_id);
                  e.stopPropagation();
                }}
              >
                <JobsStagesLabel stage={stage} />
              </Flex>
            ))}
          </Flex>
        );
      },
    },
    {
      id: 'created_at',
      name: 'Создано',
      width: 230,
      minWidth: 230,
      meta: { selectedAlways: true },
      template: (item: JobsDC) => <FullDate date={item.created_at} />,
    },
    {
      id: 'created_by',
      name: 'Автор',
      width: 180,
      meta: { selectedAlways: true },
      template: (item: JobsDC) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <VkUser user={item.created_by} />
        </span>
      ),
    },
  ];

  const supervisorRun = pipeStatusData?.supervisor;
  const supervisorJobColumns = [
    {
      id: 'idx',
      name: '#',
      width: 56,
      align: 'center' as const,
      template: (item: controlPlaneApi.dc.ResponsesSupervisorModelJobDC) => (
        <Flex alignItems="center" justifyContent="center">
          {item.index ?? '—'}
        </Flex>
      ),
    },
    {
      id: 'model',
      name: 'Модель',
      width: 220,
      template: (item: controlPlaneApi.dc.ResponsesSupervisorModelJobDC) => (
        <Text variant="body-2">{item.model_name || '—'}</Text>
      ),
    },
    {
      id: 'st',
      name: 'Статус',
      width: 140,
      template: (item: controlPlaneApi.dc.ResponsesSupervisorModelJobDC) => {
        const st = (item.status || 'UNKNOWN').toUpperCase();
        const color =
          st === 'COMPLETED'
            ? getPipeStatusColor('OK')
            : st === 'FAILED'
              ? getPipeStatusColor('ERROR')
              : st === 'RUNNING' || st === 'QUEUED'
                ? getPipeStatusColor('PENDING')
                : getPipeStatusColor('UNKNOWN');
        return (
          <Text variant="body-2" color={color}>
            {item.status || '—'}
          </Text>
        );
      },
    },
    {
      id: 'err',
      name: 'Ошибка',
      template: (item: controlPlaneApi.dc.ResponsesSupervisorModelJobDC) => (
        <Text variant="body-2" color={item.error_message ? 'danger' : undefined}>
          {item.error_message || '—'}
        </Text>
      ),
    },
  ];

  return (
    <div>
      <Flex
        gapRow={3}
        style={{
          paddingBottom: '12px',
          flexShrink: 0,
          boxShadow: 'inset 0 -1px 0 0 var(--g-color-line-generic)',
        }}
      >
        <ButtonWithProgress
          view="normal"
          size="m"
          loading={loading || pipeStatusLoading}
          onClick={onRefresh}
          intervalMs={10000}
          style={{
            boxShadow: '0 2px 6px 0 var(--g-color-sfx-shadow)',
          }}
        >
          <ButtonWithProgress.Icon>
            <ArrowRotateRight />
          </ButtonWithProgress.Icon>
          Обновить
        </ButtonWithProgress>
      </Flex>
      {supervisorRun ? (
        <Flex direction="column" gap={3} style={{ marginBottom: 16 }}>
          <Text variant="subheader-2">Этапы пайплайна (супервизор)</Text>
          <Flex direction="row" gap={4} style={{ flexWrap: 'wrap' }}>
            <Flex direction="row" gap={1} alignItems="center">
              <Text variant="body-2" color="secondary">
                Состояние:
              </Text>
              <Text
                variant="body-2"
                color={getPipeStatusColor(pipeStatusData?.status || 'UNKNOWN')}
              >
                {supervisorRun.status || pipeStatusData?.status || '—'}
              </Text>
            </Flex>
            {supervisorRun.progress ? (
              <Text variant="body-2" color="secondary">
                Прогресс этапов: {supervisorRun.progress}
              </Text>
            ) : null}
            {supervisorRun.current_model ? (
              <Text variant="body-2" color="secondary">
                Текущая модель: {supervisorRun.current_model}
              </Text>
            ) : null}
          </Flex>
          {(supervisorRun.jobs?.length ?? 0) > 0 ? (
            <Table
              columns={supervisorJobColumns}
              data={supervisorRun.jobs ?? []}
              emptyMessage="Нет этапов"
              className="table--full-width"
            />
          ) : (
            <Text variant="body-2" color="secondary">
              Список этапов пуст (ожидайте данные от супервизора или проверьте
              orch_id).
            </Text>
          )}
        </Flex>
      ) : null}
      <TableRender
        columns={columns}
        settings={settings}
        updateSettings={updateSettings}
        defaultSettings={defaultSettings}
        showResetButton
        data={data?.jobs ?? []}
        emptyMessage="Задачи не найдены"
        className="table--full-width"
        onRowClick={onRowClick}
      />
      <Flex direction="row" justifyContent="center">
        <Pagination
          total={total}
          page={pageData.page}
          pageSize={pageData.limit}
          pageSizeOptions={[...pageSizeOptions]}
          onUpdate={onUpdatePage}
        />
      </Flex>
    </div>
  );
};
