import { createMutation } from '@farfetched/core';
import { sample } from 'effector';

import { ExperimentDeletePayload } from '@/modules/stream-flow/features/experiment/delete';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { createLocalEvent } from '@/shared/lib/effector/create-local-event';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

const modal = modalsModel.register<ExperimentDeletePayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createLocalEvent<ExperimentDeletePayload>((event) => {
  sample({
    clock: event,
    target: modal.open,
  });
});

const deleteMutation = createMutation({
  async handler(id: number) {
    const response = await streamFlowApi.experiment.v1ExperimentDelete({ id });
    return response.data;
  },
});
const $pending = deleteMutation.$pending;
const success = deleteMutation.finished.success;

const onSubmit = createLocalEvent<number>((event) => {
  sample({
    clock: event,
    target: deleteMutation.start,
  });
});

sample({
  clock: success,
  target: modal.close,
});

notifications.attach(deleteMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Experiment removed',
    };
  },
});

export { start, success, onSubmit, $pending };
