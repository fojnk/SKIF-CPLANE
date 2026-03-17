import { Database } from '@gravity-ui/icons';
import { Icon, Text } from '@gravity-ui/uikit';
import { Handle, Position } from '@xyflow/react';
import React from 'react';

import type { DatasetNodeData } from '@/modules/control-plane/entities/projects/graph';

import styles from './graph.module.scss';

interface DatasetNodeProps {
  data: DatasetNodeData;
}

export const DatasetNode = ({ data }: DatasetNodeProps) => {
  const isSelected = data.selected || false;

  return (
    <div
      className={`${styles.datasetNode} ${isSelected ? styles.datasetNodeSelected : ''}`}
    >
      {/* Handle для входящих соединений */}
      <Handle type="target" position={Position.Left} id="target" />

      {/* Иконка dataset */}
      <Icon data={Database} size={16} className={styles.datasetNodeIcon} />

      {/* Название dataset */}
      <Text
        variant="subheader-1"
        color="primary"
        ellipsis
        className={styles.datasetNodeLabel}
      >
        {data.label}
      </Text>

      {/* Handle для исходящих соединений */}
      <Handle type="source" position={Position.Right} id="source" />
    </div>
  );
};
