import { createEvent, sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';

export const navigate = createEvent();

sample({
  clock: ControlPlaneModule.routes.activity.opened,
  target: ControlPlaneModule.routes.root.navigate,
});
