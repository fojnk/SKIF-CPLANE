import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';

import * as state from '../state';

const view = ControlPlaneModule.routes.namespace.view;

sample({
  clock: view.onUnmounted,
  target: state.namespace.reset,
});
