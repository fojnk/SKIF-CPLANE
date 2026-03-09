import { Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useState, useMemo } from 'react';

import {
  dsAccessFilter,
  projectPageModel,
} from '@/modules/stream-flow/pages/project';
import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors';
import { accessFilter, DatasetDC } from '@/modules/stream-flow/shared/types';
import {
  DataItem,
  DataItemSkeleton,
  SearchInput,
} from '@/modules/stream-flow/shared/ui';

import css from './project-aside.module.scss';

export const ProjectAsideDatasets = () => {
  const [
    project,
    dataSources,
    dataSourcesLoading,
    dataSourcesFailed,
    dataSourcesLoad,
    selectedDatasetId,
    setDataset,
  ] = useUnit([
    projectPageModel.project.current.$data,
    projectPageModel.dataSource.list.$data,
    projectPageModel.dataSource.list.$loading,
    projectPageModel.dataSource.list.$failed,
    projectPageModel.dataSource.list.load,
    projectPageModel.selected.$selectedDatasetId,
    projectPageModel.selected.setDataset,
  ]);
  const [dsFilter, setDsFilter] = useState<accessFilter>('all');
  const [search, setSearch] = useState<string>('');

  const handleDsFilterChange = (value: string) => {
    setDsFilter(value as accessFilter);
  };

  const handleDatasetClick = (data: DatasetDC) => {
    if (selectedDatasetId !== data.id) {
      setDataset({ id: data.id!, name: data.name! });
    }
  };

  const handleReload = () => {
    if (project?.id) {
      dataSourcesLoad(project.id);
    }
  };

  const filteredDatasets = useMemo(() => {
    let source = dataSources ?? [];
    if (dsFilter === 'all' && !search.trim()) return source;
    if (dsFilter === 'public') {
      source = source.filter((ds) => ds.public);
    }
    if (dsFilter === 'private') {
      source = source.filter((ds) => !ds.public);
    }
    if (search.trim()) {
      const normalizedQuery = search.toLowerCase().trim();
      source = source.filter((item) =>
        item.name?.toLowerCase().includes(normalizedQuery),
      );
    }
    return source;
  }, [dataSources, dsFilter, search]);

  const renderContent = () => {
    if (dataSourcesLoading && !dataSources) {
      return <DataItemSkeleton />;
    }

    if (dataSourcesFailed) {
      return (
        <ErrorMessage
          message="Не удалось загрузить датасеты"
          reload={handleReload}
          pending={dataSourcesLoading}
        />
      );
    }

    if (filteredDatasets.length > 0) {
      return filteredDatasets.map((dataSource) => (
        <DataItem
          key={dataSource.id}
          id={dataSource.id!}
          title={dataSource.name || 'Без названия'}
          selected={selectedDatasetId === dataSource.id}
          onClick={() => handleDatasetClick(dataSource)}
          status={
            (dataSource.public || dataSource.managed) && (
              <Flex direction="row" gap={1} alignItems="center">
                {dataSource.managed && (
                  <Text variant="code-1" color="warning-heavy">
                    M
                  </Text>
                )}
                {dataSource.public && (
                  <Text variant="code-1" color="positive-heavy">
                    P
                  </Text>
                )}
              </Flex>
            )
          }
        />
      ));
    }

    const emptyText =
      dsFilter === 'public'
        ? 'Нет публичных датасетов'
        : dsFilter === 'private'
          ? 'Нет приватных датасетов'
          : 'Нет доступных датасетов';

    return (
      <Flex direction="column" alignItems="center" style={{ padding: '6px 0' }}>
        {emptyText}
      </Flex>
    );
  };

  return (
    <Flex direction="column" gap={2} className={css.asideListWrapper}>
      {dataSources && dataSources.length > 0 && (
        <SegmentedRadioGroup
          value={dsFilter}
          onUpdate={handleDsFilterChange}
          size="m"
        >
          {dsAccessFilter.map((item) => (
            <SegmentedRadioGroup.Option
              key={item.value}
              value={item.value}
              content={item.content}
            />
          ))}
        </SegmentedRadioGroup>
      )}
      <SearchInput
        setSearch={setSearch}
        size="m"
        search={search}
        placeholder="Поиск по названию"
      />
      {renderContent()}
    </Flex>
  );
};
