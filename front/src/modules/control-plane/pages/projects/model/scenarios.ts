import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { ProjectPinModel } from '@/modules/control-plane/features/project/pin';
import { ProjectUnpinModel } from '@/modules/control-plane/features/project/unpin';

import * as state from './state';

const view = ControlPlaneModule.routes.root.view;

sample({
  clock: view.onMounted,
  target: [state.list.start, state.filters.load],
});

sample({
  clock: view.onUnmounted,
  target: [state.list.reset, state.filters.reset],
});

sample({
  clock: ProjectPinModel.success,
  filter: ControlPlaneModule.routes.root.view.$mounted,
  target: state.list.reload,
});

sample({
  clock: ProjectUnpinModel.success,
  filter: ControlPlaneModule.routes.root.view.$mounted,
  target: state.list.reload,
});
