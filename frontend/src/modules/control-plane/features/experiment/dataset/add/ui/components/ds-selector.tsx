import { Flex, Pagination } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { debounce } from 'lodash-es';
import React, { useMemo, useEffect, useState } from 'react';

import { ExperimentAddDsModel } from '@/modules/control-plane/features/experiment/dataset/add';
import { DatasetSelector } from '@/modules/control-plane/shared/components';
import { ErrorMessage } from '@/modules/control-plane/shared/components/sf-errors';
import { DSCatalog } from '@/modules/control-plane/shared/types';
import { getFromStorage, setToStorage } from '@/shared/lib/common/storage';
import { GlobalLoader } from '@/shared/ui/loaders';

import { DsFilters } from './ds-filters';

interface DsSelectorProps {
  onSelect: (item: DSCatalog) => void;
  experiment_id: number;
}

export const DsSelector = ({ onSelect, experiment_id }: DsSelectorProps) => {
  const [load, loading, failed, data, error, total, reset] = useUnit([
    ExperimentAddDsModel.load,
    ExperimentAddDsModel.$loading,
    ExperimentAddDsModel.$failed,
    ExperimentAddDsModel.$data,
    ExperimentAddDsModel.$error,
    ExperimentAddDsModel.$total,
    ExperimentAddDsModel.reset,
  ]);

  // Состояния для поиска и пагинации
  const [search, setSearch] = useState('');
  const [pageData, setPageData] = useState(() => {
    const saved = getFromStorage<number>({
      type: 'local',
      key: 'ds-add-modal-page-size',
    });
    return {
      page: 1,
      limit: saved || 15,
    };
  });

  const debouncedLoad = useMemo(
    () =>
      debounce((searchQuery: string) => {
        setPageData((prev) => ({ ...prev, page: 1 }));
        load({
          experiment_id,
          filters: {
            search: searchQuery,
          },
          offset: 0,
          limit: pageData.limit,
        });
      }, 250),
    [experiment_id, load, pageData.limit],
  );

  const handleFilterChange = (newFilter: { query: string; type?: string }) => {
    setSearch(newFilter.query);
    debouncedLoad(newFilter.query);
  };

  const handleUpdatePage = (page: number, pageSize: number) => {
    setPageData({ page, limit: pageSize });
    setToStorage({
      type: 'local',
      key: 'ds-add-modal-page-size',
      value: pageSize,
    });
    load({
      experiment_id,
      filters: {
        search,
      },
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });
  };

  useEffect(() => {
    load({
      experiment_id,
      offset: (pageData.page - 1) * pageData.limit,
      limit: pageData.limit,
    });
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !data)
    return (
      <Flex style={{ height: '200px', position: 'relative' }}>
        <GlobalLoader absolute size="m" />
      </Flex>
    );

  if (failed)
    return (
      <ErrorMessage
        message={error?.message || 'Error loading datasets'}
        reload={() =>
          load({
            experiment_id,
            filters: {
              search,
            },
            offset: (pageData.page - 1) * pageData.limit,
            limit: pageData.limit,
          })
        }
        pending={loading}
      />
    );

  return (
    <Flex
      direction="column"
      gapRow={3}
      style={{
        height: 'calc(100vh - 180px)',
      }}
    >
      <DsFilters
        filter={{ query: search }}
        onFilterChange={handleFilterChange}
      />
      <Flex
        shrink={1}
        direction="column"
        style={{ overflow: 'auto', position: 'relative' }}
      >
        {loading && <GlobalLoader absolute size="m" fadingOut />}
        <DatasetSelector data={data || []} onRowClick={onSelect} />
      </Flex>
      <Flex shrink={0} direction="row" justifyContent="center">
        <Pagination
          total={total}
          page={pageData.page}
          pageSize={pageData.limit}
          pageSizeOptions={[10, 15, 20, 50, 100]}
          onUpdate={handleUpdatePage}
        />
      </Flex>
    </Flex>
  );
};
