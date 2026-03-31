import { createEvent, sample } from 'effector';

import { ResharderViewPayload } from '@/modules/control-plane/features/cubes/resharder-view/types';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register<ResharderViewPayload>({
  view: async () => {
    const { Modal } = await import('../ui');
    return Modal;
  },
});

const start = createEvent<ResharderViewPayload>();

sample({
  clock: start,
  target: modal.open,
});

export { start, modal };
