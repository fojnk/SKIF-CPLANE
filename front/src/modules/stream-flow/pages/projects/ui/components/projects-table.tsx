import { StarFill } from '@gravity-ui/icons';
import {
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
  Icon,
  Flex,
} from '@gravity-ui/uikit';
import { Link } from 'atomic-router-react';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useState } from 'react';

import { SFModule } from '@/modules/stream-flow/config';
import { navigationModel } from '@/modules/stream-flow/features/navigation';
import { projectsPageModel } from '@/modules/stream-flow/pages/projects';
import {
  ProjectCatalog,
  ProjectCatalogFilter,
} from '@/modules/stream-flow/shared/types';
import { formatDate } from '@/modules/stream-flow/shared/utils/formatVersionDate';
import { getAgoTime } from '@/modules/stream-flow/shared/utils/getAgoTime';
import {
  loadTableSettings,
  saveTableSettings,
} from '@/modules/stream-flow/shared/utils/tableSettingsStorage';

const TableWithSettings = withTableSettings<ProjectCatalog>({
  sortable: true,
  filterable: false,
})(Table);
const TableWithActions = withTableActions<
  ProjectCatalog,
  WithTableSettingsProps
>(TableWithSettings);
const TableRender = withTableSorting(TableWithActions);

interface Props {
  data: ProjectCatalog[];
  filter: ProjectCatalogFilter;
  setFilter: (filter: ProjectCatalogFilter) => void;
  onRowClick?: (item: ProjectCatalog) => void;
}

export const ProjectsTable = ({
  data,
  filter,
  setFilter,
  onRowClick,
}: Props) => {
  useEffect(() => {
    configure({ lang: Lang.En });
  }, []);

  const [pin, unpin] = useUnit([
    projectsPageModel.pinProject,
    projectsPageModel.unpinProject,
  ]);

  const defaultRowClick = (item: ProjectCatalog) => {
    navigationModel.project.navigate({
      id: item.id!,
      name: item.name!,
      tab: 'content',
    });
  };

  const getRowActions = (
    item: ProjectCatalog,
  ): TableActionConfig<ProjectCatalog>[] => {
    const actions: TableActionConfig<ProjectCatalog>[] = [];
    if (item.is_pinned) {
      actions.push({
        text: 'Открепить проект',
        handler: () => unpin(item.id!),
      });
    } else {
      actions.push({
        text: 'Закрепить проект',
        handler: () => pin(item.id!),
      });
    }
    return actions;
  };

  const columns = useMemo(
    () => [
      {
        name: 'ID',
        id: 'id',
        width: 40,
        meta: { sort: () => 0 },
        template: (item: ProjectCatalog) => (
          <Text variant="body-1" color="secondary">
            {item.id}
          </Text>
        ),
      },
      {
        name: 'Проект',
        id: 'name',
        meta: { selectedAlways: true, sort: () => 0 },
        template: (item: ProjectCatalog) => {
          const textElement = (
            <Text
              variant="body-1"
              ellipsisLines={1}
              ellipsis
              wordBreak="break-all"
              style={{
                fontWeight: item.is_pinned ? 600 : 500,
                color: 'var(--g-color-text-primary) !important',
                width: 'fit-content',
              }}
            >
              {item.name}
            </Text>
          );

          return (
            <Flex gap={1} alignItems="center">
              <Link
                className="g-link g-link_view_primary"
                to={SFModule.routes.project}
                query={{
                  id: item.id!,
                }}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {textElement}
              </Link>
              {item.is_pinned && (
                <Flex style={{ color: 'rgba(var(--warning-500), 1)' }}>
                  <Icon size={12} data={StarFill} className="no-shrink" />
                </Flex>
              )}
            </Flex>
          );
        },
      },
      {
        name: 'Рабочее пространство',
        id: 'namespace',
        width: 150,
        meta: { sort: () => 0 },
        template: (item: ProjectCatalog) => (
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
        name: 'Датасеты',
        id: 'ds',
        width: 120,
        align: 'center' as const,
        meta: { sort: () => 0 },
        template: (item: ProjectCatalog) =>
          item.dataset_count ? (
            <Text variant="body-1" color="primary">
              {item.dataset_count}
            </Text>
          ) : (
            ' '
          ),
      },
      {
        name: 'Эксперименты',
        id: 'experiments',
        width: 100,
        align: 'center' as const,
        meta: { sort: () => 0 },
        template: (item: ProjectCatalog) =>
          item.experiment_count ? (
            <Text variant="body-1" color="primary">
              {item.experiment_count}
            </Text>
          ) : (
            ' '
          ),
      },
      {
        name: 'Обновлено',
        id: 'updated',
        width: 120,
        align: 'end' as const,
        meta: { sort: () => 0 },
        template: (item: ProjectCatalog) =>
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
        template: (item: ProjectCatalog) =>
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

  const settingsStorageKey = 'sf_catalog_projects_table_settings';
  const defaultSettings = useMemo<TableSettingsData>(() => {
    const hiddenByDefault = new Set(['id', 'created']);
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
      getRowActions={getRowActions}
    />
  );
};
