import { useUnit } from 'effector-react';
import React from 'react';

import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ErrorCard } from '@/modules/stream-flow/shared/components/sf-errors';
import { ProjectInfoDC } from '@/modules/stream-flow/shared/types';
import { GlobalLoader } from '@/shared/ui/loaders';

import { ExperimentHeader, ExperimentTabs } from './';

interface Props {
  experiment_id: number;
  project: ProjectInfoDC;
}

export const ExperimentContent = ({ experiment_id, project }: Props) => {
  const [loading, data] = useUnit([
    projectPageModel.experiment.list.$loading,
    projectPageModel.experiment.list.$data,
  ]);

  // Показываем лоадер во время загрузки списка experiments
  if (loading && !data) {
    return <GlobalLoader absolute />;
  }

  // Ищем experiment по ID в списке
  const experiment = data?.find(
    (p: streamFlowApi.dc.DtoCompleteExperimentListDC) => p.id === experiment_id,
  );

  // Если experiment не найден - показываем 404
  if (!experiment) {
    return (
      <ErrorCard
        title="Experiment Not Found"
        message={`Experiment with ID ${experiment_id} was not found. It may have been deleted or you may not have access to it.`}
      />
    );
  }

  return (
    <>
      <ExperimentHeader
        id={experiment_id}
        name={experiment.name!}
        status={experiment.status as string}
        project={project}
      />
      <ExperimentTabs experiment_id={experiment.id!} project={project} />
    </>
  );
};
