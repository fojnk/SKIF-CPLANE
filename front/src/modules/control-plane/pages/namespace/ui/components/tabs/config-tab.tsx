import { useUnit } from 'effector-react';
import React, { useMemo } from 'react';

import { namespacePageModel } from '@/modules/control-plane/pages/namespace';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ConfigViewer } from '@/modules/control-plane/shared/components';

interface Props {
  namespace: controlPlaneApi.dc.ResponsesGetNamespaceResponseDC;
}

export const ConfigTab = ({ namespace }: Props) => {
  const editConfig = useUnit(namespacePageModel.editConfig);
  const canEdit = useMemo(
    () =>
      namespace.rights?.includes(controlPlaneApi.dc.AclRightDC.RightEditConfig) ??
      false,
    [namespace.rights],
  );

  return (
    <ConfigViewer
      data={namespace.config}
      onEditClick={() => {
        editConfig({
          id: namespace.id!,
          name: namespace.name!,
        });
      }}
      canEdit={canEdit}
    />
  );
};
