import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { ProjectPinModel } from '@/modules/stream-flow/features/project/pin';
import { ProjectUnpinModel } from '@/modules/stream-flow/features/project/unpin';

import * as state from './state';

const view = SFModule.routes.root.view;

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
  filter: SFModule.routes.root.view.$mounted,
  target: state.list.reload,
});

sample({
  clock: ProjectUnpinModel.success,
  filter: SFModule.routes.root.view.$mounted,
  target: state.list.reload,
});
