import { sample } from 'effector';

import { createLocalEvent } from '@/shared/lib/effector/create-local-event';
import { modalsModel } from '@/shared/ui/modals';

import { VariableShowListPayload } from '../types';

const modal = modalsModel.register<VariableShowListPayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createLocalEvent<VariableShowListPayload>((event) => {
  sample({
    clock: event,
    target: modal.open,
  });
});

export const VariableShowListModel = {
  start,
};
