import { Select } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { dataSourcesPageModel } from '@/modules/stream-flow/pages/datasets';
import { DsCatalogFilter } from '@/modules/stream-flow/shared/types';

interface Props {
  filter: DsCatalogFilter;
  setFilter: (filter: DsCatalogFilter) => void;
}

export const ClusterFilter = ({ filter, setFilter }: Props) => {
  const [data, loading, failed] = useUnit([
    dataSourcesPageModel.filter.cluster.$data,
    dataSourcesPageModel.filter.cluster.$loading,
    dataSourcesPageModel.filter.cluster.$failed,
  ]);

  const options = React.useMemo(() => {
    const items = Array.isArray(data) ? data : [];
    return items.map((item: string) => {
      const value = item;
      const content = item;
      return { value, content };
    });
  }, [data]);

  const value = React.useMemo(
    () => (filter.cluster ? [String(filter.cluster)] : []),
    [filter.cluster],
  );

  React.useEffect(() => {
    if (loading) return;
    const items = Array.isArray(data) ? data : [];
    if (value.length > 0) {
      const selected = value[0];
      const exists = items.some((it: string) => String(it ?? '') === selected);
      if (!exists) {
        setFilter({ ...filter, cluster: undefined, offset: 0 });
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
      filterable
      placeholder="Clusters"
      value={value}
      options={options}
      className="cluster-selector"
      onUpdate={(v) => {
        const next = (v[0] as string | undefined) ?? undefined;
        setFilter({ ...filter, cluster: next, offset: 0 });
      }}
    />
  );
};
