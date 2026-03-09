import { Check } from '@gravity-ui/icons';
import {
  Icon,
  Text,
  withTableSorting,
  Table,
  withTableSettings,
  configure,
  Lang,
  TableSettingsData,
  withTableActions,
  TableActionConfig,
  WithTableSettingsProps,
} from '@gravity-ui/uikit';
import { Link } from 'atomic-router-react';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useState } from 'react';

import { SFModule } from '@/modules/stream-flow/config';
import { CloneModel } from '@/modules/stream-flow/features/clone';
import { navigationModel } from '@/modules/stream-flow/features/navigation';
import { DSCatalog, DsCatalogFilter } from '@/modules/stream-flow/shared/types';
import { DatasetTypeLabel } from '@/modules/stream-flow/shared/ui';
import { formatDate } from '@/modules/stream-flow/shared/utils/formatVersionDate';
import { getAgoTime } from '@/modules/stream-flow/shared/utils/getAgoTime';
import {
  loadTableSettings,
  saveTableSettings,
} from '@/modules/stream-flow/shared/utils/tableSettingsStorage';

const TableWithSettings = withTableSettings<DSCatalog>({
  sortable: true,
  filterable: false,
})(Table);
const TableWithActions = withTableActions<DSCatalog, WithTableSettingsProps>(
  TableWithSettings,
);
const TableRender = withTableSorting(TableWithActions);

interface Props {
  data: DSCatalog[];
  filter: DsCatalogFilter;
  setFilter: (filter: DsCatalogFilter) => void;
  onRowClick?: (item: DSCatalog) => void;
}

export const DatasetsTable = ({
  data,
  filter,
  setFilter,
  onRowClick,
}: Props) => {
  const clone = useUnit(CloneModel.start);

  const getRowActions = (item: DSCatalog): TableActionConfig<DSCatalog>[] => {
    const actions: TableActionConfig<DSCatalog>[] = [];
    if (item.public) {
      actions.push({
        text: 'Клонировать',
        handler: () => {
          clone({
            src_id: item.id!,
            src_name: item.name!,
            src_type: 'ds',
          });
        },
      });
    }
    return actions;
  };

  useEffect(() => {
    configure({ lang: Lang.En });
  }, []);

  const defaultRowClick = (item: DSCatalog) => {
    if (item.project_info && item.project_info.id) {
      navigationModel.project.navigate({
        id: item.project_info.id,
        name: item.project_info.name!,
        selected: {
          type: 'dataset',
          id: item.id!,
          name: item.name!,
          dsTab: 'config',
        },
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        name: 'ID',
        id: 'id',
        width: 40,
        meta: { sort: () => 0 },
        template: (item: DSCatalog) => (
          <Text variant="body-1" color="secondary">
            {item.id}
          </Text>
        ),
      },
      {
        name: 'Датасет',
        id: 'name',
        meta: { selectedAlways: true, sort: () => 0 },
        template: (item: DSCatalog) => {
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

          return item.project_info && item.project_info.id ? (
            <Link
              className="g-link g-link_view_primary"
              to={SFModule.routes.project}
              query={{
                id: item.project_info.id,
                selected: `ds-${item.id}`,
              }}
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              {textElement}
            </Link>
          ) : (
            textElement
          );
        },
      },
      {
        name: 'Проект',
        id: 'project',
        meta: { sort: () => 0 },
        template: (item: DSCatalog) => {
          if (!item.project_info || !item.project_info.id) {
            return (
              <Text variant="body-1" color="secondary">
                -
              </Text>
            );
          }

          const textElement = (
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

          return (
            <Link
              className="g-link g-link_view_primary"
              to={SFModule.routes.project}
              query={{
                id: item.project_info.id,
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
        name: 'Рабочее пространство',
        id: 'namespace',
        meta: { sort: () => 0 },
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
        name: 'Связи',
        id: 'links',
        width: 60,
        align: 'center' as const,
        meta: { sort: () => 0 },
        template: (item: DSCatalog) =>
          item.linked_experiments_count ? (
            <Text variant="body-1" color="primary">
              {item.linked_experiments_count}
            </Text>
          ) : (
            ' '
          ),
      },
      {
        name: 'Управляемый',
        id: 'managed',
        width: 60,
        align: 'center' as const,
        meta: { sort: () => 0 },
        template: (item: DSCatalog) =>
          item.managed && (
            <Text color="positive">
              <Icon data={Check} size={20} />
            </Text>
          ),
      },
      {
        name: 'Публичный',
        id: 'public',
        width: 60,
        align: 'center' as const,
        meta: { sort: () => 0 },
        template: (item: DSCatalog) =>
          item.public && (
            <Text color="positive">
              <Icon data={Check} size={20} />
            </Text>
          ),
      },
      {
        name: 'Тип',
        id: 'type',
        width: 80,
        align: 'end' as const,
        meta: { selectedAlways: true, sort: () => 0 },
        template: (item: DSCatalog) => (
          <DatasetTypeLabel size="xs" type={item.type} showValue={false} />
        ),
      },
      {
        name: 'Обновлено',
        id: 'updated',
        width: 120,
        align: 'end' as const,
        meta: { sort: () => 0 },
        template: (item: DSCatalog) =>
          item.updated_at ? (
            <Text variant="body-1" color="secondary">
              {getAgoTime(item.updated_at)}
            </Text>
          ) : (
            '-'
          ),
      },
      {
        name: 'Создано',
        id: 'created',
        width: 120,
        align: 'end' as const,
        meta: { sort: () => 0 },
        template: (item: DSCatalog) =>
          item.updated_at ? (
            <Text variant="body-1" color="secondary">
              {formatDate(item.created_at)}
            </Text>
          ) : (
            '-'
          ),
      },
    ],
    [],
  );

  const columnsWithOriginalNames = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        meta: {
          ...(column as any).meta,
          _originalName:
            typeof column.name === 'function'
              ? String((column.name as () => string)())
              : String(column.name as string),
        },
      })),
    [columns],
  );

  const settingsStorageKey = 'sf_catalog_ds_table_settings_v1';
  const defaultSettings = useMemo<TableSettingsData>(() => {
    const hiddenByDefault = new Set(['id', 'links', 'created', 'updated']);
    return columns.map((c) => ({
      id: String(c.id),
      isSelected: !hiddenByDefault.has(String(c.id)),
    }));
  }, [columns]);

  const [settings, setSettings] = useState<TableSettingsData>(() =>
    loadTableSettings(settingsStorageKey, defaultSettings),
  );

  const updateSettings = (next: TableSettingsData) => {
    setSettings(next);
    saveTableSettings(settingsStorageKey, next);
  };

  const defaultSortState = useMemo(() => {
    if (!filter.order_by)
      return [] as { column: string; order: 'asc' | 'desc' }[];
    const [column, order] = filter.order_by.split('_') as [
      string,
      'asc' | 'desc',
    ];
    return column && order ? [{ column, order }] : [];
  }, [filter.order_by]);

  return (
    <TableRender
      getRowActions={getRowActions}
      edgePadding
      className="table--full-width"
      data={data}
      wordWrap
      onRowClick={onRowClick || defaultRowClick}
      columns={columnsWithOriginalNames}
      settings={settings}
      updateSettings={updateSettings}
      defaultSettings={defaultSettings}
      showResetButton
      defaultSortState={defaultSortState}
      onSortStateChange={(
        sortState: Array<{ column: string; order: 'asc' | 'desc' }>,
      ) => {
        if (!filter) return;
        if (!sortState || sortState.length === 0) {
          setFilter({ ...filter, order_by: undefined });
          return;
        }
        const { column, order } = sortState[0]!;
        const nextOrderBy = `${column}_${order}` as const;
        if (nextOrderBy !== filter.order_by) {
          setFilter({ ...filter, order_by: nextOrderBy });
        }
      }}
    />
  );
};
