import { createEvent, sample } from 'effector';

import { modalsModel } from '@/shared/ui/modals';

import type { ActionConfirmPayload } from '../types';

const modal = modalsModel.register<ActionConfirmPayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<ActionConfirmPayload>();
// Event вызывается при подтверждении действия, возвращает payload
const confirmed = createEvent<ActionConfirmPayload>();

sample({
  clock: start,
  target: modal.open,
});

// Закрываем модалку после подтверждения
sample({
  clock: confirmed,
  target: modal.close,
});

export { start, confirmed };
