import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';

import * as state from './state';

const view = ControlPlaneModule.routes.dataSources.view;

sample({
  clock: view.onMounted,
  target: [state.list.start, state.filters.load],
});

sample({
  clock: view.onUnmounted,
  target: [state.list.reset, state.filters.reset],
});
