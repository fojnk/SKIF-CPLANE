import { Check } from '@gravity-ui/icons';
import { Icon, Text, withTableSorting, Table } from '@gravity-ui/uikit';
import React from 'react';

import { DSCatalog } from '@/modules/control-plane/shared/types';
import { DatasetTypeLabel } from '@/modules/control-plane/shared/ui';

const TableRender = withTableSorting(Table);

interface Props {
  data: DSCatalog[];
  onRowClick: (item: DSCatalog) => void;
}

export const DatasetSelector = ({ data, onRowClick }: Props) => {
  return (
    <TableRender
      edgePadding
      className="table--full-width"
      data={data}
      wordWrap
      onRowClick={onRowClick}
      columns={[
        {
          name: () => 'ID',
          id: 'ID',
          width: 40,
          template: (item: DSCatalog) => (
            <Text variant="body-1" color="secondary">
              {item.id}
            </Text>
          ),
        },
        {
          name: () => 'Датасет',
          id: 'name',
          template: (item) => (
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
          ),
        },
        {
          name: () => 'Проект',
          id: 'project',
          template: (item) => {
            if (!item.project_info || !item.project_info.id) {
              return (
                <Text variant="body-1" color="secondary">
                  -
                </Text>
              );
            }

            return (
              <Text
                variant="body-1"
                ellipsisLines={1}
                ellipsis
                wordBreak="break-all"
                style={{
                  color: 'var(--g-color-text-primary) !important',
                  width: 'fit-content',
                }}
              >
                {item.project_info.name}
              </Text>
            );
          },
        },
        {
          name: () => 'Рабочее пространство',
          id: 'NS',
          template: (item: DSCatalog) =>
            item.project_info && item.project_info.namespace_name ? (
              <Text variant="body-1" color="primary">
                {item.project_info.namespace_name}
              </Text>
            ) : (
              ' '
            ),
        },
        {
          name: () => 'Управляемый',
          id: 'Managed',
          width: 60,
          align: 'center' as const,
          template: (item) =>
            item.managed && (
              <Text color="positive">
                <Icon data={Check} size={20} />
              </Text>
            ),
        },
        {
          name: () => 'Публичный',
          id: 'Public',
          width: 60,
          align: 'center' as const,
          template: (item) =>
            item.public && (
              <Text color="positive">
                <Icon data={Check} size={20} />
              </Text>
            ),
        },
        {
          name: () => 'Тип',
          id: 'type',
          width: 80,
          align: 'end' as const,
          template: (item) => (
            <DatasetTypeLabel size="xs" type={item.type} showValue={false} />
          ),
        },
      ]}
    />
  );
};
