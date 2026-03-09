import React from 'react';

import { LogsList } from '@/modules/control-plane/shared/components';

interface Props {
  dataset_id: number;
}

export const HistoryTab = ({ dataset_id }: Props) => {
  return <LogsList id={dataset_id} type="dataset" />;
};
