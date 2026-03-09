import { createEvent, sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';

export const navigate = createEvent();

sample({
  clock: SFModule.routes.access.opened,
  target: SFModule.routes.root.navigate,
});
