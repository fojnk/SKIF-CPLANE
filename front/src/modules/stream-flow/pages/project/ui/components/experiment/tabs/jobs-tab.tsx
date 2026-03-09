import { ArrowRotateRight } from '@gravity-ui/icons';
import {
  Flex,
  Table,
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

import { ShowJobModel } from '@/modules/stream-flow/features/jobs/modals/job';
import { projectPageModel } from '@/modules/stream-flow/pages/project';
import {
  JobsStagesLabel,
  JobsStatusLabel,
  StatusColumnInfo,
} from '@/modules/stream-flow/pages/project/ui/components';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ErrorMessage } from '@/modules/stream-flow/shared/components';
import { JobsDC, PageDataDC } from '@/modules/stream-flow/shared/types';
import {
  ButtonWithProgress,
  FullDate,
  VkUser,
} from '@/modules/stream-flow/shared/ui';
import {
  getProjectExperimentJobsPageSize,
  pageSizeOptions,
  saveProjectExperimentJobsPageSize,
} from '@/modules/stream-flow/shared/utils/pageDataHelpers';
import {
  loadTableSettings,
  saveTableSettings,
} from '@/modules/stream-flow/shared/utils/tableSettingsStorage';
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
    return () => {
      reset();
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
  };

  const onRowClick = (row: streamFlowApi.dc.JobdJobDC) => {
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
          loading={loading}
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
