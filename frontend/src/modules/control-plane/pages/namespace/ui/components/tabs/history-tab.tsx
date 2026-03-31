import React from 'react';

import { LogsList } from '@/modules/control-plane/shared/components';

interface Props {
  namespace_id: number;
}

export const HistoryTab = ({ namespace_id }: Props) => {
  return <LogsList id={namespace_id} type="namespace" />;
};
