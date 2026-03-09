import { Flex, Tooltip } from '@gravity-ui/uikit';
import React from 'react';

import {
  getNodeStatus,
  getPipeStatusBg,
} from '@/modules/stream-flow/shared/utils/getStatusColor';

interface Props {
  status?: string;
  title?: string;
  variant?: 'dot' | 'pill';
}

export const ExperimentStatus = ({ status, title, variant = 'dot' }: Props) => {
  const bgClass = getPipeStatusBg(status ?? 'unknown');
  const circle = (
    <div
      className={bgClass}
      style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
      }}
    />
  );

  if (variant === 'pill') {
    const colorKey = getNodeStatus((status ?? 'UNKNOWN') as string);
    return (
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="center"
        style={{
          padding: '3px 8px',
          height: '24px',
          borderRadius: '4px',
          color: `rgba(var(--${colorKey}-500), 1)`,
          backgroundColor: `rgba(var(--${colorKey}-500), .1)`,
          border: `1px solid rgba(var(--${colorKey}-500), 1)`,
          fontSize: 12,
          lineHeight: '16px',
          textTransform: 'uppercase',
          letterSpacing: 0.3,
        }}
      >
        {status}
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap={2} shrink={0} style={{ width: 8 }}>
      {title ? (
        <Tooltip
          content={title}
          openDelay={0}
          closeDelay={200}
          placement="right"
        >
          {circle}
        </Tooltip>
      ) : (
        circle
      )}
    </Flex>
  );
};
