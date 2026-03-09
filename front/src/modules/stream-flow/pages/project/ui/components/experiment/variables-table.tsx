import { ArrowUpRightFromSquare, Pencil, TrashBin } from '@gravity-ui/icons';
import {
  Table,
  Flex,
  withTableSettings,
  withTableSorting,
  TableSettingsData,
  WithTableSettingsProps,
  withTableActions,
  TableActionConfig,
  withTableCopy,
  configure,
  Lang,
  Label,
  Text,
  Icon,
  Button,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useState } from 'react';

import { ExperimentVariablesModel } from '@/modules/stream-flow/entities/variables/list';
import { VariableDeleteModel } from '@/modules/stream-flow/features/variable/delete';
import { VariableShowModel } from '@/modules/stream-flow/features/variable/version/show';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors';
import {
  ExperimentVariableItem,
  AclRightDC,
} from '@/modules/stream-flow/shared/types';
import { getAgoTime } from '@/modules/stream-flow/shared/utils/getAgoTime';
import {
  loadTableSettings,
  saveTableSettings,
} from '@/modules/stream-flow/shared/utils/tableSettingsStorage';
import {
  getTypeTheme,
  getTypeLabel,
} from '@/modules/stream-flow/shared/utils/variablesHelpers';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  experiment_id: number;
  rights?: AclRightDC[] | null;
  onShowVersions?: (variable: ExperimentVariableItem) => void;
}

const TableWithSettings = withTableSettings<ExperimentVariableItem>({
  sortable: true,
  filterable: false,
})(Table);

const TableWithCopy = withTableCopy(TableWithSettings);

const TableWithActions = withTableActions<
  ExperimentVariableItem,
  WithTableSettingsProps
>(TableWithCopy);

const TableRenderer = withTableSorting(TableWithActions);

export const VariablesTable = ({
  experiment_id,
  rights,
  onShowVersions,
}: Props) => {
  const variables = useUnit(ExperimentVariablesModel.list);
  const showVariable = useUnit(VariableShowModel.start);
  const deleteVariable = useUnit(VariableDeleteModel.start);

  const canEdit =
    rights?.includes(streamFlowApi.dc.AclRightDC.RightEditVariable) ?? false;
  const canDelete =
    rights?.includes(streamFlowApi.dc.AclRightDC.RightDeleteVariable) ?? false;

  useEffect(() => {
    configure({ lang: Lang.En });
  }, []);

  const settingsStorageKey = 'sf_experiment_variables_table_settings_v3';
  const defaultSettings: TableSettingsData = [
    { id: 'type', isSelected: true },
    { id: 'name', isSelected: true },
    { id: 'version', isSelected: true },
    { id: 'updated_at', isSelected: true },
    { id: 'versions', isSelected: true },
  ];

  const [settings, setSettings] = useState<TableSettingsData>(() =>
    loadTableSettings(settingsStorageKey, defaultSettings),
  );

  const updateSettings = (next: TableSettingsData) => {
    setSettings(next);
    saveTableSettings(settingsStorageKey, next);
  };

  const [sortState, setSortState] = useState<
    Array<{ column: string; order: 'asc' | 'desc' }>
  >([]);

  const sortedData = React.useMemo(() => {
    if (!variables.$data) return [];
    if (!sortState || sortState.length === 0) return variables.$data;

    const { column, order } = sortState[0]!;
    const copy = [...variables.$data];

    copy.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (column) {
        case 'type':
          aValue = String(a.type || '');
          bValue = String(b.type || '');
          break;
        case 'name':
          aValue = String(a.name || '').toLowerCase();
          bValue = String(b.name || '').toLowerCase();
          break;
        case 'version':
          aValue = Number(a.version_id_name || 0);
          bValue = Number(b.version_id_name || 0);
          break;
        case 'updated_at':
          aValue = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          bValue = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue === bValue) return 0;
      if (order === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

    return copy;
  }, [variables.$data, sortState]);

  const columns = React.useMemo(
    () => [
      {
        id: 'type',
        name: 'Тип',
        width: 50,
        align: 'end' as const,
        meta: {
          selectedAlways: true,
          sort: () => 0,
        },
        template: (item: ExperimentVariableItem) => (
          <Label theme={getTypeTheme(item.type)} size="xs">
            {getTypeLabel(item.type)}
          </Label>
        ),
      },
      {
        id: 'name',
        name: 'Переменная',
        meta: {
          selectedAlways: true,
          sort: () => 0,
          copy: (item: ExperimentVariableItem) => `\${${item.name}}`,
        },
        template: (item: ExperimentVariableItem) => (
          <Flex
            alignItems="center"
            style={{ height: '100%', maxWidth: '560px' }}
          >
            <Text variant="body-1" ellipsis style={{ fontWeight: 500 }}>
              {item.name}
            </Text>
          </Flex>
        ),
      },
      {
        id: 'version',
        name: 'Версия',
        width: 100,
        meta: {
          sort: () => 0,
          // Не обязательная колонка - можно скрыть
        },
        template: (item: ExperimentVariableItem) => (
          <Flex alignItems="center" style={{ height: '100%' }}>
            <Text variant="body-1" ellipsis style={{ fontWeight: 500 }}>
              {item.version_id_name}
            </Text>
          </Flex>
        ),
      },
      {
        id: 'updated_at',
        name: 'Обновлено',
        width: 140,
        meta: {
          sort: () => 0,
          // Не обязательная колонка - можно скрыть
        },
        template: (item: ExperimentVariableItem) => (
          <Flex alignItems="center" style={{ height: '100%' }}>
            {item.updated_at ? (
              <Text variant="body-1" color="secondary">
                {getAgoTime(item.updated_at)}
              </Text>
            ) : (
              '-'
            )}
          </Flex>
        ),
      },
      {
        id: 'versions',
        name: 'Версии',
        width: 102,
        align: 'center' as const,
        className: 'table-cell-no-click',
        template: (item: ExperimentVariableItem) => (
          <Flex
            alignItems="center"
            justifyContent="center"
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{ height: '42px' }}
          >
            {onShowVersions && (
              <Button
                size="m"
                view="flat-action"
                onClick={() => {
                  onShowVersions(item);
                }}
              >
                Версии
                <Button.Icon>
                  <ArrowUpRightFromSquare width={14} height={14} />
                </Button.Icon>
              </Button>
            )}
          </Flex>
        ),
      },
    ],
    [onShowVersions],
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

  const handleRowClick = (item: ExperimentVariableItem) => {
    showVariable({
      item,
      canEdit,
      mode: 'view',
      head: true,
    });
  };

  const getRowActions = (
    item: ExperimentVariableItem,
  ): TableActionConfig<ExperimentVariableItem>[] => {
    const actions: TableActionConfig<ExperimentVariableItem>[] = [];

    if (canEdit) {
      actions.push({
        text: 'Редактировать',
        icon: <Icon data={Pencil} size={12} />,
        theme: 'normal',
        handler: () => {
          showVariable({
            item,
            canEdit,
            mode: 'edit',
            head: true,
          });
        },
      });
    }

    if (canDelete) {
      actions.push({
        text: 'Удалить',
        icon: <Icon data={TrashBin} size={12} />,
        theme: 'danger',
        // Добавляем разделитель перед delete, если есть другие действия
        withSeparator: actions.length > 0,
        handler: () => {
          deleteVariable({
            name: item.name,
            variable_id: item.id,
          });
        },
      } as any);
    }

    return actions;
  };

  if (variables.$loading) return <GlobalLoader absolute />;

  if (variables.$failed)
    return (
      <ErrorMessage
        message="Не удалось загрузить переменные"
        reload={() => variables.load(experiment_id)}
        pending={variables.$loading}
      />
    );

  if (!variables.$data || variables.$data.length === 0) {
    return <Flex direction="row">Переменные не найдены</Flex>;
  }

  return (
    <Flex
      direction="column"
      gapRow={2}
      style={{ maxWidth: '1000px', width: '100%', position: 'relative' }}
    >
      <TableRenderer
        data={sortedData}
        columns={columnsWithOriginalNames}
        emptyMessage="Переменные не найдены"
        className="table--full-width"
        onRowClick={handleRowClick}
        getRowDescriptor={(item) => ({ id: item.id!.toString() })}
        getRowActions={getRowActions}
        settings={settings}
        updateSettings={updateSettings}
        defaultSettings={defaultSettings}
        defaultSortState={[]}
        onSortStateChange={(
          state: Array<{ column: string; order: 'asc' | 'desc' }>,
        ) => {
          setSortState(state);
        }}
        showResetButton
      />
    </Flex>
  );
};
