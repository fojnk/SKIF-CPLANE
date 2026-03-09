import { Label, Text, Tooltip } from '@gravity-ui/uikit';
import React from 'react';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { JobsDCStatus } from '@/modules/stream-flow/shared/types';

interface JobsStatusLabelProps {
  status?: JobsDCStatus;
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
    case streamFlowApi.dc.JobdJobStatusDC.JobStatusCompleted:
      theme = 'success';
      break;
    case streamFlowApi.dc.JobdJobStatusDC.JobStatusPaused:
      theme = 'warning';
      break;
    case streamFlowApi.dc.JobdJobStatusDC.JobStatusQueued:
    case streamFlowApi.dc.JobdJobStatusDC.JobStatusRunning:
      theme = 'info';
      break;
    case streamFlowApi.dc.JobdJobStatusDC.JobStatusPending:
      theme = 'normal';
      break;
    case streamFlowApi.dc.JobdJobStatusDC.JobStatusTimeout:
    case streamFlowApi.dc.JobdJobStatusDC.JobStatusFailed:
    case streamFlowApi.dc.JobdJobStatusDC.JobStatusCancelled:
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
