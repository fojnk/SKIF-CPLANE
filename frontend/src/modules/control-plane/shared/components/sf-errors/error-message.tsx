import { ArrowRotateRight } from '@gravity-ui/icons';
import { Text, Flex } from '@gravity-ui/uikit';
import React from 'react';

import { Button } from '@/shared/ui/button';

interface Props {
  reload?: () => void;
  pending?: boolean;
  message?: string;
  danger?: boolean;
  padding?: boolean;
}

export const ErrorMessage = ({
  reload,
  pending,
  message = 'Не удалось загрузить данные',
  danger = true,
  padding = false,
}: Props) => {
  return (
    <Flex
      direction="row"
      gap={2}
      alignItems="center"
      style={{ padding: padding ? '20px' : 0 }}
    >
      <Text variant="body-1" color={danger ? 'danger' : 'primary'}>
        {message}
      </Text>
      {reload && (
        <Button view="flat-action" size="s" onClick={reload} loading={pending}>
          <Button.Icon>
            <ArrowRotateRight />
          </Button.Icon>
          Обновить
        </Button>
      )}
    </Flex>
  );
};
