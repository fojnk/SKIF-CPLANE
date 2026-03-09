import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { notifications } from '@/shared/ui/notifications';

type SaveRequest = streamFlowApi.dc.RequestsUpdateCompleteExperimentRequestDC;

const updateMutation = createMutation({
  async handler(request: SaveRequest) {
    const response = await streamFlowApi.experiment.v1ExperimentUpdate(request);
    return response.data;
  },
});
const updateExperiment = createEvent<SaveRequest>();
const $pending = updateMutation.$pending;
const success = updateMutation.finished.success;
const failure = updateMutation.finished.failure;

sample({
  clock: updateExperiment,
  target: updateMutation.start,
});

notifications.attach(updateMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Experiment updated',
    };
  },
});

export { updateExperiment, $pending, success, failure };
