import { createEvent, sample } from 'effector';

import { NsCreateModel } from '@/modules/control-plane/features/namespace/create';

const createNamespace = createEvent();

sample({
  clock: createNamespace,
  target: NsCreateModel.start,
});

export { createNamespace };
