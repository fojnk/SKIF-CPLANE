import { Text, withTableSorting, Table } from '@gravity-ui/uikit';
import { Link } from 'atomic-router-react';
import React from 'react';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { ProjectCatalog } from '@/modules/control-plane/shared/types';

const TableRender = withTableSorting(Table);

interface Props {
  data: ProjectCatalog[];
  onRowClick: (item: ProjectCatalog) => void;
}

export const ProjectSelectorTable = ({ data, onRowClick }: Props) => {
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
          template: (item) => (
            <Text variant="body-1" color="secondary">
              {item.id}
            </Text>
          ),
        },
        {
          name: () => 'Проект',
          id: 'name',
          template: (item) => {
            const textElement = (
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
            );

            return (
              <Link
                className="g-link g-link_view_primary"
                to={ControlPlaneModule.routes.project}
                query={{
                  id: item.id!,
                }}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {textElement}
              </Link>
            );
          },
        },
        {
          name: () => 'Рабочее пространство',
          id: 'namespace',
          width: 150,
          template: (item) => (
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
              {item.namespace_name}
            </Text>
          ),
        },
        {
          name: () => 'Датасеты',
          id: 'datasets',
          width: 100,
          align: 'center',
          template: (item) =>
            item.dataset_count ? (
              <Text variant="body-1" color="primary">
                {item.dataset_count}
              </Text>
            ) : (
              ' '
            ),
        },
        {
          name: () => 'Эксперименты',
          id: 'experiments',
          width: 80,
          align: 'center',
          template: (item) =>
            item.experiment_count ? (
              <Text variant="body-1" color="primary">
                {item.experiment_count}
              </Text>
            ) : (
              ' '
            ),
        },
      ]}
    />
  );
};
