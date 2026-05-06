import { CircleInfoFill, Cube } from '@gravity-ui/icons';
import { Button, Dialog, Icon, Text } from '@gravity-ui/uikit';
import { Handle, Position } from '@xyflow/react';
import React, { useState } from 'react';

import type { PortInfo } from '@/modules/control-plane/entities/cubes';
import { ShowCubesMarketModel } from '@/modules/control-plane/features/cubes/market';

import { IconWithText } from '../ui';

import styles from './graph.module.scss';

interface CubeGroupNodeProps {
  data: {
    label: string;
    isExternal?: boolean;
    isDataset?: boolean;
    inputPorts?: PortInfo[];
    outputPorts?: PortInfo[];
    hasError?: boolean;
    errorCode?: string;
    selected?: boolean;
    cubeId?: number;
    baseCubeName?: string;
    modelDescription?: string;
  };
}

export const CubeGroupNode = ({ data }: CubeGroupNodeProps) => {
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const isExternal = data.isExternal || false;
  const isDataset = data.isDataset || false;
  const inputPorts = data.inputPorts || [];
  const outputPorts = data.outputPorts || [];
  const isSelected = data.selected || false;
  const cubeId = data.cubeId;
  const baseCubeName = data.baseCubeName;
  const modelDescription = data.modelDescription;

  const handleBaseCubeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cubeId != null && cubeId > 0) {
      ShowCubesMarketModel.start({
        cubeId,
      });
    }
  };

  const canOpenMarketplace = cubeId != null && cubeId > 0;

  return (
    <div
      className={`${isDataset ? styles.datasetGroup : styles.cubeGroup} ${
        isSelected
          ? isDataset
            ? styles.datasetGroupSelected
            : styles.cubeGroupSelected
          : ''
      }`}
    >
      {/* Заголовок куба — drag handle для перетаскивания */}
      <div className={styles.cubeGroupHeader}>
        {/* Иконка + название + ошибка в одну строку */}
        <div className={styles.cubeGroupTitleRow}>
          <div className={styles.cubeGroupTitle}>
            {!isExternal && (
              <Icon data={Cube} size={14} className={styles.cubeGroupIcon} />
            )}
            <Text variant="subheader-1" color="primary" ellipsis>
              {data.label}
            </Text>
          </div>
          {modelDescription ? (
            <Button
              view="flat"
              size="s"
              title="Описание из конфига"
              onClick={(e) => {
                e.stopPropagation();
                setDescriptionOpen(true);
              }}
            >
              <Icon data={CircleInfoFill} size={14} />
            </Button>
          ) : null}
          {/* Отображение ошибки прижато вправо */}
          {data.hasError && data.errorCode && (
            <IconWithText text={data.errorCode} type="danger" iconSize={14} />
          )}
        </div>
        {/* Информация о базовом кубе */}

        <div className={styles.cubeGroupBase}>
          {baseCubeName ? (
            canOpenMarketplace ? (
              <Text
                ellipsis
                onClick={handleBaseCubeClick}
                className={styles.cubeGroupBaseLink}
              >
                {baseCubeName}
              </Text>
            ) : (
              <Text ellipsis color="secondary" variant="body-1">
                {baseCubeName}
              </Text>
            )
          ) : (
            <Text ellipsis className={styles.cubeGroupBaseError}>
              Missing CubeTypeId
            </Text>
          )}
        </div>
      </div>
      {/* Контейнер для портов */}
      <div className={styles.cubeGroupContent}>
        {/* Input порты */}
        {inputPorts.map((port) => {
          const hasName = port.name && port.name.trim() !== '';
          return (
            <div
              key={`input-${port.hash}`}
              className={`${styles.port} ${styles.portInput}`}
            >
              <Handle type="target" position={Position.Left} id={port.hash} />
              {hasName ? (
                <Text
                  variant="body-1"
                  color="primary"
                  ellipsis
                  className={styles.portLabel}
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
            </div>
          );
        })}
        {/* Output порты — прижаты вправо */}
        {outputPorts.map((port) => {
          const hasName = port.name && port.name.trim() !== '';
          return (
            <div
              key={`output-${port.hash}`}
              className={`${styles.port} ${styles.portOutput}`}
            >
              {hasName ? (
                <Text
                  variant="body-1"
                  color="primary"
                  ellipsis
                  className={styles.portLabel}
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
      <Dialog
        open={descriptionOpen}
        onClose={() => setDescriptionOpen(false)}
        size="m"
        className="sf-dialog"
      >
        <Dialog.Header caption="Описание модели" />
        <Dialog.Body>
          <Text
            variant="body-1"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          >
            {modelDescription}
          </Text>
        </Dialog.Body>
      </Dialog>
    </div>
  );
};
