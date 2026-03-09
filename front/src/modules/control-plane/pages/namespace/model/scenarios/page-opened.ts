import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';

import * as state from '../state';

const view = ControlPlaneModule.routes.namespace.view;

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
