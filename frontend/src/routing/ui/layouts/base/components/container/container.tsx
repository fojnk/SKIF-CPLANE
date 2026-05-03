import {
  AsideFallback,
  LogoProps,
  MenuItem,
  PageLayout,
} from '@gravity-ui/navigation';
import { Icon } from '@gravity-ui/uikit';
import cx from 'clsx';
import { useUnit } from 'effector-react';
import { ReactNode, useEffect } from 'react';
import { renderToString } from 'react-dom/server';

import { userModel } from '@/modules/control-plane/entities/session/user';
import { appStartModel } from '@/shared/lib/complex/app-starter';
import { embeddedModel } from '@/shared/lib/complex/embedded';
import { useStorageSyncState } from '@/shared/lib/react/hooks/use-storage-sync-state';
import { loadable } from '@/shared/lib/react/loadable';
import { GlobalLoader } from '@/shared/ui/loaders';

import './container.scss';

import { AsideMenuItem, AsideSubheaderMenuItem } from './types';

export interface BaseTemplateProps {
  children?: ReactNode;
  className?: string;
  settingsPanel?: ReactNode;
  menuItems?: AsideMenuItem[];
  subheaderMenuItems?: AsideSubheaderMenuItem[];
  extraFooterItems?: MenuItem[];
  defaultCompactNavbar?: boolean;
  customLogo?: LogoProps;
  /** Не показывать логотип в верхней части боковой панели */
  omitAsideLogo?: boolean;
}

const Aside = loadable(
  async () => (await import('./aside')).Aside,
  AsideFallback,
);

export const Container = ({
  children,
  className,
  settingsPanel,
  menuItems,
  subheaderMenuItems,
  extraFooterItems,
  defaultCompactNavbar = true,
  customLogo,
  omitAsideLogo,
}: BaseTemplateProps) => {
  const [compact, setCompact] = useStorageSyncState(defaultCompactNavbar, {
    key: 'navbar-compact-view',
    type: 'session',
  });
  const [appStarted, user, isEmbedded, onSideMenuItemsChange] = useUnit([
    appStartModel.$appStarted,
    userModel.$user,
    embeddedModel.$isEmbedded,
    embeddedModel.onSideMenuItemsChange,
  ]);

  useEffect(() => {
    if (!isEmbedded) {
      return;
    }
    onSideMenuItemsChange(
      menuItems?.map((val) => {
        return {
          id: val.id,
          title: renderToString(val.title),
          icon: val.icon ? renderToString(<Icon data={val.icon} />) : '',
          href: val.link ?? '',
          current: Boolean(val.current),
          onClick: val.onItemClick as undefined | (() => void),
        };
      }) ?? [],
    );
  }, [onSideMenuItemsChange, menuItems, isEmbedded]);

  return (
    <PageLayout
      compact={compact}
      className={cx('page-container', className, {
        'page-container-embedded': isEmbedded,
      })}
    >
      {!isEmbedded && user && (
        <Aside
          onChangeCompact={setCompact}
          settingsPanel={settingsPanel}
          menuItems={menuItems}
          subheaderMenuItems={subheaderMenuItems}
          extraFooterItems={extraFooterItems}
          customLogo={customLogo}
          omitAsideLogo={omitAsideLogo}
        />
      )}
      <PageLayout.Content>
        {appStarted && user ? children : <GlobalLoader higherOrder />}
      </PageLayout.Content>
    </PageLayout>
  );
};
