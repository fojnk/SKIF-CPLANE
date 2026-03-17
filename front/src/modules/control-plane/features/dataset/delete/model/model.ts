import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { DsDeletePayload } from '@/modules/control-plane/features/dataset/delete';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

const modal = modalsModel.register<DsDeletePayload>({
  view: async () => (await import('../ui')).Modal,
});
const deleteMutation = createMutation({
  async handler(id: number) {
    const response = await controlPlaneApi.dataset.v1DatasetDelete({ id });
    return response.data;
  },
});
const start = createEvent<DsDeletePayload>();
const $pending = deleteMutation.$pending;
const success = deleteMutation.finished.success;
const deleteDataset = createEvent<number>();

sample({
  clock: deleteDataset,
  target: deleteMutation.start,
});

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: success,
  target: modal.close,
});

notifications.attach(deleteMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Dataset removed',
    };
  },
});

export { start, success, deleteDataset, $pending };
