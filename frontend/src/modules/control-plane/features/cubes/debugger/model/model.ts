import { createEvent, sample } from 'effector';

import { modalsModel } from '@/shared/ui/modals';

import { CubesDebuggerPayload } from '../types';

const modal = modalsModel.register<CubesDebuggerPayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<CubesDebuggerPayload>();

sample({
  clock: start,
  target: modal.open,
});

export { start, modal };
