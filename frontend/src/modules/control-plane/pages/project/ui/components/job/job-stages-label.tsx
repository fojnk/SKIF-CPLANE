import {
  CircleCheck,
  CircleExclamation,
  CircleXmark,
  CircleQuestion,
  Clock,
} from '@gravity-ui/icons';
import { Icon, Tooltip } from '@gravity-ui/uikit';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';

interface JobsStageLabelProps {
  stage: controlPlaneApi.dc.JobdStageDC;
}

export const JobsStagesLabel = ({ stage }: JobsStageLabelProps) => {
  const content = `${stage.step_status} • ${stage.name} ${stage.description ? `• ${stage.description}` : ''}`;
  switch (stage.step_status) {
    case 'completed':
      return (
        <Tooltip
          content={content}
          placement="top"
          openDelay={200}
          key={stage.step_id}
        >
          <Icon
            data={CircleCheck}
            size={21}
            style={{ color: 'var(--g-color-base-positive-heavy)' }}
          />
        </Tooltip>
      );
    case 'running':
      return (
        <Tooltip
          content={content}
          placement="top"
          openDelay={100}
          key={stage.step_id}
        >
          <Icon
            data={Clock}
            size={21}
            style={{ color: 'var(--g-color-base-info-heavy-hover)' }}
          />
        </Tooltip>
      );
    case 'waiting':
    case 'queued':
      return (
        <Tooltip
          content={content}
          placement="top"
          openDelay={200}
          key={stage.step_id}
        >
          <Icon
            data={CircleExclamation}
            size={21}
            style={{ color: 'var(--g-color-base-info-heavy-hover)' }}
          />
        </Tooltip>
      );
    case 'failed':
    case 'cancelled':
      return (
        <Tooltip
          content={content}
          placement="top"
          openDelay={200}
          key={stage.step_id}
        >
          <Icon
            data={CircleXmark}
            size={21}
            style={{ color: 'var(--g-color-base-danger-heavy)' }}
          />
        </Tooltip>
      );
    case 'pending':
      return (
        <Tooltip
          content={content}
          placement="top"
          openDelay={200}
          key={stage.step_id}
        >
          <Icon
            data={CircleExclamation}
            size={21}
            style={{ color: 'var(--g-color-base-misc-heavy)' }}
          />
        </Tooltip>
      );
    default:
      return (
        <Tooltip
          content={content}
          placement="top"
          openDelay={200}
          key={stage.step_id}
        >
          <Icon
            data={CircleQuestion}
            size={21}
            style={{ color: 'var(--g-color-base-misc-heavy)' }}
          />
        </Tooltip>
      );
  }
};
