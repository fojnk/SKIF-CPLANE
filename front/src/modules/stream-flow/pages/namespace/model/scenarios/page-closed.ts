import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';

import * as state from '../state';

const view = SFModule.routes.namespace.view;

sample({
  clock: view.onUnmounted,
  target: state.namespace.reset,
});
