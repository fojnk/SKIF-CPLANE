import { Flex, TextInput } from '@gravity-ui/uikit';
import React from 'react';

export interface DsFilter {
  query: string;
  type?: string;
}

interface CatalogDsFiltersProps {
  filter: DsFilter;
  onFilterChange: (filter: DsFilter) => void;
}

export const DsFilters = ({
  filter,
  onFilterChange,
}: CatalogDsFiltersProps) => {
  const handleChange = (value: string) => {
    onFilterChange({
      ...filter,
      query: value,
    });
  };

  return (
    <Flex direction="column" shrink={0}>
      <TextInput
        value={filter.query}
        onUpdate={handleChange}
        placeholder="Search dataset"
        size="l"
        hasClear
      />
    </Flex>
  );
};
