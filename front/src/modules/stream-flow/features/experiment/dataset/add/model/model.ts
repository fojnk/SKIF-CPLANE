import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { experimentDsModel } from '@/modules/stream-flow/entities/catalog/experiment-datasets';
import { AddPayload } from '@/modules/stream-flow/features/experiment/dataset/add';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

type AddRequest = streamFlowApi.dc.RequestsAddDatasetToExperimentRequestDC;

const { load, $loading, $failed, reset, $data, $total, $error } =
  experimentDsModel.create();

const modal = modalsModel.register<AddPayload>({
  view: async () => (await import('../ui')).Modal,
});
const addMutation = createMutation({
  async handler(request: AddRequest) {
    const response =
      await streamFlowApi.experiment.v1ExperimentDatasetCreate(request);
    return response.data;
  },
});

const start = createEvent<AddPayload>();
const linkDataset = createEvent<AddRequest>();
const $pending = addMutation.$pending;
const success = addMutation.finished.success;

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: linkDataset,
  target: addMutation.start,
});

sample({
  clock: success,
  target: modal.close,
});

sample({
  clock: modal.close,
  target: reset,
});

notifications.attach(addMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Alias created',
    };
  },
});

export {
  start,
  linkDataset,
  $pending,
  success,
  load,
  $loading,
  $failed,
  reset,
  $data,
  $total,
  $error,
};
