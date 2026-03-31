import { ChevronLeft } from '@gravity-ui/icons';
import { Button, Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { projectPageModel } from '@/modules/control-plane/pages/project';

export const BackArrow = () => {
  const setSelected = useUnit(projectPageModel.selected.setSelected);

  const handleBackClick = () => {
    setSelected(null);
  };

  return (
    <Flex style={{ marginLeft: '-6px' }}>
      <Button
        view="flat-secondary"
        size="xs"
        onClick={handleBackClick}
        className="no-pseudo"
      >
        <Button.Icon>
          <ChevronLeft />
        </Button.Icon>
      </Button>
    </Flex>
  );
};
