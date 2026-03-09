import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { DsCreatePayload } from '@/modules/stream-flow/features/dataset/create';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

type CreateRequest = streamFlowApi.dc.RequestsCreateDatasetRequestV2DC;

const modal = modalsModel.register<DsCreatePayload>({
  view: async () => (await import('../ui')).Modal,
});
const addMutation = createMutation({
  async handler(request: CreateRequest) {
    const response = await streamFlowApi.dataset.v2DatasetCreate(request);
    return response.data;
  },
});
const start = createEvent<DsCreatePayload>();
const createDataset = createEvent<CreateRequest>();

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: createDataset,
  target: addMutation.start,
});

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
      title: 'Dataset created',
    };
  },
});

export { start, createDataset, $pending, success };
