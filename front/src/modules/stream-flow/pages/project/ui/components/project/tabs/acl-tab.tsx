import React from 'react';

import { AclInfo } from '@/modules/stream-flow/shared/components';

interface AclTabProps {
  project_id: number;
}

export const AclTab = ({ project_id }: AclTabProps) => {
  return <AclInfo objectType="project" objectId={project_id} />;
};
