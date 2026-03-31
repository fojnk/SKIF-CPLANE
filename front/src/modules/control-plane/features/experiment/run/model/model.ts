import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { notifications } from '@/shared/ui/notifications';

const runMutation = createMutation({
  async handler(experiment_id: number) {
    const response = await controlPlaneApi.experiment.v1ExperimentStartUpdate({
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
