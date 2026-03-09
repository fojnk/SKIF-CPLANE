import React from 'react';

import { AclInfo } from '@/modules/control-plane/shared/components';

interface AclTabProps {
  namespace_id: number;
}
export const AclTab = ({ namespace_id }: AclTabProps) => {
  return <AclInfo objectType="namespace" objectId={namespace_id} />;
};
