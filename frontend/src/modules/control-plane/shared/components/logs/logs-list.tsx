import { Flex, Pagination } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect } from 'react';

import { LogsListModel } from '@/modules/control-plane/entities/logs/list';
import { WhoAmIModel } from '@/modules/control-plane/entities/user/who-am-i';
import { ShowJobModel } from '@/modules/control-plane/features/jobs/modals/job';
import { ShowDatasetLogModel } from '@/modules/control-plane/features/logs/show-log/dataset';
import { ShowExperimentLogModel } from '@/modules/control-plane/features/logs/show-log/experiment';
import { ShowNamespaceLogModel } from '@/modules/control-plane/features/logs/show-log/namespace';
import { ShowProjectLogModel } from '@/modules/control-plane/features/logs/show-log/project';
import { ErrorMessage } from '@/modules/control-plane/shared/components';
import { LogsTable } from '@/modules/control-plane/shared/components/logs/logs-table';
import {
  PageDataDC,
  EntityType,
  LogDataDC,
} from '@/modules/control-plane/shared/types';
import {
  getLogsInitialPageSize,
  pageSizeOptions,
  saveLogsPageSize,
} from '@/modules/control-plane/shared/utils/pageDataHelpers';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  id: number;
  type: EntityType;
}

export const LogsList = ({ id, type }: Props) => {
  const [loading, data, load, failed, reset, total] = useUnit([
    LogsListModel.$loading,
    LogsListModel.$data,
    LogsListModel.load,
    LogsListModel.$failed,
    LogsListModel.reset,
    LogsListModel.$total,
  ]);

  const [loadingUser, user, loadUser] = useUnit([
    WhoAmIModel.$loading,
    WhoAmIModel.$data,
    WhoAmIModel.load,
  ]);

  const [pageData, setPageData] = React.useState<PageDataDC>(() => ({
    page: 1,
    limit: getLogsInitialPageSize(),
  }));

  const loadFx = (
    page: number,
    limit: number,
    id: number,
    type: EntityType,
  ) => {
    load({
      id,
      from: (page - 1) * limit,
      limit,
      type,
    });
  };

  useEffect(() => {
    if (!user) loadUser();
    loadFx(1, getLogsInitialPageSize(), id, type);
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  const onUpdatePage = (page: number, limit: number) => {
    if (limit !== pageData.limit) {
      saveLogsPageSize(limit);
    }
    loadFx(page, limit, id, type);
    setPageData({ page, limit });
  };

  const onRowClick = (row: LogDataDC) => {
    switch (type) {
      case 'dataset': {
        if (row.act === 'apply' && row.job_id) {
          ShowJobModel.start({ ...row, id: row?.job_id });
        } else {
          ShowDatasetLogModel.start(row);
        }
        return;
      }
      case 'namespace': {
        ShowNamespaceLogModel.start(row);
        return;
      }
      case 'project': {
        ShowProjectLogModel.start(row);
        return;
      }
      case 'experiment': {
        if (row.act === 'apply' && row.job_id) {
          ShowJobModel.start({ ...row, id: row.job_id });
        } else {
          ShowExperimentLogModel.start(row);
        }

        return;
      }
    }
  };

  if ((loading || loadingUser) && !data)
    return (
      <Flex style={{ height: '100%', width: '100%', position: 'relative' }}>
        <GlobalLoader absolute size="m" />
      </Flex>
    );
  if (failed)
    return (
      <ErrorMessage
        reload={() => loadFx(pageData.page, pageData.limit, id, type)}
      />
    );

  return (
    <Flex
      direction="column"
      gap={3}
      style={{ maxWidth: '1000px', position: 'relative' }}
    >
      {loading && <GlobalLoader absolute size="m" />}
      <LogsTable
        data={data ?? []}
        onRowClick={onRowClick}
        user={user?.name ?? ''}
        type={type}
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
    </Flex>
  );
};
