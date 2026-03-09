import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';

import * as state from '../state';

const view = SFModule.routes.namespace.view;

sample({
  clock: view.onMounted,
  source: state.query.namespace.$value,
  filter: Boolean,
  fn: (id) => Number(id),
  target: state.namespace.load,
});

sample({
  clock: view.onMounted,
  source: state.tabs.tabQuery.$value,
  filter: Boolean,
  target: state.tabs.setActiveTab,
});
