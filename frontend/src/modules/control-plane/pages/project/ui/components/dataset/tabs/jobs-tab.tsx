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

import { ShowJobModel } from '@/modules/control-plane/features/jobs/modals/job';
import { projectPageModel } from '@/modules/control-plane/pages/project';
import {
  JobsStagesLabel,
  JobsStatusLabel,
} from '@/modules/control-plane/pages/project/ui/components';
import { StatusColumnInfo } from '@/modules/control-plane/pages/project/ui/components/status-column-info';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ErrorMessage } from '@/modules/control-plane/shared/components';
import { JobsDC, PageDataDC } from '@/modules/control-plane/shared/types';
import {
  ButtonWithProgress,
  FullDate,
  VkUser,
} from '@/modules/control-plane/shared/ui';
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
  dataset_id: number;
}

const TableWithSettings = withTableSettings<JobsDC>({
  sortable: true,
  filterable: false,
})(Table);
const TableRender = withTableActions<JobsDC, WithTableSettingsProps>(
  TableWithSettings,
);

export const JobsTab = ({ dataset_id }: JobsTabProps) => {
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
      entity_id: dataset_id,
      entity_type: 'dataset',
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
  }, [dataset_id]);

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

  const onRowClick = (row: JobsDC) => {
    ShowJobModel.start(row);
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
          load({ entity_id: dataset_id, entity_type: 'experiment' })
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
          <Flex
            alignItems="center"
            gap={1}
            style={{
              flexWrap: 'wrap',
              rowGap: 6,
              maxWidth: '100%',
            }}
          >
            {item.stages?.map((stage, stageIndex) => (
              <JobsStagesLabel
                stage={stage}
                key={stage.step_id ?? `${item.id ?? 'job'}-${stageIndex}`}
              />
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
        onRowClick={onRowClick}
        columns={columns}
        settings={settings}
        updateSettings={updateSettings}
        defaultSettings={defaultSettings}
        showResetButton
        data={data?.jobs ?? []}
        emptyMessage="Задачи не найдены"
        className="table--full-width"
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
