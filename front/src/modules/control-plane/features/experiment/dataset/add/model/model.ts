import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { experimentDsModel } from '@/modules/control-plane/entities/catalog/experiment-datasets';
import { AddPayload } from '@/modules/control-plane/features/experiment/dataset/add';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

type AddRequest = controlPlaneApi.dc.RequestsAddDatasetToExperimentRequestDC;

const { load, $loading, $failed, reset, $data, $total, $error } =
  experimentDsModel.create();

const modal = modalsModel.register<AddPayload>({
  view: async () => (await import('../ui')).Modal,
});
const addMutation = createMutation({
  async handler(request: AddRequest) {
    const response =
      await controlPlaneApi.experiment.v1ExperimentDatasetCreate(request);
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
