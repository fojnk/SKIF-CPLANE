import { TabList, TabProvider, Text } from '@gravity-ui/uikit';
import cx from 'clsx';
import { ReactNode } from 'react';

import { tabsConfig } from '@/modules/stream-flow/features/navigation/model/navigation';
import { TabWithTooltip } from '@/routing/ui/layouts/base/components';
import { createValueModel } from '@/shared/lib/effector/value-model';

import type { BaseLayoutHeaderAction } from './header-action';
import { HeaderActions, headerActionsElement } from './header-actions';

import './header.scss';

export type { BaseLayoutHeaderAction } from './header-action';

export interface BaseLayoutHeaderProps {
  children?: ReactNode;
  topAligned?: boolean;
  className?: string;
  actions?: BaseLayoutHeaderAction[];
  root?: boolean;
}

export const headerElement = createValueModel<HTMLDivElement | null>(null);

export const Header = ({
  children,
  topAligned,
  className,
  actions = [],
  root = true,
}: BaseLayoutHeaderProps) => {
  const filteredTabs = tabsConfig.filter((tab) => !tab.hidden);
  const activeTab = filteredTabs.find((item) => item.isOpened?.getState());

  return (
    <div
      id="base-layout-header"
      className={cx(
        'page-header',
        {
          ['top-aligned']: topAligned,
        },
        className,
      )}
    >
      <div className="page-header__top">
        <div
          className="page-header__content"
          ref={root ? headerElement.set : undefined}
        >
          {children}
        </div>
        <HeaderActions
          selfContainer
          containerRef={root ? headerActionsElement.set : undefined}
          actions={actions}
        />
      </div>
      {activeTab && (
        <TabProvider value={activeTab?.path}>
          <div className="page-header__bottom">
            <Text variant="header-2" className="page-header__title">
              Control Plane
            </Text>
            <TabList className="no-border-tablist page-header__list" size="l">
              {filteredTabs.map((tabsItem) => {
                return (
                  <TabWithTooltip
                    id={tabsItem.id}
                    key={tabsItem.id}
                    path={tabsItem.path}
                    title={tabsItem.title}
                    disabled={tabsItem.disabled}
                    onClick={tabsItem.onItemClick}
                  />
                );
              })}
            </TabList>
          </div>
        </TabProvider>
      )}
    </div>
  );
};
