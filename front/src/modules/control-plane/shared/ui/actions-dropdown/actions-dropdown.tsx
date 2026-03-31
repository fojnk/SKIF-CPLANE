import { Ellipsis } from '@gravity-ui/icons';
import {
  DropdownMenu,
  DropdownMenuItem,
  Icon,
  Skeleton,
} from '@gravity-ui/uikit';
import React from 'react';

import { Button } from '@/shared/ui/button';

interface Props {
  items: DropdownMenuItem[] | DropdownMenuItem[][];
  loading?: boolean;
}

export const ActionsDropdown = ({ items, loading }: Props) => {
  if (loading) {
    return <Skeleton style={{ width: '84px', height: '24px', opacity: 0.5 }} />;
  }

  // Если нет доступных действий, не отображаем кнопку
  if (items.length === 0) {
    return null;
  }

  return (
    <DropdownMenu
      size="l"
      renderSwitcher={(props) => (
        <Button
          {...props}
          view="action"
          size="s"
          style={{
            minWidth: '84px',
          }}
        >
          Actions
          <Icon size={16} data={Ellipsis} />
        </Button>
      )}
      items={items}
    ></DropdownMenu>
  );
};
