import { Table, Text, withTableSorting } from '@gravity-ui/uikit';
import { Link } from 'atomic-router-react';
import React from 'react';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { NamespaceDC } from '@/modules/control-plane/shared/types';

const TableRender = withTableSorting(Table);

interface Props {
  data: NamespaceDC[];
  onRowClick: (item: NamespaceDC) => void;
  search?: string;
}

export const NamespaceSelector = ({ data, onRowClick, search }: Props) => {
  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter((item: controlPlaneApi.dc.DtoNamespaceDC) =>
      item.name?.toLowerCase().includes(searchLower),
    );
  }, [data, search]);

  return (
    <TableRender
      edgePadding
      className="table--full-width"
      data={filteredData}
      wordWrap
      onRowClick={onRowClick}
      emptyMessage={
        search
          ? 'По вашему запросу рабочие пространства не найдены'
          : 'Рабочих пространств нет'
      }
      columns={[
        {
          name: () => 'ID',
          id: 'ID',
          width: 40,
          template: (item) => (
            <Text variant="body-1" color="secondary">
              {item.id}
            </Text>
          ),
        },
        {
          name: () => 'Рабочее пространство',
          id: 'name',
          template: (item) => (
            <Link
              className="g-link g-link_view_primary"
              to={ControlPlaneModule.routes.namespace}
              query={{ id: item.id }}
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <Text
                variant="body-1"
                ellipsisLines={1}
                ellipsis
                wordBreak="break-all"
                style={{
                  fontWeight: 500,
                  color: 'var(--g-color-text-primary) !important',
                  width: 'fit-content',
                }}
              >
                {item.name}
              </Text>
            </Link>
          ),
        },
      ]}
    />
  );
};
