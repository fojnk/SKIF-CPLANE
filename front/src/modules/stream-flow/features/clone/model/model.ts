import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { catalogProjectModel } from '@/modules/stream-flow/entities/catalog/projects';
import { ClonePayload } from '@/modules/stream-flow/features/clone';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import {
  CloneDsRequest,
  ClonePipeRequest,
} from '@/modules/stream-flow/shared/types';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

const { load, $loading, $failed, reset, $data, $total, $error } =
  catalogProjectModel.create();

const modal = modalsModel.register<ClonePayload>({
  view: async () => (await import('../ui')).Modal,
});
const clonePipeMutation = createMutation({
  async handler(request: ClonePipeRequest) {
    const response =
      await streamFlowApi.experiment.v1ExperimentCopyCreate(request);
    return response.data;
  },
});
const cloneDsMutation = createMutation({
  async handler(request: CloneDsRequest) {
    const response = await streamFlowApi.dataset.v2DatasetCopyCreate(request);
    return response.data;
  },
});

const start = createEvent<ClonePayload>();
const cloneExperiment = createEvent<ClonePipeRequest>();
const cloneDS = createEvent<CloneDsRequest>();
const $pendingPipe = clonePipeMutation.$pending;
const successPipe = clonePipeMutation.finished.success;
const $pendingDs = cloneDsMutation.$pending;
const successDs = cloneDsMutation.finished.success;

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: cloneExperiment,
  target: clonePipeMutation.start,
});
sample({
  clock: cloneDS,
  target: cloneDsMutation.start,
});

sample({
  clock: successPipe,
  target: modal.close,
});

sample({
  clock: successDs,
  target: modal.close,
});

notifications.attach(clonePipeMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Experiment cloned',
    };
  },
});

notifications.attach(cloneDsMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Dataset cloned',
    };
  },
});

export {
  start,
  cloneExperiment,
  cloneDS,
  $pendingDs,
  successDs,
  $pendingPipe,
  successPipe,
  load,
  $loading,
  $failed,
  reset,
  $data,
  $total,
  $error,
};
