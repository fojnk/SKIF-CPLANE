import React from 'react';

import { AclInfo } from '@/modules/control-plane/shared/components';

interface AclTabProps {
  experiment_id: number;
}

export const AclTab = ({ experiment_id }: AclTabProps) => {
  return <AclInfo objectType="experiment" objectId={experiment_id} />;
};
