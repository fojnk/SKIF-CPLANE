import cx from 'clsx';
import { useUnit } from 'effector-react';
import { LegacyRef, ReactNode } from 'react';

import { createValueModel } from '@/shared/lib/effector/value-model';
import { Portal } from '@/shared/ui/portal';

import { DropdownActions } from './dropdown-actions';
import { BaseLayoutHeaderAction } from './header';
import { HeaderAction } from './header-action';

import './header.scss';

export interface HeaderActionsProps {
  beforeActions?: ReactNode;
  afterActions?: ReactNode;
  actions?: BaseLayoutHeaderAction[];
  dropdownActions?: BaseLayoutHeaderAction[];
  className?: string;
  selfContainer?: boolean;
  containerRef?: LegacyRef<HTMLDivElement>;
}

export const headerActionsElement = createValueModel<HTMLDivElement | null>(
  null,
);

const HeaderActionsBase = ({
  actions,
  beforeActions,
  afterActions,
  dropdownActions,
  className,
  containerRef,
}: HeaderActionsProps) => {
  const actionNodes = actions?.map((action, i) => {
    return <HeaderAction {...action} key={i} />;
  });

  return (
    <div className={cx('page-header__actions', className)} ref={containerRef}>
      {beforeActions}
      {actionNodes}
      {afterActions}
      <DropdownActions actions={dropdownActions} />
    </div>
  );
};

const HeaderActionsPortal = ({
  actions,
  beforeActions,
  afterActions,
  dropdownActions,
}: HeaderActionsProps) => {
  const element = useUnit(headerActionsElement.$value);

  const actionNodes = actions?.map((action, i) => {
    return <HeaderAction {...action} key={i} />;
  });

  return (
    <Portal element={element}>
      {beforeActions}
      {actionNodes}
      {afterActions}
      <DropdownActions actions={dropdownActions} />
    </Portal>
  );
};

export const HeaderActions = (props: HeaderActionsProps) => {
  return props.selfContainer ? (
    <HeaderActionsBase {...props} />
  ) : (
    <HeaderActionsPortal {...props} />
  );
};
