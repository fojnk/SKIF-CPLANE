import { DropdownMenu } from '@gravity-ui/uikit';
import { useMemo } from 'react';

import { BaseLayoutHeaderAction } from './header';
import { headerActionToDropdownItem } from './header-action';

export const DropdownActions = ({
  actions,
}: {
  actions?: BaseLayoutHeaderAction[];
}) => {
  const items = useMemo(() => {
    if (actions && actions.length) {
      return actions.filter((action) => !action.hidden);
    }

    return null;
  }, [actions]);

  if (!items || !items.length) {
    return null;
  }

  return (
    <DropdownMenu
      items={items.map(headerActionToDropdownItem)}
      menuProps={{
        size: 'l',
      }}
    />
  );
};
