import { PencilToSquare, TrashBin } from '@gravity-ui/icons';
import { Icon } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { namespacePageModel } from '@/modules/control-plane/pages/namespace';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { NamespaceInfoDC } from '@/modules/control-plane/shared/types';
import { ActionsDropdown } from '@/modules/control-plane/shared/ui';

interface Props {
  namespace: NamespaceInfoDC;
}

export const NamespaceActions = ({ namespace }: Props) => {
  const [rename, remove] = useUnit([
    namespacePageModel.rename,
    namespacePageModel.remove,
  ]);

  const hasRight = (right: controlPlaneApi.dc.AclRightDC) => {
    return namespace.rights?.includes(right) ?? false;
  };

  const actions = [];

  if (hasRight(controlPlaneApi.dc.AclRightDC.RightEditName)) {
    actions.push({
      action: () => {
        rename({ id: namespace.id!, name: namespace.name! });
      },
      text: 'Переименовать',
      iconStart: <Icon size={12} data={PencilToSquare} />,
    });
  }

  const deleteAction = hasRight(
    controlPlaneApi.dc.AclRightDC.RightDeleteNamespace,
  )
    ? [
        {
          action: () => {
            remove({ id: namespace.id!, name: namespace.name! });
          },
          text: 'Удалить',
          iconStart: <Icon size={12} data={TrashBin} />,
          theme: 'danger' as const,
        },
      ]
    : [];

  const items = [actions, deleteAction].filter((group) => group.length > 0);

  return <ActionsDropdown items={items} />;
};
