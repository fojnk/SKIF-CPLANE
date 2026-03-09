import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { notifications } from '@/shared/ui/notifications';

const stopMutation = createMutation({
  async handler(experiment_id: number) {
    const response = await streamFlowApi.experiment.v1ExperimentStopUpdate({
      experiment_id,
    });
    return response.data;
  },
});

const start = createEvent<number>();
const $pending = stopMutation.$pending;
const success = stopMutation.finished.success;

sample({
  clock: start,
  target: stopMutation.start,
});

notifications.attach(stopMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Experiment stopped',
    };
  },
});

export { start, $pending, success };
