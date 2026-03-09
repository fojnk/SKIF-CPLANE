import { createEvent, sample } from 'effector';

import { CustomParamPayload } from '@/modules/control-plane/features/custom-param/types';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register<CustomParamPayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<CustomParamPayload>();

sample({
  clock: start,
  target: modal.open,
});

export { start, modal };
