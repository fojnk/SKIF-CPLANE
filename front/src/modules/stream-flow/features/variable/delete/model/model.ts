import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { VariableDeletePayload } from '@/modules/stream-flow/features/variable/delete/types';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

const modal = modalsModel.register<VariableDeletePayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<VariableDeletePayload>();

sample({
  clock: start,
  target: modal.open,
});

const deleteMutation = createMutation({
  async handler(variable_id: number) {
    const response = await streamFlowApi.experiment.v1ExperimentVariableDelete({
      variable_id,
    });
    return response.data;
  },
});

const deleteVariable = createEvent<number>();
sample({
  clock: deleteVariable,
  target: deleteMutation.start,
});

const $pending = deleteMutation.$pending;
const success = deleteMutation.finished.success;

sample({
  clock: success,
  target: modal.close,
});

notifications.attach(deleteMutation, {
  success: () => ({
    type: 'success',
    title: 'Variable removed',
  }),
});

export { start, success, deleteVariable, $pending };
