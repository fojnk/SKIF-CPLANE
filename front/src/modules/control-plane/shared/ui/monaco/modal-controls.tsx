import { Flex } from '@gravity-ui/uikit';
import React from 'react';

import { CollapseUnchanged } from './collapse-unchanged';
import { FontSizeSelector } from './font-size-selector';
import { SideBySide } from './side-by-side';

interface Props {
  showSideBySide?: boolean;
  showCollapseUnchanged?: boolean;
  showFontSize?: boolean;
}

export const ModalControls = ({
  showSideBySide = true,
  showCollapseUnchanged = true,
  showFontSize = true,
}: Props) => {
  return (
    <Flex alignItems="center" gap={3} style={{ flexShrink: 0 }}>
      {showFontSize && <FontSizeSelector />}
      {showSideBySide && <SideBySide />}
      {showCollapseUnchanged && <CollapseUnchanged />}
    </Flex>
  );
};
