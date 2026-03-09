import { Flex, TabProvider, TabList, Tab } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo, useEffect } from 'react';

import {
  ProjectTabsOptions,
  projectPageModel,
} from '@/modules/stream-flow/pages/project';
import { NO_SCROLL_TABS } from '@/modules/stream-flow/pages/project/constants';
import { SfTabContent } from '@/modules/stream-flow/shared/layout';
import {
  ProjectInfoDC,
  ProjectTabType,
} from '@/modules/stream-flow/shared/types';

import { AclTab, ContentTab, HistoryTab, ConfigTab, LinksTab } from './tabs';

interface Props {
  project: ProjectInfoDC;
}

interface ProjectTabsState {
  project: ProjectInfoDC;
  activeTab: ProjectTabType;
  scrollable: boolean;
}

interface ProjectTabsHandlers {
  onTabChange: (tabId: ProjectTabType) => void;
}

const useProjectTabs = (
  project: ProjectInfoDC,
): {
  state: ProjectTabsState;
  handlers: ProjectTabsHandlers;
} => {
  const [setTab, tab, projectTabQueryValue, setProjectTabQuery] = useUnit([
    projectPageModel.query.setProjectTab,
    projectPageModel.query.$activeProjectTab,
    projectPageModel.query.projectTab.$value,
    projectPageModel.query.projectTab.set,
  ]);

  // Синхронизация URL query с активным табом компонента
  useEffect(() => {
    if (projectTabQueryValue !== tab) {
      setProjectTabQuery(tab);
    }
    return () => {
      setProjectTabQuery(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Мемоизация состояния
  const state = useMemo<ProjectTabsState>(
    () => ({
      project,
      activeTab: tab,
      scrollable: !NO_SCROLL_TABS.includes(tab),
    }),
    [project, tab],
  );

  // Мемоизация обработчиков
  const handlers = useMemo<ProjectTabsHandlers>(
    () => ({
      onTabChange: (tabId: ProjectTabType) => {
        setTab(tabId);
      },
    }),
    [setTab],
  );

  return { state, handlers };
};

const renderTabContent = (
  activeTab: ProjectTabType,
  project: ProjectInfoDC,
) => {
  switch (activeTab) {
    case 'links':
      return <LinksTab project_id={project.id!} />;
    case 'content':
      return <ContentTab project_id={project.id!} />;
    case 'config':
      return <ConfigTab project={project} />;
    case 'acl':
      return <AclTab project_id={project.id!} />;
    case 'history':
      return <HistoryTab project_id={project.id!} />;
    default:
      return null;
  }
};

export const ProjectTabs = ({ project }: Props) => {
  const { state, handlers } = useProjectTabs(project);

  return (
    <TabProvider
      value={state.activeTab}
      onUpdate={(value) => handlers.onTabChange(value as ProjectTabType)}
    >
      <Flex direction="column" style={{ height: '100%', overflow: 'hidden' }}>
        <div className={`no-shrink sf-tabs `}>
          <TabList size="l">
            {ProjectTabsOptions.map((tab) => (
              <Tab key={tab.id} value={tab.id}>
                {tab.title}
              </Tab>
            ))}
          </TabList>
        </div>
        <SfTabContent padding={state.scrollable} scrollable={state.scrollable}>
          <div className={state.scrollable ? 'relative' : 'no-scroll-tab'}>
            {renderTabContent(state.activeTab, state.project)}
          </div>
        </SfTabContent>
      </Flex>
    </TabProvider>
  );
};
