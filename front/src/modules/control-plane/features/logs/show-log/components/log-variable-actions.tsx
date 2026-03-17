import React from 'react';

import { LogVariableDelete } from '@/modules/control-plane/features/logs/show-log/components/log-variable-delete';
import { LogVariableDiff } from '@/modules/control-plane/features/logs/show-log/components/log-variable-diff';
import { LogVariableNew } from '@/modules/control-plane/features/logs/show-log/components/log-variable-new';
import { LogAction } from '@/modules/control-plane/shared/types';

interface Props {
  action: string;
  name: string;
  type: string;
  value: string;
  oldValue: string;
  oldName: string;
  oldType: string;
}

export const LogVariableActions: React.FC<Props> = ({
  action,
  name,
  type,
  value,
  oldValue,
  oldName,
  oldType,
}) => {
  if (action === LogAction.UpdateVariable) {
    return (
      <LogVariableDiff
        name={name || 'no name'}
        type={type || 'string'}
        oldValue={oldValue || ''}
        newValue={value || ''}
      />
    );
  }
  if (action === LogAction.NewVariable) {
    return (
      <LogVariableNew name={name || 'no name'} type={type} value={value} />
    );
  }
  return (
    <LogVariableDelete
      name={oldName || 'no name'}
      type={oldType}
      value={oldValue}
    />
  );
};
