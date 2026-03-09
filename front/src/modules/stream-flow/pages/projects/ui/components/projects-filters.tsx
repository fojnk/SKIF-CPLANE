import { Flex } from '@gravity-ui/uikit';
import React from 'react';

import { NamespaceFilter } from '@/modules/stream-flow/pages/projects/ui/components/filters';
import { ProjectCatalogFilter } from '@/modules/stream-flow/shared/types';
import { SearchInput } from '@/modules/stream-flow/shared/ui';

interface Props {
  filter: ProjectCatalogFilter;
  setFilter: (filter: ProjectCatalogFilter) => void;
}

export const ProjectsFilters = ({ filter, setFilter }: Props) => {
  const handleSearchChange = (newSearch: string) => {
    setFilter({
      ...filter,
      search: newSearch !== '' ? newSearch : undefined,
      offset: 0,
    });
  };

  return (
    <Flex direction="row" className="no-shrink" gap={2}>
      <SearchInput
        search={filter.search ?? ''}
        setSearch={handleSearchChange}
        placeholder="Search by name or id"
        size="l"
      />
      <NamespaceFilter filter={filter} setFilter={setFilter} size="l" />
    </Flex>
  );
};
