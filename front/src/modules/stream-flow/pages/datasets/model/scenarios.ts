import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';

import * as state from './state';

const view = SFModule.routes.dataSources.view;

sample({
  clock: view.onMounted,
  target: [state.list.start, state.filters.load],
});

sample({
  clock: view.onUnmounted,
  target: [state.list.reset, state.filters.reset],
});
