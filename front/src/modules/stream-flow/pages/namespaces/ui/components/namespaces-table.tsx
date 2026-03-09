import {
  Table,
  Text,
  withTableSorting,
  withTableSettings,
  configure,
  Lang,
  TableSettingsData,
} from '@gravity-ui/uikit';
import { Link } from 'atomic-router-react';
import React from 'react';

import { SFModule } from '@/modules/stream-flow/config';
import { navigationModel } from '@/modules/stream-flow/features/navigation';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { NamespaceDC } from '@/modules/stream-flow/shared/types';
import {
  loadTableSettings,
  saveTableSettings,
} from '@/modules/stream-flow/shared/utils/tableSettingsStorage';

const TableWithSettings = withTableSettings({
  sortable: true,
  filterable: false,
})(Table);
const TableRender = withTableSorting(TableWithSettings);

type SortStateItem = { column: string; order: 'asc' | 'desc' };
const SORT_STORAGE_KEY = 'sf_namespaces_table_sort_v1';

function loadSortState(): SortStateItem[] {
  try {
    const raw = localStorage.getItem(SORT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as SortStateItem[];
    }
  } catch {
    return [];
  }
  return [];
}

function saveSortState(state: SortStateItem[]): void {
  try {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
}

interface Props {
  data: NamespaceDC[];
  onRowClick?: (item: NamespaceDC) => void;
  search?: string;
}

export const NamespacesTable = ({ data, onRowClick, search }: Props) => {
  React.useEffect(() => {
    configure({ lang: Lang.En });
  }, []);

  const defaultRowClick = (item: NamespaceDC) => {
    navigationModel.namespace.navigate({
      id: item.id!,
      name: item.name!,
      tab: 'config',
    });
  };

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter((item: streamFlowApi.dc.DtoNamespaceDC) => {
      const nameMatch = item.name?.toLowerCase().includes(searchLower);
      const idMatch = String(item.id ?? '')
        .toLowerCase()
        .includes(searchLower);
      return Boolean(nameMatch || idMatch);
    });
  }, [data, search]);

  const columns = React.useMemo(
    () => [
      {
        name: 'ID',
        id: 'ID',
        width: 40,
        meta: { sort: (item: NamespaceDC) => Number(item.id ?? 0) },
        template: (item: NamespaceDC) => (
          <Text variant="body-1" color="secondary">
            {item.id}
          </Text>
        ),
      },
      {
        name: 'Рабочее пространство',
        id: 'name',
        meta: {
          selectedAlways: true,
          sort: (item: NamespaceDC) => String(item.name ?? ''),
        },
        template: (item: NamespaceDC) => (
          <Link
            className="g-link g-link_view_primary"
            to={SFModule.routes.namespace}
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
    ],
    [],
  );

  const columnsWithOriginalNames = React.useMemo(
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

  const settingsStorageKey = 'sf_namespaces_table_settings';
  const defaultSettings = React.useMemo<TableSettingsData>(() => {
    const hiddenByDefault = new Set(['no']);
    return columns.map((c) => ({
      id: String(c.id),
      isSelected: !hiddenByDefault.has(String(c.id)),
    }));
  }, [columns]);

  const [settings, setSettings] = React.useState<TableSettingsData>(() =>
    loadTableSettings(settingsStorageKey, defaultSettings),
  );

  const updateSettings = (next: TableSettingsData) => {
    setSettings(next);
    saveTableSettings(settingsStorageKey, next);
  };

  const defaultSortState = React.useMemo<SortStateItem[]>(
    () => loadSortState(),
    [],
  );
  const [sortState, setSortState] =
    React.useState<SortStateItem[]>(defaultSortState);

  const sortedData = React.useMemo(() => {
    if (!filteredData) return [] as NamespaceDC[];
    if (!sortState || sortState.length === 0) return filteredData;
    const { column, order } = sortState[0]!;
    const accessor =
      column === 'id'
        ? (r: NamespaceDC) => Number(r.id ?? 0)
        : column === 'name'
          ? (r: NamespaceDC) => String(r.name ?? '')
          : null;
    if (!accessor) return filteredData;
    const copy = [...filteredData];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av === bv) return 0;
      if (order === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
    return copy;
  }, [filteredData, sortState]);

  return (
    <TableRender
      edgePadding
      className="table--full-width"
      data={sortedData}
      wordWrap
      onRowClick={onRowClick || defaultRowClick}
      emptyMessage={
        search
          ? 'По вашему запросу рабочие пространства не найдены'
          : 'Рабочих пространств нет'
      }
      columns={columnsWithOriginalNames}
      settings={settings}
      updateSettings={updateSettings}
      defaultSettings={defaultSettings}
      defaultSortState={defaultSortState}
      onSortStateChange={(
        state: Array<{ column: string; order: 'asc' | 'desc' }>,
      ) => {
        const next = state as SortStateItem[];
        saveSortState(next);
        setSortState(next);
      }}
      showResetButton
    />
  );
};
