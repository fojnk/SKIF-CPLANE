import {
  Table,
  Text,
  withTableSettings,
  TableSettingsData,
  configure,
  Lang,
  withTableActions,
  TableActionConfig,
  WithTableSettingsProps,
  Tooltip,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo } from 'react';

import { SetLogCommentModel } from '@/modules/control-plane/features/logs/set-comment';
import { EntityType, LogDataDC } from '@/modules/control-plane/shared/types';
import { FullDate, VkUser } from '@/modules/control-plane/shared/ui';
import { getActionColor } from '@/modules/control-plane/shared/utils/getActionColor';
import {
  loadTableSettings,
  saveTableSettings,
} from '@/modules/control-plane/shared/utils/tableSettingsStorage';

interface Props {
  data: LogDataDC[];
  onRowClick: (row: LogDataDC) => void;
  user: string;
  type: EntityType;
}

const TableWithSettings = withTableSettings<LogDataDC>({
  sortable: true,
  filterable: false,
})(Table);
const TableRender = withTableActions<LogDataDC, WithTableSettingsProps>(
  TableWithSettings,
);

export const LogsTable = ({ data, onRowClick, user, type }: Props) => {
  React.useEffect(() => {
    configure({ lang: Lang.En });
  }, []);
  const startEdit = useUnit(SetLogCommentModel.start);
  const settingsStorageKey = 'cp_logs_table_settings_v1';
  const defaultSettings: TableSettingsData = [
    { id: 'id', isSelected: false },
    { id: 'created_at', isSelected: true },
    { id: 'user', isSelected: true },
    { id: 'action', isSelected: true },
    { id: 'comment', isSelected: false },
  ];

  const [settings, setSettings] = React.useState<TableSettingsData>(() =>
    loadTableSettings(settingsStorageKey, defaultSettings),
  );

  const updateSettings = (next: TableSettingsData) => {
    setSettings(next);
    saveTableSettings(settingsStorageKey, next);
  };
  const isCommentVisible = React.useMemo(() => {
    const arr = settings as Array<{
      id: string | number;
      isSelected?: boolean;
    }>;
    const found = arr.find((s) => String(s.id) === 'comment');
    return found?.isSelected ?? true;
  }, [settings]);

  const columns = React.useMemo(
    () => [
      {
        name: 'ID',
        id: 'id',
        width: 60,
        minWidth: 60,
        template: (item: LogDataDC) => (
          <Text variant="body-1" color="secondary">
            {item.id}
          </Text>
        ),
      },
      {
        id: 'created_at',
        name: 'Дата',
        meta: { selectedAlways: true },
        width: 180,
        minWidth: 180,
        template: (item: LogDataDC) => <FullDate date={item.created_at} />,
      },
      {
        id: 'user',
        name: 'Пользователь',
        width: 180,
        maxWidth: 180,
        minWidth: 180,
        meta: { selectedAlways: true },
        template: (item: LogDataDC) => <VkUser user={item.user} />,
      },
      {
        name: 'Действие',
        id: 'action',
        width: isCommentVisible ? 180 : undefined,
        minWidth: 180,
        meta: { selectedAlways: true },
        template: (item: LogDataDC) => (
          <Text
            variant="body-1"
            ellipsis
            ellipsisLines={1}
            color={getActionColor(item.act)}
          >
            {item.act}
          </Text>
        ),
      },
      {
        name: 'Комментарий',
        id: 'comment',
        width: 320,
        minWidth: 220,
        maxWidth: 480,
        template: (item: LogDataDC) => {
          const content =
            !item.comment || item.comment === '' ? null : item.comment;
          if (!content) return ' ';
          return (
            <Tooltip content={content} placement="bottom" openDelay={100}>
              <Text
                color="secondary"
                ellipsis
                ellipsisLines={1}
                wordBreak="break-all"
              >
                {content}
              </Text>
            </Tooltip>
          );
        },
      },
    ],
    [isCommentVisible],
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

  const getRowActions = (item: LogDataDC): TableActionConfig<LogDataDC>[] => {
    const actions: TableActionConfig<LogDataDC>[] = [];
    if (item.user === user) {
      actions.push({
        text: 'Редактировать комментарий',
        theme: 'normal',
        handler: () => startEdit({ log: item, type }),
      });
    }
    return actions;
  };

  return (
    <TableRender
      className="table--full-width"
      data={data}
      columns={columnsWithOriginalNames}
      getRowActions={getRowActions}
      settings={settings}
      updateSettings={updateSettings}
      defaultSettings={defaultSettings}
      showResetButton
      wordWrap
      onRowClick={onRowClick}
    />
  );
};
