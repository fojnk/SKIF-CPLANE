import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { DsEditPayload } from '@/modules/control-plane/features/dataset/edit';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

type UpdateRequest = controlPlaneApi.dc.RequestsUpdateDatasetRequestV2DC;

const modal = modalsModel.register<DsEditPayload>({
  view: async () => (await import('../ui')).Modal,
});

const editMutation = createMutation({
  async handler(request: UpdateRequest) {
    const response = await controlPlaneApi.dataset.v2DatasetUpdate(request);
    return response.data;
  },
});
const start = createEvent<DsEditPayload>();
const renameDataset = createEvent<UpdateRequest>();
const $pending = editMutation.$pending;
const success = editMutation.finished.success;

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: success,
  target: modal.close,
});

sample({
  clock: renameDataset,
  target: editMutation.start,
});

notifications.attach(editMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Dataset updated',
    };
  },
});

export { start, renameDataset, $pending, success };
