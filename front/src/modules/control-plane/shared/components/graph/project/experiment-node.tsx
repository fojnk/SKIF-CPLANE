import { Pipeline } from '@gravity-ui/icons';
import { Icon, Text } from '@gravity-ui/uikit';
import { Handle, Position } from '@xyflow/react';
import React from 'react';

import type {
  ExperimentNodeData,
  ExperimentStatus,
} from '@/modules/control-plane/entities/projects/graph';

import styles from './graph.module.scss';

interface ExperimentNodeProps {
  data: ExperimentNodeData;
}

// Маппинг статуса на CSS класс
const STATUS_CLASS_MAP: Record<ExperimentStatus, string> = {
  UNKNOWN: styles.experimentNodeUnknown,
  OK: styles.experimentNodeOk,
  WARNING: styles.experimentNodeWarning,
  ERROR: styles.experimentNodeError,
  PENDING: styles.experimentNodePending,
};

export const ExperimentNode = ({ data }: ExperimentNodeProps) => {
  const isSelected = data.selected || false;
  const status = (data.status as ExperimentStatus) || 'UNKNOWN';
  const statusClass = STATUS_CLASS_MAP[status] || STATUS_CLASS_MAP.UNKNOWN;

  return (
    <div
      className={`${styles.experimentNode} ${statusClass} ${isSelected ? styles.experimentNodeSelected : ''}`}
    >
      {/* Handle для входящих соединений */}
      <Handle type="target" position={Position.Left} id="target" />

      {/* Иконка experiment */}
      <Icon data={Pipeline} size={12} className={styles.experimentNodeIcon} />

      {/* Название experiment */}
      <Text
        variant="subheader-1"
        color="primary"
        ellipsis
        className={styles.experimentNodeLabel}
      >
        {data.label}
      </Text>

      {/* Handle для исходящих соединений */}
      <Handle type="source" position={Position.Right} id="source" />
    </div>
  );
};
