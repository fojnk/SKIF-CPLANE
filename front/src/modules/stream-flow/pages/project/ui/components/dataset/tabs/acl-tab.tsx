import React from 'react';

import { AclInfo } from '@/modules/stream-flow/shared/components';

interface AclTabProps {
  dataset_id: number;
}

export const AclTab = ({ dataset_id }: AclTabProps) => {
  return <AclInfo objectType="dataset" objectId={dataset_id} />;
};
