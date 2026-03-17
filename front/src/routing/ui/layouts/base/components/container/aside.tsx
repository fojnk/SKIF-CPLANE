import { Dots9, Gear, Sun, Moon } from '@gravity-ui/icons';
import {
  DrawerItemProps,
  FooterItem,
  LogoProps,
  MenuItem,
  PageLayoutAside,
} from '@gravity-ui/navigation';
import { Avatar, useTheme } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { noop } from 'lodash-es';
import { ReactNode, useState, useEffect } from 'react';

import {
  userLib,
  userModel,
} from '@/modules/control-plane/entities/session/user';
import { ServicesMenu } from '@/modules/control-plane/shared/ui';
import { NavbarPanel } from '@/routing';
import { themeModel, Theme } from '@/shared/lib/complex/theme';
import { AppSettings } from '@/widgets/app-settings';
import { CurrentUserBadge } from '@/widgets/current-user-badge';

import * as baseTemplateConfig from '../../config';

import { AsideMenuItem, AsideSubheaderMenuItem } from './types';

export const Aside = ({
  onChangeCompact,
  settingsPanel,
  menuItems,
  subheaderMenuItems = [],
  extraFooterItems = [],
  customLogo,
}: {
  onChangeCompact: (value: boolean) => void;
  settingsPanel?: ReactNode;
  menuItems?: AsideMenuItem[];
  subheaderMenuItems?: AsideSubheaderMenuItem[];
  extraFooterItems?: MenuItem[];
  customLogo?: LogoProps;
}) => {
  const [activePanel, setActivePanel] = useState<Maybe<NavbarPanel>>(null);
  const user = useUnit(userModel.$user);
  const isDarkTheme = useTheme() === 'dark';

  const toggleTheme = () => {
    const newTheme: Theme = isDarkTheme ? 'light' : 'dark';
    themeModel.theme.set(newTheme);
  };

  // Обработчик клика снаружи только для панели AccountInfo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Проверяем, что клик не по элементам панели пользователя и не внутри popup'а
      if (
        !target.closest('.page-container__user-icon') &&
        !target.closest('[data-panel]') &&
        !target.closest('[role="dialog"]') &&
        !target.closest('.g-popup') &&
        !target.closest('[data-qa="current-user-badge"]') &&
        activePanel === NavbarPanel.AccountInfo
      ) {
        setActivePanel(null);
      }
    };

    if (activePanel === NavbarPanel.AccountInfo) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activePanel]);

  const panelItems = [
    {
      id: 'settings',
      content: settingsPanel || <AppSettings />,
      visible: activePanel === NavbarPanel.Settings,
      direction: 'left',
    },
    {
      id: 'services',
      content: <ServicesMenu />,
      visible: activePanel === NavbarPanel.Services,
      direction: 'left',
    },
  ] as DrawerItemProps[];

  const subheadItems = [
    {
      item: {
        id: 'all-services',
        icon: Dots9,
        title: 'Все сервисы',
        onItemClick: () => setActivePanel(NavbarPanel.Services),
      },
    },
    ...subheaderMenuItems,
  ] as AsideSubheaderMenuItem[];

  const logo: LogoProps = {
    icon: customLogo?.icon ?? baseTemplateConfig.logo.icon,
    text: customLogo?.text ?? baseTemplateConfig.logo.text,
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      baseTemplateConfig.logo.onClick();
    },
  };

  return (
    <PageLayoutAside
      panelItems={panelItems}
      subheaderItems={subheadItems}
      onClosePanel={() => setActivePanel(null)}
      menuItems={menuItems?.map((menuItem) => ({
        ...menuItem,
        onItemClick: (...args) => {
          args[2].preventDefault();
          if (menuItem.current) {
            noop();
          } else {
            menuItem.onItemClick?.(...args);
          }
        },
      }))}
      logo={logo}
      onChangeCompact={onChangeCompact}
      renderFooter={({ compact }) => (
        <>
          <FooterItem
            compact={compact}
            item={{
              id: 'theme-toggle',
              title: 'Тема',
              icon: isDarkTheme ? Moon : Sun,
              onItemClick: toggleTheme,
            }}
          />
          {extraFooterItems.map((item) => (
            <FooterItem key={item.id} compact={compact} item={item} />
          ))}
          <FooterItem
            compact={compact}
            item={{
              id: 'settings-badge',
              title: 'Настройки',
              icon: Gear,
              current: activePanel === NavbarPanel.Settings,
              onItemClick: () => setActivePanel(NavbarPanel.Settings),
            }}
            enableTooltip={activePanel !== NavbarPanel.Settings}
            popupVisible={activePanel === NavbarPanel.Settings}
          />
          <FooterItem
            compact={compact}
            item={{
              id: 'user-badge',
              icon: () => (
                <foreignObject className="page-container__user-icon">
                  <Avatar
                    view="filled"
                    size="xs"
                    text={userLib.getUsername(user)}
                    imgUrl={userLib.getUserAvatar(user)}
                  />
                </foreignObject>
              ),
              current: activePanel === NavbarPanel.AccountInfo,
              title: userLib.getUserDisplayName(user) || 'Профиль',
              tooltipText: 'Учетная запись',
              onItemClick: () => setActivePanel(NavbarPanel.AccountInfo),
            }}
            enableTooltip={activePanel !== NavbarPanel.AccountInfo}
            popupVisible={activePanel === NavbarPanel.AccountInfo}
            renderPopupContent={() => <CurrentUserBadge />}
          />
        </>
      )}
    />
  );
};
