import { createEvent, sample } from 'effector';

import { ShowDiffPayload } from '@/modules/control-plane/features/editor/show-diff';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register<ShowDiffPayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<ShowDiffPayload>();
sample({
  clock: start,
  target: modal.open,
});

export { start };
