import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';

import * as state from './state';

const view = ControlPlaneModule.routes.namespaces.view;

sample({
  clock: view.onMounted,
  target: state.list.load,
});

sample({
  clock: view.onUnmounted,
  target: state.list.reset,
});
