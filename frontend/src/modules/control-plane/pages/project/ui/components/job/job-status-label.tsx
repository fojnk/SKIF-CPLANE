import { Label, Text, Tooltip } from '@gravity-ui/uikit';
import React from 'react';

import { JobsDCStatus } from '@/modules/control-plane/shared/types';

interface JobsStatusLabelProps {
  status?: JobsDCStatus | string;
  description?: string;
  size?: 'xs' | 's' | 'm';
}

interface StatusContentProps {
  text?: string;
}

const StatusContent = ({ text }: StatusContentProps) => {
  return <Text variant="body-1">{text}</Text>;
};

export const JobsStatusLabel = ({
  status,
  description,
  size = 'xs',
}: JobsStatusLabelProps) => {
  const normalizedStatus = String(status || '')
    .trim()
    .toLowerCase();

  let theme:
    | 'info'
    | 'utility'
    | 'warning'
    | 'danger'
    | 'success'
    | 'normal'
    | 'unknown';
  switch (normalizedStatus) {
    case 'completed':
      theme = 'success';
      break;
    case 'paused':
      theme = 'warning';
      break;
    case 'queued':
    case 'running':
      theme = 'info';
      break;
    case 'pending':
      theme = 'normal';
      break;
    case 'timeout':
    case 'failed':
    case 'cancelled':
      theme = 'danger';
      break;
    default:
      theme = 'unknown';
  }
  return (
    <Tooltip
      placement="top"
      openDelay={100}
      content={<StatusContent text={description} />}
    >
      <Label theme={theme} size={size}>
        {status}
      </Label>
    </Tooltip>
  );
};
