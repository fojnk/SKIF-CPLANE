import { createEvent, sample } from 'effector';

import { ResharderEditPayload } from '@/modules/control-plane/features/cubes/resharder-edit/types';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register<ResharderEditPayload>({
  view: async () => {
    const { Modal } = await import('../ui');
    return Modal;
  },
});

const start = createEvent<ResharderEditPayload>();

sample({
  clock: start,
  target: modal.open,
});

export { start, modal };
