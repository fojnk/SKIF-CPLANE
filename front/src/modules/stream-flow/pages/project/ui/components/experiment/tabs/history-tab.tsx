import React from 'react';

import { LogsList } from '@/modules/stream-flow/shared/components';

interface Props {
  experiment_id: number;
  project_id: number;
}

export const HistoryTab = ({ experiment_id }: Props) => {
  return <LogsList id={experiment_id} type="experiment" />;
};
