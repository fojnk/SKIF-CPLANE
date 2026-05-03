import { useUnit } from 'effector-react';
import React from 'react';

import { projectsPageModel } from '@/modules/control-plane/pages/projects';
import { AppIcon } from '@/modules/control-plane/shared/ui/app-icon';
import { BaseLayout } from '@/routing';
import { BaseLayoutHeaderAction } from '@/routing/ui/layouts/base/components';

export const ProjectsActions = () => {
  const createProject = useUnit(projectsPageModel.createProject);

  const actions: BaseLayoutHeaderAction[] = [
    {
      action: createProject,
      text: 'Новый проект',
      view: 'glass',
      icon: AppIcon.ActionAdd,
    },
  ];

  return <BaseLayout.HeaderActions actions={actions} />;
};
