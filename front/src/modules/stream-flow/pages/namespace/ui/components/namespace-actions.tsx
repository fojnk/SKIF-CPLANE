import { PencilToSquare, TrashBin } from '@gravity-ui/icons';
import { Icon } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { namespacePageModel } from '@/modules/stream-flow/pages/namespace';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { NamespaceInfoDC } from '@/modules/stream-flow/shared/types';
import { ActionsDropdown } from '@/modules/stream-flow/shared/ui';

interface Props {
  namespace: NamespaceInfoDC;
}

export const NamespaceActions = ({ namespace }: Props) => {
  const [rename, remove] = useUnit([
    namespacePageModel.rename,
    namespacePageModel.remove,
  ]);

  const hasRight = (right: streamFlowApi.dc.AclRightDC) => {
    return namespace.rights?.includes(right) ?? false;
  };

  const actions = [];

  if (hasRight(streamFlowApi.dc.AclRightDC.RightEditName)) {
    actions.push({
      action: () => {
        rename({ id: namespace.id!, name: namespace.name! });
      },
      text: 'Переименовать',
      iconStart: <Icon size={12} data={PencilToSquare} />,
    });
  }

  const deleteAction = hasRight(
    streamFlowApi.dc.AclRightDC.RightDeleteNamespace,
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
