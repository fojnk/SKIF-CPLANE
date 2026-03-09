import { Text } from '@gravity-ui/uikit';
import { Handle, Position } from '@xyflow/react';
import React from 'react';

import type { PortInfo } from '@/modules/control-plane/entities/cubes';

import { IconWithText } from '../ui';

import styles from './graph.module.scss';

interface ResharderNodeProps {
  data: {
    label: string;
    outputPorts?: PortInfo[];
  };
}

export const ResharderNode = ({ data }: ResharderNodeProps) => {
  const outputPorts = data.outputPorts || [];

  return (
    <div className={styles.resharderGroup}>
      {/* Заголовок Resharder — drag handle для перетаскивания */}
      <div className={styles.resharderGroupHeader}>
        <Text
          variant="subheader-1"
          color="primary"
          ellipsis
          className={styles.resharderGroupLabel}
        >
          {data.label}
        </Text>
      </div>
      {/* Контейнер для портов */}
      <div className={styles.resharderGroupContent}>
        {/* Output порты — прижаты вправо */}
        {outputPorts.map((port) => {
          const hasName = port.name && port.name.trim() !== '';
          return (
            <div key={`output-${port.hash}`} className={styles.resharderPort}>
              {hasName ? (
                <Text
                  variant="body-1"
                  color="primary"
                  ellipsis
                  className={styles.resharderPortLabel}
                >
                  {port.name}
                </Text>
              ) : (
                <IconWithText
                  text="empty name"
                  type="warning"
                  iconSize={12}
                  textVariant="body-1"
                />
              )}
              <Handle type="source" position={Position.Right} id={port.hash} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
