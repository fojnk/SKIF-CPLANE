import {
  CircleCheck,
  CircleExclamation,
  CircleXmark,
  CircleQuestion,
  Clock,
} from '@gravity-ui/icons';
import { Flex, Icon, Popover, Text } from '@gravity-ui/uikit';
import React from 'react';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';

interface JobsStageLabelProps {
  stage: controlPlaneApi.dc.ClientsJobStageDC;
}

const stagePopoverContent = (stage: controlPlaneApi.dc.ClientsJobStageDC) => (
  <Flex direction="column" gap={2} style={{ maxWidth: 380, padding: 4 }}>
    <Text variant="subheader-2">
      {stage.name?.trim() || `Этап ${stage.step_id ?? '—'}`}
    </Text>
    <Text variant="body-2" color="secondary">
      Статус: {stage.step_status?.trim() || '—'}
    </Text>
    <Text variant="body-2" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {stage.description?.trim()
        ? stage.description
        : 'Описание отсутствует'}
    </Text>
  </Flex>
);

const wrapWithStagePopover = (stage: controlPlaneApi.dc.ClientsJobStageDC, icon: React.ReactNode) => (
  <Popover
    content={stagePopoverContent(stage)}
    placement="top"
    trigger="click"
    hasArrow
  >
    <span
      role="button"
      tabIndex={0}
      style={{ display: 'inline-flex', cursor: 'pointer' }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (e.currentTarget as HTMLElement).click();
        }
      }}
    >
      {icon}
    </span>
  </Popover>
);

export const JobsStagesLabel = ({ stage }: JobsStageLabelProps) => {
  const stepStatus = (stage.step_status || '').toLowerCase();
  switch (stepStatus) {
    case 'completed':
      return wrapWithStagePopover(
        stage,
        <Icon
          data={CircleCheck}
          size={21}
          style={{ color: 'var(--g-color-base-positive-heavy)' }}
        />,
      );
    case 'running':
      return wrapWithStagePopover(
        stage,
        <Icon
          data={Clock}
          size={21}
          style={{ color: 'var(--g-color-base-info-heavy-hover)' }}
        />,
      );
    case 'waiting':
    case 'queued':
      return wrapWithStagePopover(
        stage,
        <Icon
          data={CircleExclamation}
          size={21}
          style={{ color: 'var(--g-color-base-info-heavy-hover)' }}
        />,
      );
    case 'failed':
    case 'cancelled':
    case 'canceled':
      return wrapWithStagePopover(
        stage,
        <Icon
          data={CircleXmark}
          size={21}
          style={{ color: 'var(--g-color-base-danger-heavy)' }}
        />,
      );
    case 'pending':
      return wrapWithStagePopover(
        stage,
        <Icon
          data={CircleExclamation}
          size={21}
          style={{ color: 'var(--g-color-base-misc-heavy)' }}
        />,
      );
    default:
      return wrapWithStagePopover(
        stage,
        <Icon
          data={CircleQuestion}
          size={21}
          style={{ color: 'var(--g-color-base-misc-heavy)' }}
        />,
      );
  }
};
