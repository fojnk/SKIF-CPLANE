import { SegmentedRadioGroup } from '@gravity-ui/uikit';
import React from 'react';

import { DsCatalogFilter } from '@/modules/stream-flow/shared/types';

interface Props {
  filter: DsCatalogFilter;
  setFilter: (filter: DsCatalogFilter) => void;
}

export const ManagedFilter = ({ filter, setFilter }: Props) => {
  const items = [
    { value: 'all', content: 'Все' },
    { value: 'managed', content: 'Управляемые' },
    { value: 'not', content: 'Нет' },
  ];

  const selected = React.useMemo(() => {
    if (filter.managed === true) return 'managed';
    if (filter.managed === false) return 'not';
    return 'all';
  }, [filter.managed]);

  const handleUpdate = (next: string) => {
    const nextManaged = next === 'all' ? undefined : next === 'managed';
    setFilter({ ...filter, managed: nextManaged, offset: 0 });
  };

  return (
    <SegmentedRadioGroup size="l" value={selected} onUpdate={handleUpdate}>
      {items.map((item) => (
        <SegmentedRadioGroup.Option
          key={item.value}
          value={item.value}
          content={item.content}
        />
      ))}
    </SegmentedRadioGroup>
  );
};
