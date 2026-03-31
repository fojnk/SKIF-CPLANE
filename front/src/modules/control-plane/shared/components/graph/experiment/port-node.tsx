import { Text } from '@gravity-ui/uikit';
import { Handle, Position } from '@xyflow/react';
import React from 'react';

import styles from './graph.module.scss';

interface PortNodeProps {
  data: {
    label: string;
    portType: 'input' | 'output';
    cubeId: string;
  };
}

export const PortNode = ({ data }: PortNodeProps) => {
  const isInput = data.portType === 'input';

  return (
    <div
      className={`${styles.port} ${isInput ? styles.portInput : styles.portOutput}`}
    >
      {isInput && (
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          className={`${styles.handle} ${styles.handleLeft}`}
        />
      )}
      <Text
        variant="body-1"
        color="primary"
        ellipsis
        className={styles.portLabel}
      >
        {data.label}
      </Text>
      {!isInput && (
        <Handle
          type="source"
          position={Position.Right}
          id="source"
          className={`${styles.handle} ${styles.handleRight}`}
        />
      )}
    </div>
  );
};
