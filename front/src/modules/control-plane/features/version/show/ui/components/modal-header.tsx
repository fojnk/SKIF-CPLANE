import { CircleInfoFill, Pipeline } from '@gravity-ui/icons';
import {
  Flex,
  Icon,
  Label,
  Text,
  Tooltip,
  ClipboardButton,
} from '@gravity-ui/uikit';
import React from 'react';

import { ShowVersionMode } from '@/modules/control-plane/features/version/show/types';

import { ExperimentVersionHeaderActions } from './header-actions';

interface Props {
  experimentName: string;
  version: number;
  mode: ShowVersionMode;
  head: boolean;
  versionValue: string;
  setMode: (mode: ShowVersionMode) => void;
  comment?: string;
}

export const ExperimentVersionModalHeader = ({
  experimentName,
  version,
  mode,
  head,
  versionValue,
  setMode,
  comment,
}: Props) => {
  return (
    <Flex
      direction="row"
      alignItems="center"
      gap={2}
      justifyContent="space-between"
      style={{ width: '100%' }}
    >
      <Flex
        direction="row"
        alignItems="center"
        gap={2}
        style={{ flexGrow: 1, minWidth: 0 }}
      >
        <Icon
          data={Pipeline}
          className="no-shrink"
          size={16}
          style={{
            color: 'var(--g-color-text-secondary)',
          }}
        />
        <Text
          variant="subheader-3"
          ellipsis
          style={{ flexShrink: 1, minWidth: 0 }}
        >
          {experimentName}
        </Text>
      </Flex>
      <Flex direction="row" alignItems="center" gap={2}>
        {!head && (
          <ExperimentVersionHeaderActions setMode={setMode} mode={mode} />
        )}
        <Flex
          direction="row"
          alignItems="center"
          gap={2}
          style={{
            marginLeft: '10px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            paddingRight: '10px',
          }}
        >
          {comment && comment !== '' && (
            <Tooltip content={comment} openDelay={0} closeDelay={200}>
              <Icon
                data={CircleInfoFill}
                size={16}
                style={{ color: 'var(--g-color-text-secondary)' }}
              />
            </Tooltip>
          )}
          <Text variant="subheader-2">Version: {version}</Text>
          <ClipboardButton
            text={versionValue}
            size="xs"
            view="flat-secondary"
            tooltipInitialText="Copy version"
          />
          {head && (
            <Label theme="success" size="xs">
              Head
            </Label>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
