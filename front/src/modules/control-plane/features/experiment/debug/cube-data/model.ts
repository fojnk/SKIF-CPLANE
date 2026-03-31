import { createEvent, sample } from 'effector';

import { CubeDataModalPayload } from '@/modules/control-plane/features/experiment/debug/ui/cube-data-modal';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register<CubeDataModalPayload>({
  view: async () => (await import('../ui/cube-data-modal')).CubeDataModal,
});

const start = createEvent<CubeDataModalPayload>();

sample({
  clock: start,
  target: modal.open,
});

export { start, modal };
