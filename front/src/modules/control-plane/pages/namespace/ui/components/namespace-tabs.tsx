import { Flex, TabProvider, TabList, Tab } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo, useEffect } from 'react';

import {
  namespacePageModel,
  NO_SCROLL_TABS,
  NamespaceTabsOptions,
} from '@/modules/control-plane/pages/namespace';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { SfTabContent } from '@/modules/control-plane/shared/layout';
import { NamespaceTabType } from '@/modules/control-plane/shared/types';

import { ConfigTab, HistoryTab, AclTab } from './tabs';

interface Props {
  namespace: controlPlaneApi.dc.ResponsesGetNamespaceResponseDC;
}

interface NamespaceTabsState {
  namespaceId: number;
  namespace: controlPlaneApi.dc.ResponsesGetNamespaceResponseDC;
  activeTab: NamespaceTabType;
  scrollable: boolean;
}

interface NamespaceTabsHandlers {
  onTabChange: (tabId: NamespaceTabType) => void;
}

const useNamespaceTabs = (
  namespace: controlPlaneApi.dc.ResponsesGetNamespaceResponseDC,
): {
  state: NamespaceTabsState;
  handlers: NamespaceTabsHandlers;
} => {
  const [setTab, tab, namespaceTabQueryValue, setNamespaceTabQuery] = useUnit([
    namespacePageModel.tabs.setActiveTab,
    namespacePageModel.tabs.$active,
    namespacePageModel.tabs.tabQuery.$value,
    namespacePageModel.tabs.tabQuery.set,
  ]);

  // Синхронизация URL query с активным табом компонента
  useEffect(() => {
    if (namespaceTabQueryValue !== tab) {
      setNamespaceTabQuery(tab);
    }
    return () => {
      setNamespaceTabQuery(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = useMemo<NamespaceTabsState>(
    () => ({
      namespaceId: namespace.id || 0,
      namespace,
      activeTab: tab,
      scrollable: !NO_SCROLL_TABS.includes(tab),
    }),
    [namespace, tab],
  );

  const handlers = useMemo<NamespaceTabsHandlers>(
    () => ({
      onTabChange: (tabId: NamespaceTabType) => {
        setTab(tabId);
      },
    }),
    [setTab],
  );

  return { state, handlers };
};

const renderTabContent = (
  activeTab: NamespaceTabType,
  namespaceId: number,
  namespace: controlPlaneApi.dc.ResponsesGetNamespaceResponseDC,
) => {
  switch (activeTab) {
    case 'config':
      return <ConfigTab namespace={namespace} />;
    case 'acl':
      return <AclTab namespace_id={namespaceId} />;
    case 'history':
      return <HistoryTab namespace_id={namespaceId} />;
    default:
      return null;
  }
};

export const NamespaceTabs = ({ namespace }: Props) => {
  const { state, handlers } = useNamespaceTabs(namespace);

  return (
    <TabProvider
      value={state.activeTab}
      onUpdate={(value) => handlers.onTabChange(value as NamespaceTabType)}
    >
      <Flex direction="column" style={{ height: '100%', overflow: 'hidden' }}>
        <div className="no-shrink sf-tabs">
          <TabList size="l">
            {NamespaceTabsOptions.map((tab) => (
              <Tab key={tab.id} value={tab.id}>
                {tab.title}
              </Tab>
            ))}
          </TabList>
        </div>
        <SfTabContent padding={state.scrollable} scrollable={state.scrollable}>
          <div className={state.scrollable ? 'relative' : 'no-scroll-tab'}>
            {renderTabContent(
              state.activeTab,
              state.namespaceId,
              state.namespace,
            )}
          </div>
        </SfTabContent>
      </Flex>
    </TabProvider>
  );
};
