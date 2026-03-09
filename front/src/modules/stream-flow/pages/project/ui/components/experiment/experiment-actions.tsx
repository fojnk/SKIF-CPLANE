import { Pencil, TrashBin, Stop, CopyArrowRight } from '@gravity-ui/icons';
import { Icon } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ProjectInfoDC } from '@/modules/stream-flow/shared/types';
import { ActionsDropdown } from '@/modules/stream-flow/shared/ui';

interface Props {
  id: number;
  name: string;
  project: ProjectInfoDC;
}

const AclRight = streamFlowApi.dc.AclRightDC;

export const ExperimentActions = ({ id, name, project }: Props) => {
  const [
    removeExperiment,
    renameExperiment,
    stopExperiment,
    pendingExperiment,
    clone,
  ] = useUnit([
    projectPageModel.removeExperiment,
    projectPageModel.renameExperiment,
    projectPageModel.stopExperiment,
    projectPageModel.$pendingExperiment,
    projectPageModel.clone,
  ]);

  const experiment = useUnit(projectPageModel.experiment.active.$data);
  const loading = useUnit(projectPageModel.experiment.active.$loading);
  const projectRights = project?.rights ?? [];
  const rights = experiment?.rights ?? [];
  const canEditName = rights.includes(AclRight.RightEditName);
  const canDelete = rights.includes(AclRight.RightDeleteExperiment);
  const canStop = rights.includes(AclRight.RightStopExperiment);
  const canCreate = projectRights.includes(AclRight.RightCreateExperiment);

  const action_rename = {
    action: () => {
      renameExperiment({
        experiment_id: id,
        name,
        description: experiment?.description ?? '',
      });
    },
    text: 'Редактировать',
    iconStart: <Icon size={12} data={Pencil} />,
  };

  const action_clone = {
    action: () => {
      clone({
        src_id: id,
        src_name: name,
        src_project: {
          id: project.id!,
          name: project.name!,
        },
        src_type: 'pipe',
        can_create: canCreate,
      });
    },
    text: 'Клонировать',
    iconStart: <Icon size={12} data={CopyArrowRight} />,
  };

  const action_remove = {
    action: () => {
      removeExperiment({ experiment_id: id, name });
    },
    text: 'Удалить',
    iconStart: <Icon size={12} data={TrashBin} />,
  };

  // Формируем доступные действия на основе прав
  const mainActions = canEditName
    ? [action_rename, action_clone]
    : [action_clone];

  const runActions = [
    canStop
      ? {
          action: () => stopExperiment(id),
          text: 'Остановить эксперимент',
          iconStart: <Icon size={12} data={Stop} />,
          disabled: pendingExperiment,
        }
      : null,
  ].filter(Boolean) as Array<{ action: () => void; text: string }>;

  const dangerActions = canDelete
    ? [{ ...action_remove, theme: 'danger' }]
    : [];

  const items = [
    runActions.length > 0 ? runActions : null,
    mainActions.length > 0 ? mainActions : null,
    dangerActions.length > 0 ? dangerActions : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return <ActionsDropdown loading={loading} items={items} />;
};
