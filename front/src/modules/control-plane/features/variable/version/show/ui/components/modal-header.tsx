import { CircleInfoFill } from '@gravity-ui/icons';
import {
  Flex,
  Icon,
  Label,
  Text,
  Tooltip,
  ClipboardButton,
} from '@gravity-ui/uikit';
import React from 'react';

import {
  VariableType,
  VariableVersionMode,
} from '@/modules/control-plane/features/variable/version/show/types';
import {
  getTypeTheme,
  getTypeLabel,
} from '@/modules/control-plane/shared/utils/variablesHelpers';

import { VariableVersionHeaderActions } from './header-actions';

interface Props {
  variableName: string;
  variableType: VariableType;
  mode: VariableVersionMode;
  head: boolean;
  canEdit: boolean;
  hasChanges: boolean;
  versionIdName?: number | null;
  versionValue: string;
  setMode: (mode: VariableVersionMode) => void;
  comment?: string;
}

export const VariableVersionModalHeader = ({
  variableName,
  variableType,
  mode,
  head,
  canEdit,
  hasChanges,
  versionIdName,
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
        <Label size="xs" theme={getTypeTheme(variableType)}>
          {getTypeLabel(variableType)}
        </Label>
        <Text
          variant="subheader-3"
          ellipsis
          style={{ flexShrink: 1, minWidth: 0 }}
        >
          {variableName}
        </Text>
        <ClipboardButton
          text={`\${${variableName}}`}
          size="s"
          view="flat-secondary"
          tooltipInitialText="Copy name"
        />
        {mode === 'edit' && (
          <Label size="xs" theme="clear">
            Editing
          </Label>
        )}
        {hasChanges && (
          <Label size="xs" theme="warning">
            Unsaved changes
          </Label>
        )}
      </Flex>
      <Flex direction="row" alignItems="center" gap={2}>
        <VariableVersionHeaderActions
          setMode={setMode}
          head={head}
          canEdit={canEdit}
          mode={mode}
        />
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
          <Text variant="subheader-2">Version: {versionIdName}</Text>
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
