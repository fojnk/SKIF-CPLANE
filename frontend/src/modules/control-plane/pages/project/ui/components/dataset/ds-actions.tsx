import { CopyArrowRight, Pencil, TrashBin } from '@gravity-ui/icons';
import { Icon } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { projectPageModel } from '@/modules/control-plane/pages/project';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { DatasetDC, ProjectInfoDC } from '@/modules/control-plane/shared/types';
import { ActionsDropdown } from '@/modules/control-plane/shared/ui/actions-dropdown';

interface Props {
  dataset: DatasetDC;
  project: ProjectInfoDC;
}
const AclRight = controlPlaneApi.dc.AclRightDC;

export const DsActions = ({ dataset, project }: Props) => {
  const [remove, edit, clone] = useUnit([
    projectPageModel.removeDataset,
    projectPageModel.editDataset,
    projectPageModel.clone,
  ]);

  const dsRights = useUnit(projectPageModel.dataSource.active.$rights);
  const loading = useUnit(projectPageModel.dataSource.active.$loading);
  const projectRights = project?.rights ?? [];
  const rights = dsRights ?? [];
  const canEditName = rights.includes(AclRight.RightEditName);
  const canDelete = rights.includes(AclRight.RightDeleteDataset);
  const canCreate = projectRights.includes(AclRight.RightCreateDataset);

  const action_edit = {
    action: () => {
      edit({
        id: dataset.id!,
        name: dataset.name!,
        public: dataset.public ?? false,
      });
    },
    text: 'Редактировать',
    iconStart: <Icon size={12} data={Pencil} />,
  };

  const action_clone = {
    action: () => {
      clone({
        src_id: dataset.id!,
        src_name: dataset.name!,
        src_project: {
          id: project.id!,
          name: project.name!,
        },
        src_type: 'ds',
        can_create: canCreate,
      });
    },
    text: 'Клонировать',
    iconStart: <Icon size={12} data={CopyArrowRight} />,
  };

  const action_remove = {
    action: () => {
      remove({ id: dataset.id!, name: dataset.name! });
    },
    text: 'Удалить',
    iconStart: <Icon size={12} data={TrashBin} />,
  };

  // Формируем доступные действия на основе прав
  const mainActions = canEditName
    ? [action_edit, action_clone]
    : [action_clone];

  const dangerActions = canDelete
    ? [{ ...action_remove, theme: 'danger' }]
    : [];

  const items = [
    mainActions.length > 0 ? mainActions : null,
    dangerActions.length > 0 ? dangerActions : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return <ActionsDropdown loading={loading} items={items} />;
};
