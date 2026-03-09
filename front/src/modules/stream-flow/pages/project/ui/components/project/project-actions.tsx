import { Pencil, TrashBin } from '@gravity-ui/icons';
import { Icon } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ActionsDropdown } from '@/modules/stream-flow/shared/ui';

interface Props {
  id: number;
  name: string;
  description?: string;
}

const AclRight = streamFlowApi.dc.AclRightDC;

export const ProjectActions = ({ id, name, description }: Props) => {
  const [removeProject, renameProject] = useUnit([
    projectPageModel.removeProject,
    projectPageModel.renameProject,
  ]);

  const project = useUnit(projectPageModel.project.current.$data);
  const canEditName =
    project?.rights?.includes(AclRight.RightEditName) ?? false;
  const canDelete =
    project?.rights?.includes(AclRight.RightDeleteProject) ?? false;

  const action_rename = {
    action: () => {
      renameProject({ id, name, description });
    },
    text: 'Редактировать',
    iconStart: <Icon size={12} data={Pencil} />,
  };

  const action_remove = {
    action: () => {
      removeProject({ id, name });
    },
    text: 'Удалить',
    iconStart: <Icon size={12} data={TrashBin} />,
  };

  // Формируем доступные действия на основе прав
  const mainActions = canEditName ? [action_rename] : [];

  const dangerActions = canDelete
    ? [{ ...action_remove, theme: 'danger' }]
    : [];

  const items = [
    mainActions.length > 0 ? mainActions : null,
    dangerActions.length > 0 ? dangerActions : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return <ActionsDropdown items={items} />;
};
