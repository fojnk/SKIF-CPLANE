import { Plus } from '@gravity-ui/icons';
import { Text, Flex } from '@gravity-ui/uikit';
import React from 'react';

import { Button } from '@/shared/ui/button';

interface Props {
  create?: () => void;
  message?: string;
}

export const CreateMessage = ({
  create,
  message = 'Нет данных',
}: Props) => {
  return (
    <Flex direction="row" gap={2} alignItems="center">
      <Text variant="body-1" color="primary">
        {message}
      </Text>
      {create && (
        <Button view="glass" size="m" onClick={create}>
          <Button.Icon>
            <Plus />
          </Button.Icon>
          Создать
        </Button>
      )}
    </Flex>
  );
};
