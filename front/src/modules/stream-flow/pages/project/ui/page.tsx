import { Button } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { navigationModel } from '@/modules/stream-flow/features/navigation';
import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { ErrorCard } from '@/modules/stream-flow/shared/components/sf-errors';
import { SFLayoutMain } from '@/modules/stream-flow/shared/layout';
import { getFromStorage, setToStorage } from '@/shared/lib/common/storage';
import { useValue } from '@/shared/lib/react/hooks/use-value';
import { GlobalLoader } from '@/shared/ui/loaders';

import {
  DsContent,
  ExperimentContent,
  ProjectAside,
  ProjectContent,
} from './components';

export const SFProjectPage = () => {
  const [project, loading, failed, error, selected] = useUnit([
    projectPageModel.project.current.$data,
    projectPageModel.project.current.$loading,
    projectPageModel.project.current.$failed,
    projectPageModel.project.current.$error,
    projectPageModel.selected.$selected,
  ]);

  const handleBackToList = () => {
    navigationModel.projects.navigate();
  };

  const defaultAside = (getFromStorage({
    type: 'local',
    key: 'project_aside',
  }) ?? true) as boolean;

  const disclosureAside = useValue<boolean>(defaultAside);
  const toggleAside = () => {
    const extended = !disclosureAside.value;
    setToStorage({ type: 'local', key: 'project_aside', value: extended });
    disclosureAside.set(extended);
  };

  // Функция для рендера контента в зависимости от выбранного элемента
  const renderContent = () => {
    if (!project) {
      return null;
    }

    if (!selected) {
      // Если ничего не выбрано - показываем контент проекта
      return <ProjectContent project={project} />;
    }

    const { type, id } = projectPageModel.selected.parseSelected(selected);

    if (type === 'pipe') {
      return <ExperimentContent experiment_id={id!} project={project} />;
    }

    if (type === 'ds') {
      return <DsContent ds_id={id!} project={project} />;
    }

    // Fallback на контент проекта
    return <ProjectContent project={project} />;
  };

  const backToListButton = (
    <Button view="outlined" onClick={handleBackToList}>
      Back to Projects List
    </Button>
  );

  // Показываем лоадер во время загрузки
  if (loading) {
    return (
      <SFLayoutMain>
        <GlobalLoader />
      </SFLayoutMain>
    );
  }

  // Показываем ошибку если загрузка не удалась
  if (failed) {
    const errorCode = error?.status || 500;

    if (errorCode === 404) {
      return (
        <SFLayoutMain>
          <ErrorCard
            title="Project Not Found"
            message="The requested project could not be found. It may have been deleted or you may not have access to it."
            button={backToListButton}
          />
        </SFLayoutMain>
      );
    }

    if (errorCode === 403) {
      return (
        <SFLayoutMain>
          <ErrorCard
            title="Access Denied"
            message="You don't have permission to access this project. Please contact your administrator for access."
            button={backToListButton}
          />
        </SFLayoutMain>
      );
    }

    // Общая ошибка для других кодов
    return (
      <SFLayoutMain>
        <ErrorCard
          title="Error Loading Project"
          message={`Failed to load project. Error code: ${errorCode}`}
          button={backToListButton}
        />
      </SFLayoutMain>
    );
  }
  // Если нет данных, но нет ошибки - показываем пустое состояние
  if (!project) {
    return (
      <SFLayoutMain>
        <ErrorCard
          title="No Data Available"
          message="No project information is available."
          button={backToListButton}
        />
      </SFLayoutMain>
    );
  }

  return (
    <SFLayoutMain
      resizable={{
        pageId: 'sf-project-page',
        canCollapse: false,
      }}
      showAside={disclosureAside.value}
      toggleAside={toggleAside}
      aside={<ProjectAside />}
    >
      {renderContent()}
    </SFLayoutMain>
  );
};
