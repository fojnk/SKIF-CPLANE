import { createEvent, sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';

export const navigate = createEvent();

sample({
  clock: SFModule.routes.worldMap.opened,
  target: SFModule.routes.root.navigate,
});
