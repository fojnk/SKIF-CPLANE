import { Flex, TabProvider, TabList, Tab } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useMemo, useEffect } from 'react';

import {
  ExperimentTabsOptions,
  NO_SCROLL_TABS_PIPE,
  projectPageModel,
} from '@/modules/control-plane/pages/project';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { SfTabContent } from '@/modules/control-plane/shared/layout';
import {
  ExperimentTabType,
  ProjectInfoDC,
} from '@/modules/control-plane/shared/types';

import {
  AclTab,
  ConfigTab,
  HistoryTab,
  DsTab,
  LinksTab,
  VariablesTab,
  VersionsTab,
  JobsTab,
} from './tabs';

const isListedExperimentTab = (id: ExperimentTabType) =>
  ExperimentTabsOptions.some((t) => t.id === id);

interface Props {
  experiment_id: number;
  project: ProjectInfoDC;
}

interface ExperimentTabsState {
  experimentId: number;
  activeTab: ExperimentTabType;
  scrollable: boolean;
  project: ProjectInfoDC;
}

interface ExperimentTabsHandlers {
  onTabChange: (tabId: ExperimentTabType) => void;
}

const useExperimentTabs = (
  experiment_id: number,
  project: ProjectInfoDC,
): {
  state: ExperimentTabsState;
  handlers: ExperimentTabsHandlers;
} => {
  const [setTab, tab, experimentTabQueryValue, setExperimentTabQuery] = useUnit(
    [
      projectPageModel.query.setExperimentTab,
      projectPageModel.query.$activeExperimentTab,
      projectPageModel.query.experimentTab.$value,
      projectPageModel.query.experimentTab.set,
    ],
  );

  useEffect(() => {
    if (experimentTabQueryValue !== tab) {
      setExperimentTabQuery(tab);
    }
    return () => {
      setExperimentTabQuery(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isListedExperimentTab(tab)) {
      setTab('config');
    }
  }, [tab, setTab]);

  const activeTab = isListedExperimentTab(tab) ? tab : 'config';

  // Мемоизация состояния
  const state = useMemo<ExperimentTabsState>(
    () => ({
      experimentId: experiment_id,
      project,
      activeTab,
      scrollable: !NO_SCROLL_TABS_PIPE.includes(activeTab),
    }),
    [experiment_id, activeTab, project],
  );

  const handlers = useMemo<ExperimentTabsHandlers>(
    () => ({
      onTabChange: (tabId: ExperimentTabType) => {
        setTab(tabId);
      },
    }),
    [setTab],
  );

  return { state, handlers };
};

const renderTabContent = (
  activeTab: ExperimentTabType,
  experimentId: number,
  experimentName: string,
  project: ProjectInfoDC,
  rights: controlPlaneApi.dc.AclRightDC[] | null,
) => {
  switch (activeTab) {
    case 'config':
      return <ConfigTab experiment_id={experimentId} project={project} />;
    case 'acl':
      return <AclTab experiment_id={experimentId} />;
    case 'ds':
      return <DsTab experiment_id={experimentId} project_id={project.id!} />;
    case 'history':
      return (
        <HistoryTab experiment_id={experimentId} project_id={project.id!} />
      );
    case 'versions':
      return (
        <VersionsTab
          experiment_id={experimentId}
          experiment_name={experimentName}
        />
      );
    case 'links':
      return <LinksTab experiment_id={experimentId} />;
    case 'var':
      return (
        <VariablesTab experiment_id={experimentId} rights={rights ?? []} />
      );
    case 'jobs':
      return <JobsTab experiment_id={experimentId} />;
    default:
      return null;
  }
};

export const ExperimentTabs = ({ experiment_id, project }: Props) => {
  const { state, handlers } = useExperimentTabs(experiment_id, project);
  const [loadExperiment, resetExperiment] = useUnit([
    projectPageModel.experiment.active.load,
    projectPageModel.experiment.active.reset,
  ]);
  const activeExperimentData = useUnit(
    projectPageModel.experiment.active.$data,
  );

  useEffect(() => {
    loadExperiment(experiment_id);

    return () => {
      resetExperiment();
    };
  }, [experiment_id, loadExperiment, resetExperiment]);

  return (
    <TabProvider
      value={state.activeTab}
      onUpdate={(value) => handlers.onTabChange(value as ExperimentTabType)}
    >
      <Flex direction="column" style={{ height: '100%', overflow: 'hidden' }}>
        <div className="no-shrink sf-tabs">
          <TabList size="l">
            {ExperimentTabsOptions.map((tab) => (
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
              state.experimentId,
              activeExperimentData?.name ?? '',
              state.project,
              activeExperimentData?.rights ?? null,
            )}
          </div>
        </SfTabContent>
      </Flex>
    </TabProvider>
  );
};
