import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';

import * as state from './state';

const view = SFModule.routes.namespaces.view;

sample({
  clock: view.onMounted,
  target: state.list.load,
});

sample({
  clock: view.onUnmounted,
  target: state.list.reset,
});
