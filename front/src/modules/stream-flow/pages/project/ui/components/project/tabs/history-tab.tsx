import React from 'react';

import { LogsList } from '@/modules/stream-flow/shared/components';

interface Props {
  project_id: number;
}

export const HistoryTab = ({ project_id }: Props) => {
  return <LogsList id={project_id} type="project" />;
};
