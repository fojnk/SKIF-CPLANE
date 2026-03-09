import { TextInput } from '@gravity-ui/uikit';
import { debounce } from 'lodash-es';
import React, { useState, useMemo } from 'react';

interface ProjectsSearchProps {
  search?: string;
  setSearch: (search: string) => void;
  placeholder?: string;
  size?: 'l' | 'm';
}

export const SearchInput = ({
  search,
  setSearch,
  placeholder = 'Search...',
  size = 'l',
}: ProjectsSearchProps) => {
  const [inputValue, setInputValue] = useState(search ?? '');

  const debouncedSetSearchFilter = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
      }, 300),
    [setSearch],
  );

  const handleChange = (value: string) => {
    setInputValue(value);
    debouncedSetSearchFilter(value);
  };

  return (
    <TextInput
      value={inputValue}
      onUpdate={handleChange}
      placeholder={placeholder}
      size={size}
      hasClear
    />
  );
};
