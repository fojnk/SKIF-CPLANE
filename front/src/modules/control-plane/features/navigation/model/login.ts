import { createEvent, sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';

export const navigate = createEvent();

sample({
  clock: navigate,
  fn: () => ({
    replace: true,
    params: {},
    query: {},
  }),
  target: ControlPlaneModule.routes.login.navigate,
});
