import { Flex, Table, Text, withTableSorting } from '@gravity-ui/uikit';
import { Link } from 'atomic-router-react';
import { useUnit } from 'effector-react';
import React, { useEffect, useState } from 'react';

import { SFModule } from '@/modules/stream-flow/config';
import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { SFPagination } from '@/modules/stream-flow/shared/components';
import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors';
import {
  DsExperimentLinkDC,
  PaginationData,
} from '@/modules/stream-flow/shared/types';
import { getFromStorage, setToStorage } from '@/shared/lib/common/storage';
import { GlobalLoader } from '@/shared/ui/loaders';

const TableRender = withTableSorting(Table);

interface Props {
  dataset_id: number;
}

export const ExperimentLinksTab = ({ dataset_id }: Props) => {
  const {
    load,
    $loading: loading,
    $data: data,
    $error: error,
    reset,
    $total: total,
  } = useUnit(projectPageModel.dataSource.experimentLinks);
  const setSelected = useUnit(projectPageModel.selected.setSelected);
  const project = useUnit(projectPageModel.project.current.$data);

  const STORAGE_KEY = 'ds-experiment-links-page-size';
  const savedPageSize =
    getFromStorage<number>({ type: 'local', key: STORAGE_KEY }) || 100;

  const [pageData, setPageData] = useState<PaginationData>({
    page: 1,
    pageSize: savedPageSize,
  });

  const onReload = () => {
    load({
      dataset_id,
      limit: pageData.pageSize,
      offset: (pageData.page - 1) * pageData.pageSize,
    });
  };

  const onUpdatePage = (page: number, pageSize: number) => {
    setPageData({ page, pageSize });
    setToStorage({ type: 'local', key: STORAGE_KEY, value: pageSize });
    load({
      dataset_id,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
  };

  useEffect(() => {
    load({
      dataset_id,
      limit: pageData.pageSize,
      offset: (pageData.page - 1) * pageData.pageSize,
    });
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset_id]);

  if (loading && data === null) {
    return <GlobalLoader absolute />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Не удалось загрузить связи с экспериментами"
        reload={onReload}
        pending={loading}
      />
    );
  }

  return (
    <Flex
      direction="column"
      gap={3}
      style={{ maxWidth: '990px', width: '100%' }}
    >
      <TableRender
        className="table--full-width"
        data={data || []}
        columns={[
          {
            id: 'id',
            name: 'ID',
            width: 60,
            template: (item: DsExperimentLinkDC) => item.experiment_id,
          },
          {
            id: 'experiment',
            name: 'Эксперимент',
            template: (item: DsExperimentLinkDC) =>
              item.project_id && item.experiment_id ? (
                <Link
                  className="g-link g-link_view_normal"
                  to={`${SFModule.routes.project.path}?id=${item.project_id}&selected=pipe-${item.experiment_id}`}
                  onClick={(e) => {
                    if (project?.id === item.project_id) {
                      e.preventDefault();
                      setSelected(`pipe-${item.experiment_id}`);
                    }
                  }}
                >
                  <Text variant="body-1" ellipsis style={{ fontWeight: 500 }}>
                    {item.experiment_name}
                  </Text>
                </Link>
              ) : (
                <Text variant="body-1" ellipsis style={{ fontWeight: 500 }}>
                  {item.experiment_name}
                </Text>
              ),
          },
          {
            id: 'alias',
            name: 'Алиас',
            template: (item: DsExperimentLinkDC) => item.alias,
          },
          {
            id: 'project',
            name: 'Проект',
            template: (item: DsExperimentLinkDC) =>
              item.project_id ? (
                <Link
                  className="g-link g-link_view_normal"
                  to={`${SFModule.routes.project.path}?id=${item.project_id}`}
                  onClick={(e) => {
                    if (project?.id === item.project_id) {
                      e.preventDefault();
                      setSelected(null);
                    }
                  }}
                >
                  <Text variant="body-1" ellipsis>
                    {item.project_name}
                  </Text>
                </Link>
              ) : (
                <Text variant="body-1" color="secondary">
                  -
                </Text>
              ),
          },
        ]}
        emptyMessage="Связи с экспериментами не найдены"
      />

      <SFPagination
        total={total}
        pageData={pageData}
        onUpdatePage={onUpdatePage}
      />
    </Flex>
  );
};
