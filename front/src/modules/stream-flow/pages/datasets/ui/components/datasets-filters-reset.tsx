import { Button } from '@gravity-ui/uikit';
import React from 'react';

import { DsCatalogFilter } from '@/modules/stream-flow/shared/types';

interface Props {
  filter: DsCatalogFilter;
  setFilter: (filter: DsCatalogFilter) => void;
}

export const DatasetsFiltersReset = ({ filter, setFilter }: Props) => {
  const handleReset = () => {
    setFilter({
      limit: filter.limit,
      order_by: filter.order_by,
      search: filter.search,
      offset: 0,
    });
  };

  const hasActive = [
    filter.cluster,
    filter.namespace_id,
    filter.type,
    filter.public,
    filter.managed,
    //filter.search,
  ].some((v) => v != null);

  return hasActive ? (
    <Button onClick={handleReset} view="flat-danger">
      Reset filters
    </Button>
  ) : null;
};
