import { createEvent, sample } from 'effector';

import { ShowCubeParamsPayload } from '@/modules/control-plane/features/cubes/show-params/types';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register<ShowCubeParamsPayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<ShowCubeParamsPayload>();

sample({
  clock: start,
  target: modal.open,
});

export { start, modal };
