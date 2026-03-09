import { Link, Text } from '@gravity-ui/uikit';
import React from 'react';

interface Props {
  user?: string | null;
  size?: 'body-1' | 'body-2';
}

export const VkUser = ({ user, size = 'body-1' }: Props) => {
  if (!user) {
    return null;
  }

  if (user === 'unknown') {
    return <Text color="secondary">unknown</Text>;
  }

  return (
    <Text
      ellipsisLines={1}
      ellipsis
      wordBreak="break-all"
      style={{ width: 'fit-content' }}
      variant={size}
    >
      <Link
        href={`https://home.vk.team/users/${user}/`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {user}
      </Link>
    </Text>
  );
};
