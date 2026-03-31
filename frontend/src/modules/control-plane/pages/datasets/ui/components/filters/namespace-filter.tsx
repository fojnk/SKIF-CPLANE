import { Select } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { dataSourcesPageModel } from '@/modules/control-plane/pages/datasets';
import { DsCatalogFilter } from '@/modules/control-plane/shared/types';

interface Props {
  filter: DsCatalogFilter;
  setFilter: (filter: DsCatalogFilter) => void;
}

export const NamespaceFilter = ({ filter, setFilter }: Props) => {
  const [data, loading, failed] = useUnit([
    dataSourcesPageModel.filter.namespace.$data,
    dataSourcesPageModel.filter.namespace.$loading,
    dataSourcesPageModel.filter.namespace.$failed,
  ]);

  const options = React.useMemo(() => {
    const items = Array.isArray(data) ? data : [];
    return items.map((item: any) => {
      const value =
        item?.id != null ? String(item.id) : String(item?.name ?? '');
      const content = String(item?.name ?? item?.id ?? '');
      return { value, content };
    });
  }, [data]);

  const value = React.useMemo(
    () => (filter.namespace_id != null ? [String(filter.namespace_id)] : []),
    [filter.namespace_id],
  );

  // Validate only after data finished loading, against raw data
  React.useEffect(() => {
    if (loading) return;
    const items = Array.isArray(data) ? data : [];
    if (value.length > 0) {
      const selected = value[0];
      const exists = items.some((it: any) => {
        const id = it?.id != null ? String(it.id) : undefined;
        return id === selected;
      });
      if (!exists) {
        setFilter({ ...filter, namespace_id: undefined, offset: 0 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data, value]);

  if (
    loading ||
    failed ||
    !data ||
    (Array.isArray(data) && data.length === 0)
  ) {
    return null;
  }

  return (
    <Select
      size="l"
      hasClear
      placeholder="Рабочие пространства"
      value={value}
      options={options}
      filterable
      className="namespace-selector"
      filterPlaceholder="Поиск"
      onUpdate={(v) => {
        const next = (v[0] as string | undefined) ?? undefined;
        const nextId = next ? Number(next) : undefined;
        setFilter({ ...filter, namespace_id: nextId, offset: 0 });
      }}
    />
  );
};
