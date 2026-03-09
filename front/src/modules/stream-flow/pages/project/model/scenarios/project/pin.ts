import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { ProjectPinModel } from '@/modules/stream-flow/features/project/pin';
import { ProjectUnpinModel } from '@/modules/stream-flow/features/project/unpin';
import * as state from '@/modules/stream-flow/pages/project/model/state';

sample({
  clock: ProjectPinModel.success,
  filter: SFModule.routes.project.view.$mounted,
  target: state.project.current.pin,
});

sample({
  clock: ProjectUnpinModel.success,
  filter: SFModule.routes.project.view.$mounted,
  target: state.project.current.unpin,
});
