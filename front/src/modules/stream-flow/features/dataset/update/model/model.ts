import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { DsUpdatePayload } from '@/modules/stream-flow/features/dataset/update';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { createLocalEvent } from '@/shared/lib/effector/create-local-event';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

type UpdateRequest = streamFlowApi.dc.RequestsUpdateDatasetRequestV2DC;

const modal = modalsModel.register<DsUpdatePayload>({
  view: async () => (await import('../ui')).Modal,
});
const updateMutation = createMutation({
  async handler(request: UpdateRequest) {
    const response = await streamFlowApi.dataset.v2DatasetUpdate(request);
    return response.data;
  },
});
const start = createLocalEvent<DsUpdatePayload>();
const $pending = updateMutation.$pending;
const success = updateMutation.finished.success;
const updateDataset = createEvent<UpdateRequest>();
const failure = updateMutation.finished.failure;

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: success,
  target: modal.close,
});

sample({
  clock: updateDataset,
  target: updateMutation.start,
});

notifications.attach(updateMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Successfully updated',
    };
  },
});

export { start, $pending, success, updateDataset, failure };
