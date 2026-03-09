import { createMutation } from '@farfetched/core';
import { sample } from 'effector';

import { ExperimentCreatePayload } from '@/modules/stream-flow/features/experiment/create';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { createLocalEvent } from '@/shared/lib/effector/create-local-event';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

const modal = modalsModel.register<ExperimentCreatePayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createLocalEvent<ExperimentCreatePayload>((event) => {
  sample({
    clock: event,
    target: modal.open,
  });
});

const addMutation = createMutation({
  async handler(
    request: streamFlowApi.dc.RequestsCreateCompleteExperimentRequestDC,
  ) {
    const response = await streamFlowApi.experiment.v1ExperimentCreate(request);
    return response.data;
  },
});

const onSubmit =
  createLocalEvent<streamFlowApi.dc.RequestsCreateCompleteExperimentRequestDC>(
    (event) => {
      sample({
        clock: event,
        target: addMutation.start,
      });
    },
  );

const $pending = addMutation.$pending;
const success = addMutation.finished.success;

sample({
  clock: success,
  target: modal.close,
});

notifications.attach(addMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Experiment created',
    };
  },
});

export { start, onSubmit, $pending, success };
