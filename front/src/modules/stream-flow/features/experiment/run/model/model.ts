import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { notifications } from '@/shared/ui/notifications';

const runMutation = createMutation({
  async handler(experiment_id: number) {
    const response = await streamFlowApi.experiment.v1ExperimentStartUpdate({
      experiment_id,
    });
    return response.data;
  },
});

const start = createEvent<number>();
const $pending = runMutation.$pending;
const success = runMutation.finished.success;

sample({
  clock: start,
  target: runMutation.start,
});

notifications.attach(runMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Experiment started',
    };
  },
});

export { start, $pending, success };
