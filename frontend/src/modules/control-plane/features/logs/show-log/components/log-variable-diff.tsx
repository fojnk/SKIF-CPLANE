import { Flex, Label, Text } from '@gravity-ui/uikit';
import React from 'react';

import { JsonDiffViewer } from '@/modules/control-plane/shared/components';
import { ModalControls } from '@/modules/control-plane/shared/ui';
import {
  getTypeLabel,
  getTypeTheme,
} from '@/modules/control-plane/shared/utils/variablesHelpers';

interface Props {
  name: string;
  type: string;
  oldValue: string;
  newValue: string;
}

export const LogVariableDiff: React.FC<Props> = ({
  name,
  type,
  oldValue,
  newValue,
}) => {
  return (
    <div style={{ height: '100%' }}>
      <Flex
        direction="row"
        style={{ width: '100%', paddingBottom: '9px' }}
        justifyContent="space-between"
        alignItems="center"
      >
        <Flex direction="row" gap={2}>
          <Text variant="body-2">
            <b>{name}</b>
          </Text>
          {type && (
            <Label size="xs" theme={getTypeTheme(type)}>
              {getTypeLabel(type)}
            </Label>
          )}
        </Flex>
        <ModalControls showSideBySide showCollapseUnchanged />
      </Flex>
      <div style={{ flex: 1, height: 'calc(100% - 36px)' }}>
        <JsonDiffViewer
          key="diff-viewer"
          originalJson={oldValue}
          modifiedJson={newValue}
        />
      </div>
    </div>
  );
};
