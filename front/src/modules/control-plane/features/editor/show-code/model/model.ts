import { createEvent, sample } from 'effector';

import { modalsModel } from '@/shared/ui/modals';

import { ShowCodePayload } from '../types';

const modal = modalsModel.register<ShowCodePayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<ShowCodePayload>();
sample({
  clock: start,
  target: modal.open,
});

export { start };
