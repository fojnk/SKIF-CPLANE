import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import { CopyLink } from '../copy-link';

interface Props {
  title: string;
}

export const CopyLinkTitle = ({ title }: Props) => {
  return (
    <Flex direction="row" gap={2} alignItems="center">
      <Text variant="header-1" ellipsis>
        {title}
      </Text>

      <CopyLink />
    </Flex>
  );
};
