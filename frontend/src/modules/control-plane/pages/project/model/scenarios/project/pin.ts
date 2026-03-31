import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { ProjectPinModel } from '@/modules/control-plane/features/project/pin';
import { ProjectUnpinModel } from '@/modules/control-plane/features/project/unpin';
import * as state from '@/modules/control-plane/pages/project/model/state';

sample({
  clock: ProjectPinModel.success,
  filter: ControlPlaneModule.routes.project.view.$mounted,
  target: state.project.current.pin,
});

sample({
  clock: ProjectUnpinModel.success,
  filter: ControlPlaneModule.routes.project.view.$mounted,
  target: state.project.current.unpin,
});
