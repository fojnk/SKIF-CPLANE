import { createEvent, createStore, sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import {
  ProjectTabType,
  ExperimentTabType,
  DatasetTabType,
} from '@/modules/stream-flow/shared/types';
import { router } from '@/routing/router';
import { querySyncModel } from '@/shared/lib/routing';

import { setSelected } from './selected';

const view = SFModule.routes.project.view;

const project = querySyncModel<string>({
  router,
  field: 'id',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const selectedItem = querySyncModel<string>({
  router,
  field: 'selected',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const projectTab = querySyncModel<ProjectTabType | null>({
  router,
  field: 'tab',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const experimentTab = querySyncModel<ExperimentTabType | null>({
  router,
  field: 'pipeTab',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const dataSourceTab = querySyncModel<DatasetTabType | null>({
  router,
  field: 'dsTab',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const $activeProjectTab = createStore<ProjectTabType>('content');
const setProjectTab = createEvent<ProjectTabType>();

const $activeExperimentTab = createStore<ExperimentTabType>('config');
const setExperimentTab = createEvent<ExperimentTabType>();

const $activeDatasetTab = createStore<DatasetTabType>('config');
const setDatasetTab = createEvent<DatasetTabType>();

sample({
  clock: setProjectTab,
  target: projectTab.set,
});

sample({
  clock: setProjectTab,
  target: $activeProjectTab,
});

sample({
  clock: setExperimentTab,
  target: experimentTab.set,
});

sample({
  clock: setExperimentTab,
  target: $activeExperimentTab,
});

sample({
  clock: setDatasetTab,
  target: dataSourceTab.set,
});

sample({
  clock: setDatasetTab,
  target: $activeDatasetTab,
});

// Обратная синхронизация: обновляем URL при изменении selected
sample({
  clock: setSelected,
  fn: (selected: string | null) => {
    return selected || '';
  },
  target: selectedItem.set,
});

export {
  project,
  selectedItem,
  projectTab,
  setProjectTab,
  experimentTab,
  setExperimentTab,
  $activeExperimentTab,
  $activeProjectTab,
  dataSourceTab,
  setDatasetTab,
  $activeDatasetTab,
};
