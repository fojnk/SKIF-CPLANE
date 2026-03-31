import { Text } from '@gravity-ui/uikit';
import { Handle, Position } from '@xyflow/react';
import React from 'react';

import type { PortInfo } from '@/modules/control-plane/entities/cubes';

import { IconWithText } from '../ui';

import styles from './graph.module.scss';

interface RetrierNodeProps {
  data: {
    label: string;
    outputPorts?: PortInfo[];
  };
}

export const RetrierNode = ({ data }: RetrierNodeProps) => {
  const outputPorts = data.outputPorts || [];

  return (
    <div className={styles.retrierGroup}>
      {/* Заголовок Retrier — drag handle для перетаскивания */}
      <div className={styles.retrierGroupHeader}>
        <Text
          variant="subheader-1"
          color="primary"
          ellipsis
          className={styles.retrierGroupLabel}
        >
          {data.label}
        </Text>
      </div>
      {/* Контейнер для портов */}
      <div className={styles.retrierGroupContent}>
        {/* Output порты — прижаты вправо */}
        {outputPorts.map((port) => {
          const hasName = port.name && port.name.trim() !== '';
          return (
            <div key={`output-${port.hash}`} className={styles.retrierPort}>
              {hasName ? (
                <Text
                  variant="body-1"
                  color="primary"
                  ellipsis
                  className={styles.retrierPortLabel}
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
