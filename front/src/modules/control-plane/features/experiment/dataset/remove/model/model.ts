import { createMutation } from '@farfetched/core';
import { sample } from 'effector';

import { ExperimentRemoveDsPayload } from '@/modules/control-plane/features/experiment/dataset/remove';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { createLocalEvent } from '@/shared/lib/effector/create-local-event';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

type RemoveRequest =
  controlPlaneApi.dc.RequestsRemoveDatasetFromExperimentRequestDC;

const modal = modalsModel.register<ExperimentRemoveDsPayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createLocalEvent<ExperimentRemoveDsPayload>((event) => {
  sample({
    clock: event,
    target: modal.open,
  });
});

const deleteMutation = createMutation({
  async handler(request: RemoveRequest) {
    const response =
      await controlPlaneApi.experiment.v1ExperimentDatasetDelete(request);
    return response.data;
  },
});
const $pending = deleteMutation.$pending;
const success = deleteMutation.finished.success;

const onSubmit = createLocalEvent<RemoveRequest>((event) => {
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
      title: 'Alias removed',
    };
  },
});

export { start, success, onSubmit, $pending };
