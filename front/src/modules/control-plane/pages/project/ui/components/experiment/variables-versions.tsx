import { Check } from '@gravity-ui/icons';
import {
  Table,
  Pagination,
  Flex,
  withTableSettings,
  TableSettingsData,
  configure,
  Lang,
  Text,
  Tooltip,
  Label,
  withTableActions,
  TableActionConfig,
  WithTableSettingsProps,
  withTableCopy,
  Icon,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useState } from 'react';

import { WhoAmIModel } from '@/modules/control-plane/entities/user/who-am-i';
import { VariableVersionsListModel } from '@/modules/control-plane/entities/variables/versions/list';
import { SetVersionCommentModel } from '@/modules/control-plane/features/variable/version/comment/set-comment';
import { VariableShowModel } from '@/modules/control-plane/features/variable/version/show';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ErrorMessage } from '@/modules/control-plane/shared/components/sf-errors';
import {
  ExperimentVariableItem,
  VariableVersion,
  AclRightDC,
} from '@/modules/control-plane/shared/types';
import { FullDate, VkUser } from '@/modules/control-plane/shared/ui';
import {
  pageSizeOptions,
  getVariableVersionsInitialPageSize,
  saveVariableVersionsPageSize,
} from '@/modules/control-plane/shared/utils/pageDataHelpers';
import {
  loadTableSettings,
  saveTableSettings,
} from '@/modules/control-plane/shared/utils/tableSettingsStorage';
import {
  getTypeTheme,
  getTypeLabel,
} from '@/modules/control-plane/shared/utils/variablesHelpers';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  experiment_id: number;
  selectedVariable: ExperimentVariableItem | null;
  rights?: AclRightDC[] | null;
}

const TableWithSettings = withTableSettings<VariableVersion>({
  sortable: true,
  filterable: false,
})(Table);

const TableWithCopy = withTableCopy(TableWithSettings);

const TableRenderer = withTableActions<VariableVersion, WithTableSettingsProps>(
  TableWithCopy,
);

export const VariablesVersions = ({
  experiment_id,
  selectedVariable,
  rights,
}: Props) => {
  const canEdit =
    rights?.includes(controlPlaneApi.dc.AclRightDC.RightEditVariable) ?? false;
  const [pageSize, setPageSize] = useState(() =>
    getVariableVersionsInitialPageSize(),
  );
  const [page, setPage] = useState(1);

  const [data, loading, failed, total, load, reset] = useUnit([
    VariableVersionsListModel.$data,
    VariableVersionsListModel.$loading,
    VariableVersionsListModel.$failed,
    VariableVersionsListModel.$total,
    VariableVersionsListModel.load,
    VariableVersionsListModel.reset,
  ]);

  const [loadingUser, user, loadUser] = useUnit([
    WhoAmIModel.$loading,
    WhoAmIModel.$data,
    WhoAmIModel.load,
  ]);

  const showVariable = useUnit(VariableShowModel.start);
  const editComment = useUnit(SetVersionCommentModel.start);

  useEffect(() => {
    configure({ lang: Lang.En });
  }, []);

  useEffect(() => {
    if (!user) loadUser();
    load({
      experiment_id,
      variable_id: selectedVariable?.id,
      limit: pageSize,
      from: (page - 1) * pageSize,
    });

    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiment_id, selectedVariable, page, pageSize]);

  const settingsStorageKey = 'cp_variable_versions_table_settings_v2';

  const defaultSettings: TableSettingsData = React.useMemo(() => {
    const baseSettings = [
      { id: 'version', isSelected: true },
      { id: 'created_at', isSelected: true },
      { id: 'author', isSelected: true },
      { id: 'comment', isSelected: true },
    ];

    // Если переменная не выбрана - добавляем колонки Type и Variable
    if (!selectedVariable) {
      baseSettings.splice(1, 0, { id: 'variable_type', isSelected: true });
      baseSettings.splice(2, 0, { id: 'variable_name', isSelected: true });
    }

    return baseSettings;
  }, [selectedVariable]);

  const [settings, setSettings] = useState<TableSettingsData>(() =>
    loadTableSettings(settingsStorageKey, defaultSettings),
  );

  const updateSettings = (next: TableSettingsData) => {
    setSettings(next);
    saveTableSettings(settingsStorageKey, next);
  };

  const columns = React.useMemo(() => {
    const allColumns = [
      {
        id: 'version',
        name: 'Версия',
        width: 50,
        align: 'end' as const,
        meta: { selectedAlways: true },
        template: (item: VariableVersion) => (
          <Flex alignItems="center" justifyContent="end" gap={2}>
            {item.head && (
              <Icon
                data={Check}
                size={12}
                style={{ color: 'var(--g-color-text-positive)' }}
              />
            )}
            {item.version_id}
          </Flex>
        ),
      },
      {
        id: 'variable_type',
        name: 'Тип',
        width: 50,
        align: 'end' as const,
        template: (item: VariableVersion) => (
          <Label theme={getTypeTheme(item.variable_type!)} size="xs">
            {getTypeLabel(item.variable_type!)}
          </Label>
        ),
      },
      {
        id: 'variable_name',
        name: 'Переменная',
        meta: {
          selectedAlways: true,
          copy: (item: VariableVersion) => item.variable_name || '',
        },
        template: (item: VariableVersion) => (
          <Flex
            alignItems="center"
            style={{ height: '100%', maxWidth: '590px' }}
          >
            <Text variant="body-1" ellipsis style={{ fontWeight: 500 }}>
              {item.variable_name}
            </Text>
          </Flex>
        ),
      },
      {
        id: 'created_at',
        name: 'Создано',
        width: 180,
        template: (item: VariableVersion) => (
          <FullDate date={item.created_at} />
        ),
      },
      {
        id: 'author',
        name: 'Автор',
        width: 180,
        minWidth: 180,
        template: (item: VariableVersion) => (
          <span
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <VkUser user={item.creator} />
          </span>
        ),
      },
      {
        id: 'comment',
        name: 'Комментарий',
        width: 40,
        template: (item: VariableVersion) => {
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
    ];

    // Если выбрана конкретная переменная - скрываем колонки Type и Variable
    if (selectedVariable) {
      return allColumns.filter(
        (col) => col.id !== 'variable_type' && col.id !== 'variable_name',
      );
    }

    return allColumns;
  }, [selectedVariable]);

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

  const handleUpdatePage = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== pageSize) {
      saveVariableVersionsPageSize(newPageSize);
      setPageSize(newPageSize);
    }
  };

  // Метод для формирования payload версии переменной
  const getVariablePayload = (
    item: VariableVersion,
    mode: 'view' | 'edit' | 'restore' | 'compare',
  ) => {
    return {
      item: {
        id: item.variable_id!,
        name: item.variable_name!,
        type: (item.variable_type || 'string') as
          | 'string'
          | 'int'
          | 'json'
          | 'yql'
          | 'python',
        version_id: item.id!,
        version_id_name: item.version_id!,
      },
      canEdit,
      mode,
      head: item.head!,
    };
  };

  const handleRowClick = (item: VariableVersion) => {
    showVariable(getVariablePayload(item, 'view'));
  };

  const getRowActions = (
    item: VariableVersion,
  ): TableActionConfig<VariableVersion>[] => {
    const actions: TableActionConfig<VariableVersion>[] = [];

    // Edit version - доступно для head-версий если есть права на редактирование
    if (canEdit && item.head) {
      actions.push({
        text: 'Редактировать версию',
        theme: 'normal',
        handler: () => {
          showVariable(getVariablePayload(item, 'edit'));
        },
      });
    }

    // Для не-head версий с правами на редактирование
    if (canEdit && !item.head) {
      // 1. Compare with head
      actions.push({
        text: 'Сравнить с HEAD',
        theme: 'normal',
        handler: () => {
          showVariable(getVariablePayload(item, 'compare'));
        },
      });

      // 2. Restore version
      actions.push({
        text: 'Восстановить версию',
        theme: 'normal',
        handler: () => {
          showVariable(getVariablePayload(item, 'restore'));
        },
      });
    }

    // 3. Edit comment - только автор версии может редактировать комментарий
    if (item.creator && user && item.creator === user.name) {
      actions.push({
        text: 'Редактировать комментарий',
        theme: 'normal',
        handler: () => {
          editComment({
            comment: item.comment,
            version_id: item.id!,
            version_id_name: item.version_id!,
          } as any);
        },
      });
    }

    return actions;
  };

  if (loading && !data) {
    return <GlobalLoader absolute size="m" />;
  }

  if (failed) {
    return (
      <ErrorMessage
        message="Не удалось загрузить версии переменных"
        reload={() =>
          load({
            experiment_id,
            variable_id: selectedVariable?.id,
            limit: pageSize,
            from: (page - 1) * pageSize,
          })
        }
        pending={loading}
      />
    );
  }

  if (!data || data.length === 0) {
    return <Flex direction="row">Для этой переменной версии не найдены</Flex>;
  }

  return (
    <Flex
      direction="column"
      gapRow={2}
      style={{ maxWidth: '1000px', width: '100%', position: 'relative' }}
    >
      {(loading || loadingUser) && <GlobalLoader absolute size="m" />}
      <TableRenderer
        data={data}
        columns={columnsWithOriginalNames}
        emptyMessage="Версии не найдены"
        className="table--full-width"
        onRowClick={handleRowClick}
        getRowDescriptor={(item) => ({ id: item.id!.toString() })}
        getRowActions={getRowActions}
        settings={settings}
        updateSettings={updateSettings}
        defaultSettings={defaultSettings}
        showResetButton
      />
      <Flex direction="row" justifyContent="center">
        <Pagination
          total={total}
          page={page}
          pageSize={pageSize}
          pageSizeOptions={[...pageSizeOptions]}
          onUpdate={handleUpdatePage}
        />
      </Flex>
    </Flex>
  );
};
