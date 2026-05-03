import { Label, Text, Tooltip } from '@gravity-ui/uikit';
import React from 'react';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
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
  let theme:
    | 'info'
    | 'utility'
    | 'warning'
    | 'danger'
    | 'success'
    | 'normal'
    | 'unknown';
  switch (status) {
    case controlPlaneApi.dc.JobdJobStatusDC.JobStatusCompleted:
      theme = 'success';
      break;
    case controlPlaneApi.dc.JobdJobStatusDC.JobStatusPaused:
      theme = 'warning';
      break;
    case controlPlaneApi.dc.JobdJobStatusDC.JobStatusQueued:
    case controlPlaneApi.dc.JobdJobStatusDC.JobStatusRunning:
      theme = 'info';
      break;
    case controlPlaneApi.dc.JobdJobStatusDC.JobStatusPending:
      theme = 'normal';
      break;
    case controlPlaneApi.dc.JobdJobStatusDC.JobStatusTimeout:
    case controlPlaneApi.dc.JobdJobStatusDC.JobStatusFailed:
    case controlPlaneApi.dc.JobdJobStatusDC.JobStatusCancelled:
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
