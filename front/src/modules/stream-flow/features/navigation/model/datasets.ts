import { createEvent, sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';

export const navigate = createEvent();

sample({
  clock: navigate,
  fn: () => ({
    replace: false,
    params: {},
    query: {},
  }),
  target: SFModule.routes.dataSources.navigate,
});
