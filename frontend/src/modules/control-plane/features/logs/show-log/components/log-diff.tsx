import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import { JsonDiffViewer } from '@/modules/control-plane/shared/components';
import { ModalControls } from '@/modules/control-plane/shared/ui';

interface Props {
  name: string;
  oldValue: string;
  newValue: string;
}

export const LogDiff: React.FC<Props> = ({ name, oldValue, newValue }) => {
  return (
    <div style={{ height: '100%' }}>
      <Flex
        direction="row"
        style={{ width: '100%', paddingBottom: '12px' }}
        justifyContent="space-between"
        alignItems="center"
      >
        <Text variant="body-1">
          <b>{name}</b>
        </Text>
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
