import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';

import * as state from '../state';

const view = ControlPlaneModule.routes.project.view;

sample({
  clock: view.onUnmounted,
  target: [
    state.project.current.reset,
    state.experiment.list.reset,
    state.experiment.active.reset,
    state.experiment.cubes.reset,
    state.dataSource.list.reset,
    state.dataSource.active.reset,
  ],
});
