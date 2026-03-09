import React, { useMemo } from 'react';

import { SFPagination } from '@/modules/stream-flow/shared/components';
import { DsCatalogFilter } from '@/modules/stream-flow/shared/types';

interface Props {
  filter: DsCatalogFilter;
  setFilter: (filter: DsCatalogFilter) => void;
  total: number;
}

export const DatasetsPagination = ({ filter, setFilter, total }: Props) => {
  const pageData = useMemo(
    () => ({
      page: filter.offset / filter.limit + 1,
      pageSize: filter.limit,
    }),
    [filter],
  );

  const handleUpdatePage = (page: number, pageSize: number) => {
    setFilter({ ...filter, offset: (page - 1) * pageSize, limit: pageSize });
  };

  return (
    <SFPagination
      total={total}
      pageData={pageData}
      onUpdatePage={handleUpdatePage}
    />
  );
};
