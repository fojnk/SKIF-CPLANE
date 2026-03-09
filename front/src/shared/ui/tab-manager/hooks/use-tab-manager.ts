import { IconProps } from '@gravity-ui/uikit';
import { is, Store } from 'effector';
import { useUnit } from 'effector-react';
import { ComponentType, useLayoutEffect } from 'react';

export interface TabConfig<ComponentProps extends AnyObject> {
  title: string;
  icon?: IconProps['data'];
  view: ComponentType<ComponentProps>;
  id: string;
}

export interface TabData<ComponentProps extends AnyObject>
  extends TabConfig<ComponentProps> {
  active: boolean;
  onClick: VoidFunction;
  disabled?: boolean;
}

interface TabManager<P extends AnyObject> {
  tabs: TabData<P>[];
  setTab: (tabId: string) => void;
  activeTab: TabData<P>;
}

export const useTabManager = <P extends AnyObject>({
  tab: $tab,
  tabConfigs,
  fallback = tabConfigs[0],
  onChangeTab,
  navigationDisabled,
}: {
  tab: Store<string | null> | (string | null);
  tabConfigs: TabConfig<P>[];
  fallback?: TabConfig<P>;
  onChangeTab: (tabId: string, fallback?: boolean) => void;
  navigationDisabled?: boolean;
}): TabManager<P> => {
  // eslint-disable-next-line react-hooks/rules-of-hooks, effector/enforce-store-naming-convention
  const activeTabId = is.store($tab) ? useUnit($tab) : $tab;
  let activeTab: TabData<P> | null = null;
  let fallbackTab: TabData<P> | null = null;

  const tabs = tabConfigs.map((tabConfig): TabData<P> => {
    const active = activeTabId === tabConfig.id;

    const tabData: TabData<P> = {
      ...tabConfig,
      active,
      onClick: () => onChangeTab(tabConfig.id),
      disabled: navigationDisabled,
    };

    if (tabConfig === fallback || tabConfig.id === fallback.id) {
      fallbackTab = tabData;
    }

    if (tabData.active) {
      activeTab = tabData;
    }

    return tabData;
  });

  if (!activeTab) {
    fallbackTab!.active = true;
  }

  useLayoutEffect(() => {
    if (!activeTab) {
      onChangeTab(fallback.id, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return {
    activeTab: activeTab || fallbackTab!,
    setTab: onChangeTab,
    tabs,
  };
};
