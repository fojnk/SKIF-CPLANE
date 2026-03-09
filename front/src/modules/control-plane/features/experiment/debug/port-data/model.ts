import { createEvent, sample } from 'effector';

import { PortDataModalPayload } from '@/modules/control-plane/features/experiment/debug/types';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register<PortDataModalPayload>({
  view: async () => (await import('../ui/port-data-modal')).PortDataModal,
});

const start = createEvent<PortDataModalPayload>();

sample({
  clock: start,
  target: modal.open,
});

export { start, modal };
