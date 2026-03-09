import { Check } from '@gravity-ui/icons';
import {
  Flex,
  Icon,
  Lang,
  Pagination,
  Table,
  TableActionConfig,
  TableSettingsData,
  Text,
  Tooltip,
  WithTableSettingsProps,
  configure,
  withTableActions,
  withTableSettings,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useState } from 'react';

import { WhoAmIModel } from '@/modules/stream-flow/entities/user/who-am-i';
import { SetVersionCommentModel } from '@/modules/stream-flow/features/dataset/version/comment/set-comment';
import {
  ShowVersionModel,
  ShowVersionMode,
} from '@/modules/stream-flow/features/dataset/version/show';
import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors';
import { DsVersionDC } from '@/modules/stream-flow/shared/types';
import { FullDate, VkUser } from '@/modules/stream-flow/shared/ui';
import {
  getDatasetVersionsInitialPageSize,
  pageSizeOptions,
  saveDatasetVersionsPageSize,
} from '@/modules/stream-flow/shared/utils/pageDataHelpers';
import {
  loadTableSettings,
  saveTableSettings,
} from '@/modules/stream-flow/shared/utils/tableSettingsStorage';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  dataset_id: number;
}

const TableWithSettings = withTableSettings<DsVersionDC>({
  sortable: true,
  filterable: false,
})(Table);

const TableRenderer = withTableActions<DsVersionDC, WithTableSettingsProps>(
  TableWithSettings,
);

export const VersionsTab = ({ dataset_id }: Props) => {
  const [pageSize, setPageSize] = useState(() =>
    getDatasetVersionsInitialPageSize(),
  );

  const [loadingUser, user, loadUser] = useUnit([
    WhoAmIModel.$loading,
    WhoAmIModel.$data,
    WhoAmIModel.load,
  ]);
  const EditComment = useUnit(SetVersionCommentModel.start);
  const dsVersions = useUnit(projectPageModel.dataSourceVersions.list);
  const currentVersion = useUnit(projectPageModel.dataSourceVersions.current);
  const showVersion = useUnit(ShowVersionModel.start);
  const dataSourceInfo = useUnit(projectPageModel.dataSource.active.$data);

  useEffect(() => {
    configure({ lang: Lang.En });
  }, []);

  const settingsStorageKey = 'sf_dataset_versions_table_settings_v1';
  const defaultSettings: TableSettingsData = [
    { id: 'version', isSelected: true },
    { id: 'created_at', isSelected: true },
    { id: 'author', isSelected: true },
    { id: 'comment', isSelected: true },
  ];

  const [settings, setSettings] = useState<TableSettingsData>(() =>
    loadTableSettings(settingsStorageKey, defaultSettings),
  );

  const updateSettings = (next: TableSettingsData) => {
    setSettings(next);
    saveTableSettings(settingsStorageKey, next);
  };

  const isCommentVisible = useMemo(() => {
    const arr = settings as Array<{
      id: string | number;
      isSelected?: boolean;
    }>;
    const found = arr.find((s) => String(s.id) === 'comment');
    return found?.isSelected ?? true;
  }, [settings]);

  const columns = useMemo<
    Array<{
      id: string;
      name: string;
      width?: number;
      meta?: Record<string, unknown>;
      template: (item: DsVersionDC) => React.ReactNode;
    }>
  >(
    () => [
      {
        id: 'version',
        name: 'Версия',
        width: 50,
        align: 'end' as const,
        meta: { selectedAlways: true },
        template: (item: DsVersionDC) => (
          <Flex alignItems="center" justifyContent="end" gap={2}>
            {currentVersion.$data === item.id && (
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
        id: 'created_at',
        name: 'Создано',
        width: 180,
        minWidth: 180,
        meta: { selectedAlways: true },
        template: (item: DsVersionDC) => <FullDate date={item.created_at} />,
      },
      {
        id: 'author',
        name: 'Автор',
        width: isCommentVisible ? 180 : undefined,
        minWidth: 180,
        maxWidth: 180,
        meta: { selectedAlways: true },
        template: (item: DsVersionDC) => (
          <span
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <VkUser user={item.creator} />
          </span>
        ),
      },
      {
        id: 'comment',
        name: 'Комментарий',
        width: 320,
        minWidth: 220,
        maxWidth: 480,
        template: (item: DsVersionDC) => {
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
    [currentVersion.$data, isCommentVisible],
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

  useEffect(() => {
    if (!user) {
      loadUser();
    }
    dsVersions.setQuery({
      dataset_id,
      page: 1,
      limit: getDatasetVersionsInitialPageSize(),
    });
    currentVersion.load(dataset_id);

    return () => {
      dsVersions.reset();
      currentVersion.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset_id]);

  const handleUpdatePage = (page: number, newPageSize: number) => {
    dsVersions.setQuery({ dataset_id, page, limit: newPageSize });
    currentVersion.load(dataset_id);
    saveDatasetVersionsPageSize(newPageSize);
    setPageSize(newPageSize);
  };

  const datasetName = dataSourceInfo?.name ?? '';

  const handleRowClick = (item: DsVersionDC, mode: ShowVersionMode) => {
    showVersion({
      version: item.version_id!,
      created_at: item.created_at!,
      dataset_id,
      dataset_name: datasetName,
      version_id: item.id!,
      mode,
      head_id: currentVersion.$data ?? 0,
    });
  };

  const getRowActions = (item: DsVersionDC) => {
    const actions: TableActionConfig<DsVersionDC>[] = [];

    if (item.creator && user && item.creator === user.name) {
      actions.push({
        text: 'Редактировать комментарий',
        theme: 'normal',
        handler: () => EditComment(item),
      });
    }

    if (item.id !== currentVersion.$data) {
      actions.push({
        text: 'Сравнить с HEAD',
        theme: 'normal',
        handler: () => handleRowClick(item, 'compare'),
      });

      actions.push({
        text: 'Восстановить версию',
        theme: 'normal',
        handler: () => handleRowClick(item, 'restore'),
      });
    }

    return actions;
  };

  if ((dsVersions.$loading || loadingUser) && !dsVersions.$data) {
    return <GlobalLoader absolute size="m" />;
  }

  if (dsVersions.$failed) {
    return <ErrorMessage reload={dsVersions.reload} />;
  }

  if (!dsVersions.$data || dsVersions.$data.length === 0) {
    return <Flex direction="row">Версии датасета не найдены</Flex>;
  }

  return (
    <Flex
      direction="column"
      gapRow={2}
      style={{ maxWidth: '1000px', width: '100%', position: 'relative' }}
    >
      {dsVersions.$loading && <GlobalLoader absolute size="m" />}
      <TableRenderer
        data={dsVersions.$data}
        columns={columnsWithOriginalNames}
        emptyMessage="Версии датасета не найдены"
        className="table--full-width"
        onRowClick={(item) => handleRowClick(item, 'view')}
        getRowDescriptor={(item) => ({ id: item.id!.toString() })}
        getRowActions={getRowActions}
        settings={settings}
        updateSettings={updateSettings}
        defaultSettings={defaultSettings}
        showResetButton
      />
      <Flex direction="row" justifyContent="center">
        <Pagination
          total={dsVersions.$total}
          page={dsVersions.$query?.page ?? 1}
          pageSize={pageSize}
          pageSizeOptions={[...pageSizeOptions]}
          onUpdate={handleUpdatePage}
        />
      </Flex>
    </Flex>
  );
};
