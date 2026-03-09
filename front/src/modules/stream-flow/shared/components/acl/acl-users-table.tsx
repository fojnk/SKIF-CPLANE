import { Check, Xmark } from '@gravity-ui/icons';
import {
  Table,
  Text,
  withTableSettings,
  TableSettingsData,
  configure,
  Lang,
  withTableActions,
  WithTableSettingsProps,
  Label,
} from '@gravity-ui/uikit';
import React from 'react';

import { EntityType, UserRightsDC } from '@/modules/stream-flow/shared/types';
import { VkUser } from '@/modules/stream-flow/shared/ui';
import { getUserSimpleRight } from '@/modules/stream-flow/shared/utils/aclHelpers';
import {
  loadTableSettings,
  saveTableSettings,
} from '@/modules/stream-flow/shared/utils/tableSettingsStorage';

interface AclUsersTableProps {
  data: UserRightsDC[];
  objectType: EntityType;
  hasSearch?: boolean;
}

const TableWithSettings = withTableSettings<UserRightsDC>({
  sortable: true,
  filterable: false,
})(Table);
const TableRender = withTableActions<UserRightsDC, WithTableSettingsProps>(
  TableWithSettings,
);

export const AclUsersTable = ({
  data,
  objectType,
  hasSearch,
}: AclUsersTableProps) => {
  React.useEffect(() => {
    configure({ lang: Lang.En });
  }, []);

  const renderRightIcon = (hasRight: boolean) => {
    return hasRight ? (
      <Label theme="success" icon={<Check />} />
    ) : (
      <Label theme="danger" icon={<Xmark />} />
    );
  };

  const settingsStorageKey = 'sf_users_table_settings_v1';
  const defaultSettings: TableSettingsData = [
    { id: 'id', isSelected: false },
    { id: 'name', isSelected: true },
    { id: 'edit', isSelected: true },
    ...(objectType !== 'dataset' ? [{ id: 'create', isSelected: true }] : []),
    { id: 'delete', isSelected: true },
  ];

  const [settings, setSettings] = React.useState<TableSettingsData>(() =>
    loadTableSettings(settingsStorageKey, defaultSettings),
  );

  const updateSettings = (next: TableSettingsData) => {
    setSettings(next);
    saveTableSettings(settingsStorageKey, next);
  };

  const baseColumns = [
    {
      name: 'ID',
      id: 'id',
      width: 60,
      minWidth: 60,
      template: (item: UserRightsDC) => (
        <Text variant="body-1" color="secondary">
          {item.id}
        </Text>
      ),
    },
    {
      id: 'name',
      name: 'Пользователь',
      meta: { selectedAlways: true },
      minWidth: 200,
      template: (item: UserRightsDC) => <VkUser user={item.name} />,
    },
    {
      id: 'edit',
      name: 'Редактирование',
      meta: { selectedAlways: true },
      width: 90,
      minWidth: 90,
      template: (item: UserRightsDC) => {
        const hasEditRight = getUserSimpleRight(
          item.rights || [],
          'edit',
          objectType,
        );
        return renderRightIcon(hasEditRight);
      },
    },
  ];

  const createColumn = {
    id: 'create',
    name: 'Создание',
    meta: { selectedAlways: true },
    width: 90,
    minWidth: 90,
    template: (item: UserRightsDC) => {
      const hasCreateRight = getUserSimpleRight(
        item.rights || [],
        'create',
        objectType,
      );
      return renderRightIcon(hasCreateRight);
    },
  };

  const deleteColumn = {
    id: 'delete',
    name: 'Удаление',
    meta: { selectedAlways: true },
    width: 90,
    minWidth: 90,
    template: (item: UserRightsDC) => {
      const hasDeleteRight = getUserSimpleRight(
        item.rights || [],
        'delete',
        objectType,
      );
      return renderRightIcon(hasDeleteRight);
    },
  };

  const columns = [
    ...baseColumns,
    ...(objectType !== 'dataset' ? [createColumn] : []),
    deleteColumn,
  ];

  const columnsWithOriginalNames = columns.map((column) => ({
    ...column,
    meta: {
      ...(column as any).meta,
      _originalName:
        typeof column.name === 'function'
          ? String((column.name as () => string)())
          : String(column.name as string),
    },
  }));

  const emptyMessage = hasSearch
    ? 'Нет пользователей по вашему запросу'
    : 'Нет пользователей';

  return (
    <TableRender
      className="table--full-width"
      data={data}
      columns={columnsWithOriginalNames}
      settings={settings}
      updateSettings={updateSettings}
      defaultSettings={defaultSettings}
      showResetButton
      wordWrap
      emptyMessage={emptyMessage}
    />
  );
};
