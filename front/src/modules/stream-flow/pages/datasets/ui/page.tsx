import { Flex, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { dataSourcesPageModel } from '@/modules/stream-flow/pages/datasets';
import { ListPage } from '@/modules/stream-flow/shared/layouts';
import {
  CatalogRadioGroup,
  catalogRadioGroupList,
} from '@/modules/stream-flow/shared/ui/radio-group/catalog-radio-group';
import { GlobalLoader } from '@/shared/ui/loaders';

import {
  DatasetsError,
  DatasetsFilters,
  DatasetsFiltersReset,
  DatasetsPagination,
  DatasetsTable,
} from './components';

export const SFDatasetsPage = () => {
  const loading = useUnit(dataSourcesPageModel.loaders.$loading);
  const [data, failed, reload, error, filter, setFilter, total] = useUnit([
    dataSourcesPageModel.list.$data,
    dataSourcesPageModel.list.$failed,
    dataSourcesPageModel.list.reload,
    dataSourcesPageModel.list.$error,
    dataSourcesPageModel.list.$filter,
    dataSourcesPageModel.list.setFilter,
    dataSourcesPageModel.list.$total,
  ]);

  if ((loading && !data) || !filter)
    return (
      <ListPage>
        <Flex direction="row" justifyContent="space-between">
          <Flex
            direction="row"
            gap={4}
            alignItems="center"
            style={{ width: 'calc(100% - 120px)' }}
          >
            <Text variant="header-1" ellipsis>
              Catalog
            </Text>
            <CatalogRadioGroup active={catalogRadioGroupList.dataSources} />
          </Flex>
        </Flex>
        <GlobalLoader absolute />
      </ListPage>
    );

  const currentPage = Math.floor(filter.offset / filter.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / filter.limit));

  return (
    <ListPage
      footer={
        <DatasetsPagination
          filter={filter}
          setFilter={setFilter}
          total={total}
        />
      }
    >
      <Flex direction="row" justifyContent="space-between">
        <Flex
          direction="row"
          gap={4}
          alignItems="center"
          style={{ width: 'calc(100% - 120px)' }}
        >
          <Text variant="header-1" ellipsis>
            Catalog
          </Text>
          <CatalogRadioGroup active={catalogRadioGroupList.dataSources} />
          {totalPages > 1 && (
            <Text variant="body-2" color="secondary" className="no-shrink">
              page {currentPage} of {totalPages}
            </Text>
          )}
        </Flex>
        <DatasetsFiltersReset filter={filter} setFilter={setFilter} />
      </Flex>
      <DatasetsFilters filter={filter} setFilter={setFilter} />

      {loading && <GlobalLoader absolute size="m" fadingOut />}
      {failed ? (
        <DatasetsError error={error} reload={reload} />
      ) : (
        <DatasetsTable
          data={data || []}
          filter={filter}
          setFilter={setFilter}
        />
      )}
    </ListPage>
  );
};
