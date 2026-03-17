import { createEvent, sample } from 'effector';

import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register<string>({
  view: async () => (await import('./ui')).Modal,
});

const start = createEvent<string>();

sample({
  clock: start,
  target: modal.open,
});

export { start };
