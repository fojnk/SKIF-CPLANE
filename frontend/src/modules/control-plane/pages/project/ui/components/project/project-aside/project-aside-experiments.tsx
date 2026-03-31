import { Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { projectPageModel } from '@/modules/control-plane/pages/project';
import { ErrorMessage } from '@/modules/control-plane/shared/components/sf-errors';
import { ExperimentParams } from '@/modules/control-plane/shared/types';
import {
  DataItem,
  DataItemSkeleton,
  ExperimentStatus,
  SearchInput,
} from '@/modules/control-plane/shared/ui';

import css from './project-aside.module.scss';

export const ProjectAsideExperiments = () => {
  const [
    project,
    experiments,
    experimentsLoading,
    experimentsFailed,
    experimentsLoad,
    selectedExperimentId,
    setExperiment,
    setSearchQuery,
    searchQuery,
  ] = useUnit([
    projectPageModel.project.current.$data,
    projectPageModel.experiment.list.$filteredData,
    projectPageModel.experiment.list.$loading,
    projectPageModel.experiment.list.$failed,
    projectPageModel.experiment.list.load,
    projectPageModel.selected.$selectedExperimentId,
    projectPageModel.selected.setExperiment,
    projectPageModel.experiment.list.searchQueryChanged,
    projectPageModel.experiment.list.$searchQuery,
  ]);

  const handleExperimentClick = (data: ExperimentParams) => {
    if (selectedExperimentId !== data.id) {
      setExperiment({ id: data.id!, name: data.name! });
    }
  };

  const handleReload = () => {
    if (project?.id) {
      experimentsLoad(project.id);
    }
  };

  React.useEffect(() => {
    const projectId = project?.id;
    if (!projectId) return;
    const tick = () => experimentsLoad(projectId);
    // initial fetch to refresh statuses
    tick();
    const intervalId = window.setInterval(tick, 10000);
    return () => {
      clearInterval(intervalId);
    };
  }, [project?.id, experimentsLoad]);

  return (
    <Flex direction="column" gap={2} className={css.asideListWrapper}>
      <SearchInput
        size="m"
        search={searchQuery}
        setSearch={setSearchQuery}
        placeholder="Поиск по названию"
      />
      {experimentsLoading && !experiments ? (
        <DataItemSkeleton />
      ) : experimentsFailed ? (
        <ErrorMessage
          message="Не удалось загрузить эксперименты"
          reload={handleReload}
          pending={experimentsLoading}
        />
      ) : experiments && experiments.length > 0 ? (
        experiments.map((experiment) => (
          <DataItem
            key={experiment.id}
            id={experiment.id!}
            title={experiment.name || 'Эксперимент без названия'}
            selected={selectedExperimentId === experiment.id}
            onClick={() => handleExperimentClick(experiment)}
            status={<ExperimentStatus status={experiment.status} />}
          />
        ))
      ) : (
        <Flex direction="column" alignItems="center">
          Нет доступных экспериментов
        </Flex>
      )}
    </Flex>
  );
};
