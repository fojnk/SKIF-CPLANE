import React, { useMemo } from 'react';

import { SFPagination } from '@/modules/control-plane/shared/components/sf-pagination/sf-pagination';
import { ProjectCatalogFilter } from '@/modules/control-plane/shared/types';

interface Props {
  filter: ProjectCatalogFilter;
  setFilter: (filter: ProjectCatalogFilter) => void;
  total: number;
}

export const ProjectsPagination = ({ filter, setFilter, total }: Props) => {
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
