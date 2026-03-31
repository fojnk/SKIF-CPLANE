import { Flex, TabProvider, TabList, Tab } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo } from 'react';

import {
  NO_SCROLL_TABS_DS,
  projectPageModel,
  DatasetTabsOptions,
} from '@/modules/control-plane/pages/project';
import { SfTabContent } from '@/modules/control-plane/shared/layout';
import {
  DatasetTabType,
  ProjectInfoDC,
} from '@/modules/control-plane/shared/types';

import {
  ConfigTab,
  HistoryTab,
  AclTab,
  SchemaTab,
  ExperimentLinksTab,
  VersionsTab,
  JobsTab,
} from './tabs';

interface Props {
  dataset_id: number;
  project: ProjectInfoDC;
}

interface DatasetTabsState {
  datasetId: number;
  activeTab: DatasetTabType;
  scrollable: boolean;
  project: ProjectInfoDC;
}

interface DatasetTabsHandlers {
  onTabChange: (tabId: DatasetTabType) => void;
}

const useDatasetTabs = (
  dataset_id: number,
  project: ProjectInfoDC,
): {
  state: DatasetTabsState;
  handlers: DatasetTabsHandlers;
} => {
  const [setTab, tab] = useUnit([
    projectPageModel.dataSourceTabs.setActiveTab,
    projectPageModel.dataSourceTabs.$active,
  ]);

  const state = useMemo<DatasetTabsState>(
    () => ({
      datasetId: dataset_id,
      activeTab: tab,
      scrollable: !NO_SCROLL_TABS_DS.includes(tab),
      project,
    }),
    [dataset_id, tab, project],
  );

  const handlers = useMemo<DatasetTabsHandlers>(
    () => ({
      onTabChange: (tabId: DatasetTabType) => {
        setTab(tabId);
      },
    }),
    [setTab],
  );

  return { state, handlers };
};

const renderTabContent = (
  activeTab: DatasetTabType,
  datasetId: number,
  project: ProjectInfoDC,
) => {
  switch (activeTab) {
    case 'config':
      return <ConfigTab dataset_id={datasetId} project={project} />;
    case 'schema':
      return <SchemaTab dataset_id={datasetId} project={project} />;
    case 'links':
      return <ExperimentLinksTab dataset_id={datasetId} />;
    case 'acl':
      return <AclTab dataset_id={datasetId} />;
    case 'history':
      return <HistoryTab dataset_id={datasetId} />;
    case 'versions':
      return <VersionsTab dataset_id={datasetId} />;
    case 'jobs':
      return <JobsTab dataset_id={datasetId} />;
    default:
      return null;
  }
};

export const DsTabs = ({ dataset_id, project }: Props) => {
  const { state, handlers } = useDatasetTabs(dataset_id, project);
  const [tab, tabQueryValue, setTabQuery] = useUnit([
    projectPageModel.query.$activeDatasetTab,
    projectPageModel.query.dataSourceTab.$value,
    projectPageModel.query.dataSourceTab.set,
  ]);

  useEffect(() => {
    if (tabQueryValue !== tab) {
      setTabQuery(tab);
    }
    return () => {
      setTabQuery(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TabProvider
      value={state.activeTab}
      onUpdate={(value) => handlers.onTabChange(value as DatasetTabType)}
    >
      <Flex direction="column" style={{ height: '100%', overflow: 'hidden' }}>
        <div className="no-shrink sf-tabs">
          <TabList size="l">
            {DatasetTabsOptions.map((tab) => (
              <Tab key={tab.id} value={tab.id}>
                {tab.title}
              </Tab>
            ))}
          </TabList>
        </div>
        <SfTabContent padding={state.scrollable} scrollable={state.scrollable}>
          <div className={state.scrollable ? 'relative' : 'no-scroll-tab'}>
            {renderTabContent(state.activeTab, state.datasetId, state.project)}
          </div>
        </SfTabContent>
      </Flex>
    </TabProvider>
  );
};
