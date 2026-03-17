import { createEvent, sample } from 'effector';

import { ShowLogPayload } from '@/modules/control-plane/features/logs/monitoring-log';
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
