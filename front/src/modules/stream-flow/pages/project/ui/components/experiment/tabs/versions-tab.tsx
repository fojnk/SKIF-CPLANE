import { Check } from '@gravity-ui/icons';
import {
  Table,
  Pagination,
  Flex,
  withTableActions,
  TableActionConfig,
  Text,
  withTableSettings,
  TableSettingsData,
  WithTableSettingsProps,
  configure,
  Lang,
  Tooltip,
  Icon,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useState } from 'react';

import { WhoAmIModel } from '@/modules/stream-flow/entities/user/who-am-i';
import { SetVersionCommentModel } from '@/modules/stream-flow/features/version/comment/set-comment';
import {
  ShowVersionModel,
  ShowVersionMode,
} from '@/modules/stream-flow/features/version/show';
import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors';
import { PipeVersionDC } from '@/modules/stream-flow/shared/types';
import { FullDate, VkUser } from '@/modules/stream-flow/shared/ui';
import {
  getExperimentVersionsInitialPageSize,
  saveExperimentVersionsPageSize,
  pageSizeOptions,
} from '@/modules/stream-flow/shared/utils/pageDataHelpers';
import {
  loadTableSettings,
  saveTableSettings,
} from '@/modules/stream-flow/shared/utils/tableSettingsStorage';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  experiment_id: number;
  experiment_name: string;
}

const TableWithSettings = withTableSettings<PipeVersionDC>({
  sortable: true,
  filterable: false,
})(Table);
const TableRenderer = withTableActions<PipeVersionDC, WithTableSettingsProps>(
  TableWithSettings,
);

export const VersionsTab = ({ experiment_id, experiment_name }: Props) => {
  const [pageSize, setPageSize] = useState(() =>
    getExperimentVersionsInitialPageSize(),
  );
  const [loadingUser, user, loadUser] = useUnit([
    WhoAmIModel.$loading,
    WhoAmIModel.$data,
    WhoAmIModel.load,
  ]);
  const EditComment = useUnit(SetVersionCommentModel.start);
  const experimentVersions = useUnit(projectPageModel.experimentVersions.list);
  const currentVersion = useUnit(projectPageModel.experimentVersions.current);
  const showVersion = useUnit(ShowVersionModel.start);
  useEffect(() => {
    configure({ lang: Lang.En });
  }, []);

  const settingsStorageKey = 'sf_experiment_versions_table_settings_v2';
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

  const isCommentVisible = React.useMemo(() => {
    const arr = settings as Array<{
      id: string | number;
      isSelected?: boolean;
    }>;
    const found = arr.find((s) => String(s.id) === 'comment');
    return found?.isSelected ?? true;
  }, [settings]);

  const columns = React.useMemo<
    Array<{
      id: string;
      name: string;
      width?: number;
      meta?: Record<string, unknown>;
      template: (item: PipeVersionDC) => React.ReactNode;
    }>
  >(
    () => [
      {
        id: 'version',
        name: 'Версия',
        width: 50,
        align: 'end' as const,
        meta: { selectedAlways: true },
        template: (item: PipeVersionDC) => (
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
        template: (item: PipeVersionDC) => <FullDate date={item.created_at} />,
      },
      {
        id: 'author',
        name: 'Автор',
        width: isCommentVisible ? 180 : undefined,
        minWidth: 180,
        maxWidth: 180,
        meta: { selectedAlways: true },
        template: (item: PipeVersionDC) => (
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
        width: 320,
        minWidth: 220,
        maxWidth: 480,
        template: (item: PipeVersionDC) => {
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

  useEffect(() => {
    if (!user) loadUser();
    experimentVersions.setQuery({
      experiment_id,
      page: 1,
      limit: getExperimentVersionsInitialPageSize(),
    });
    currentVersion.load(experiment_id);

    return () => {
      experimentVersions.reset();
      currentVersion.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiment_id]);

  const handleUpdatePage = (page: number, newPageSize: number) => {
    experimentVersions.setQuery({ experiment_id, page, limit: newPageSize });
    currentVersion.load(experiment_id);
    saveExperimentVersionsPageSize(pageSize);
    setPageSize(newPageSize);
    experimentVersions.setQuery({ experiment_id, page, limit: newPageSize });
  };

  const handleRowClick = (item: PipeVersionDC, mode: ShowVersionMode) => {
    showVersion({
      version: item.version_id!,
      created_at: item.created_at!,
      experiment_id,
      experiment_name,
      version_id: item.id!,
      mode,
      head_id: currentVersion.$data ?? 0,
    });
  };

  const getRowActions = (item: PipeVersionDC) => {
    const actions: TableActionConfig<PipeVersionDC>[] = [];
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
        handler: () => {
          handleRowClick(item, 'compare');
        },
      });
      actions.push({
        text: 'Восстановить версию',
        theme: 'normal',
        handler: () => {
          handleRowClick(item, 'restore');
        },
      });
    }

    return actions;
  };
  if (
    (experimentVersions.$loading || loadingUser) &&
    !experimentVersions.$data
  ) {
    return <GlobalLoader absolute size="m" />;
  }

  if (experimentVersions.$failed) {
    return <ErrorMessage reload={experimentVersions.reload} />;
  }

  if (!experimentVersions.$data || experimentVersions.$data.length === 0) {
    return <Flex direction="row">Версии эксперимента не найдены</Flex>;
  }

  return (
    <Flex
      direction="column"
      gapRow={2}
      style={{ maxWidth: '1000px', width: '100%', position: 'relative' }}
    >
      {experimentVersions.$loading && <GlobalLoader absolute size="m" />}
      <TableRenderer
        data={experimentVersions.$data}
        columns={columnsWithOriginalNames}
        emptyMessage="Версии эксперимента не найдены"
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
          total={experimentVersions.$total}
          page={experimentVersions.$query?.page ?? 1}
          pageSize={pageSize}
          pageSizeOptions={[...pageSizeOptions]}
          onUpdate={handleUpdatePage}
        />
      </Flex>
    </Flex>
  );
};
