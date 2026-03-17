import { Flex } from '@gravity-ui/uikit';
import React from 'react';

import { DsCatalogFilter } from '@/modules/control-plane/shared/types';
import { SearchInput } from '@/modules/control-plane/shared/ui';

import {
  ManagedFilter,
  PublicFilter,
  TypeFilter,
  NamespaceFilter,
  ClusterFilter,
} from './filters';

import './datasets-filters.scss';

interface Props {
  filter: DsCatalogFilter;
  setFilter: (filter: DsCatalogFilter) => void;
}

export const DatasetsFilters = ({ filter, setFilter }: Props) => {
  const handleSearchChange = (newSearch: string) => {
    setFilter({
      ...filter,
      search: newSearch !== '' ? newSearch : undefined,
      offset: 0,
    });
  };

  return (
    <Flex direction="row" className="no-shrink filters" gap={2}>
      <div className="filters__search">
        <SearchInput
          search={filter.search ?? ''}
          setSearch={handleSearchChange}
          placeholder="Search by id, name or path"
        />
      </div>
      <PublicFilter filter={filter} setFilter={setFilter} />
      <ManagedFilter filter={filter} setFilter={setFilter} />
      <TypeFilter filter={filter} setFilter={setFilter} />
      <NamespaceFilter filter={filter} setFilter={setFilter} />
      <ClusterFilter filter={filter} setFilter={setFilter} />
    </Flex>
  );
};
