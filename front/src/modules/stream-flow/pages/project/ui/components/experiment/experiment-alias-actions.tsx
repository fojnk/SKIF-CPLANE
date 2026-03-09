import { Ellipsis, PencilToSquare, TrashBin } from '@gravity-ui/icons';
import { DropdownMenu, Icon, Skeleton } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { projectPageModel } from '@/modules/stream-flow/pages/project';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { Button } from '@/shared/ui/button';

interface Props {
  link_id: number;
  alias: string;
  experiment_id: number;
}

const AclRight = streamFlowApi.dc.AclRightDC;

export const ExperimentAliasActions = ({
  link_id,
  alias,
  experiment_id,
}: Props) => {
  const [remove, rename] = useUnit([
    projectPageModel.removeExperimentDataset,
    projectPageModel.renameExperimentDataset,
  ]);

  const experiment = useUnit(projectPageModel.experiment.active.$data);
  const loading = useUnit(projectPageModel.experiment.active.$loading);

  const rights = experiment?.rights ?? [];
  const canEditName = rights.includes(AclRight.RightDeleteDataset);
  const canDelete = rights.includes(AclRight.RightDeleteDataset);

  const action_rename = {
    action: () => {
      rename({ experiment_id, link_id, alias });
    },
    text: 'Переименовать',
    iconStart: <Icon size={12} data={PencilToSquare} />,
  };

  const action_remove = {
    action: () => {
      remove({ experiment_id, link_id, alias });
    },
    text: 'Удалить связь',
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

  if (loading) {
    return <Skeleton style={{ width: '24px', height: '24px', opacity: 0.5 }} />;
  }

  // Если нет доступных действий, не отображаем кнопку
  if (items.length === 0) {
    return null;
  }

  return (
    <DropdownMenu
      size="l"
      renderSwitcher={(props) => (
        <Button {...props} view="outlined" size="s">
          <Icon size={16} data={Ellipsis} />
        </Button>
      )}
      items={items}
    />
  );
};
