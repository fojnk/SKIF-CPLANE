import { Code, SquareArticle } from '@gravity-ui/icons';
import { Flex, Icon, SegmentedRadioGroup, Tooltip } from '@gravity-ui/uikit';
import React from 'react';

export type CodeToggleMode = 'code' | 'form';

interface CodeToggleProps {
  value: CodeToggleMode;
  onUpdate: (mode: CodeToggleMode) => void;
  disabled?: boolean;
  disabledReason?: 'invalidJson' | 'noForm' | 'loading';
  size?: 's' | 'm' | 'l';
}

export const CodeToggle = ({
  value,
  onUpdate,
  disabled = false,
  disabledReason,
  size = 'm',
}: CodeToggleProps) => {
  const content = (
    <SegmentedRadioGroup
      value={value}
      onUpdate={onUpdate}
      disabled={disabled}
      size={size}
    >
      <SegmentedRadioGroup.Option
        value="form"
        content={
          <Flex gap={1} alignItems="center">
            <Icon data={SquareArticle} size={16} /> Form
          </Flex>
        }
      />
      <SegmentedRadioGroup.Option
        value="code"
        content={
          <Flex gap={1} alignItems="center">
            <Icon data={Code} size={16} /> Code
          </Flex>
        }
      />
    </SegmentedRadioGroup>
  );

  if (disabled && disabledReason === 'invalidJson') {
    return (
      <Tooltip content="Invalid JSON" placement="bottom" openDelay={0}>
        {content}
      </Tooltip>
    );
  }

  if (disabled && disabledReason === 'noForm') {
    return (
      <Tooltip content="Empty config params" placement="bottom" openDelay={0}>
        {content}
      </Tooltip>
    );
  }

  return content;
};
