import { Select } from '@gravity-ui/uikit';
import React from 'react';

import { DATA_SOURCE_TYPE_OPTIONS } from '@/modules/control-plane/shared/constants';
import {
  DatasetType,
  DsCatalogFilter,
} from '@/modules/control-plane/shared/types';

interface Props {
  filter: DsCatalogFilter;
  setFilter: (filter: DsCatalogFilter) => void;
}

export const TypeFilter = ({ filter, setFilter }: Props) => {
  const value = React.useMemo(
    () => (filter.type ? [filter.type] : []),
    [filter.type],
  );

  return (
    <Select
      size="l"
      hasClear
      placeholder="Types"
      value={value}
      onUpdate={(v) => {
        const next = v[0] as DatasetType | undefined;
        setFilter({ ...filter, type: next, offset: 0 });
      }}
      className="ds-type-selector"
      options={DATA_SOURCE_TYPE_OPTIONS}
    />
  );
};
