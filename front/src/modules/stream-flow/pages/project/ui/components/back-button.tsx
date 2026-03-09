import { ChevronLeft } from '@gravity-ui/icons';
import { Button, Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { projectPageModel } from '@/modules/stream-flow/pages/project';

export const BackButton = () => {
  const setSelected = useUnit(projectPageModel.selected.setSelected);

  const handleBackClick = () => {
    setSelected(null);
  };

  return (
    <Flex
      style={{ marginTop: '-12px', marginBottom: '4px', marginLeft: '-4px' }}
    >
      <Button
        view="flat-secondary"
        size="xs"
        onClick={handleBackClick}
        style={{ width: 'fit-content', opacity: 0.5 }}
        className="no-pseudo"
      >
        <Button.Icon>
          <ChevronLeft />
        </Button.Icon>
        back to project
      </Button>
    </Flex>
  );
};
