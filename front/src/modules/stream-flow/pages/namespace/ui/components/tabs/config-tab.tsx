import { useUnit } from 'effector-react';
import React, { useMemo } from 'react';

import { namespacePageModel } from '@/modules/stream-flow/pages/namespace';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ConfigViewer } from '@/modules/stream-flow/shared/components';

interface Props {
  namespace: streamFlowApi.dc.ResponsesGetNamespaceResponseDC;
}

export const ConfigTab = ({ namespace }: Props) => {
  const editConfig = useUnit(namespacePageModel.editConfig);
  const canEdit = useMemo(
    () =>
      namespace.rights?.includes(streamFlowApi.dc.AclRightDC.RightEditConfig) ??
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
