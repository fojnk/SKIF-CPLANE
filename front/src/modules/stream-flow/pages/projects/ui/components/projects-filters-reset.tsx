import { Button } from '@gravity-ui/uikit';
import React from 'react';

import { ProjectCatalogFilter } from '@/modules/stream-flow/shared/types';

interface Props {
  filter: ProjectCatalogFilter;
  setFilter: (filter: ProjectCatalogFilter) => void;
}

export const ProjectsFiltersReset = ({ filter, setFilter }: Props) => {
  const handleReset = () => {
    setFilter({
      limit: filter.limit,
      order_by: filter.order_by,
      search: filter.search,
      offset: 0,
    });
  };

  const hasActive = [filter.namespace_id].some((v) => v != null);

  return hasActive ? (
    <Button onClick={handleReset} view="flat-danger">
      Reset filters
    </Button>
  ) : null;
};
