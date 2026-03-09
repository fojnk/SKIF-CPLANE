import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';

import * as state from '../state';

const view = SFModule.routes.project.view;

sample({
  clock: view.onMounted,
  source: state.query.experimentTab.$value,
  filter: Boolean,
  target: state.query.setExperimentTab,
});

sample({
  clock: view.onMounted,
  source: state.query.projectTab.$value,
  filter: Boolean,
  target: state.query.setProjectTab,
});

sample({
  clock: view.onMounted,
  source: state.query.dataSourceTab.$value,
  filter: Boolean,
  target: state.query.setDatasetTab,
});

sample({
  clock: view.onMounted,
  source: state.query.project.$value,
  fn: (project) => {
    return project ? Number(project) : null;
  },
  target: [
    state.project.current.load,
    state.experiment.list.load,
    state.dataSource.list.load,
  ],
});

// Загружаем selected item при первой загрузке страницы, если есть selected в URL
sample({
  clock: view.onMounted,
  source: state.query.selectedItem.$value,
  fn: (selectedValue: string | null) => {
    return selectedValue || null;
  },
  target: state.selected.setSelected,
});
