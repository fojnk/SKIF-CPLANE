import { createEvent, sample } from 'effector';

import { ShowLogPayload } from '@/modules/stream-flow/features/logs/monitoring-log';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register<ShowLogPayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<ShowLogPayload>();

sample({
  clock: start,
  target: modal.open,
});

export { start };
