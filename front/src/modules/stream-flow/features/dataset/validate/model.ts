import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

const validateMutation = createMutation({
  async handler(datasetConfig: string) {
    const response = await streamFlowApi.dataset.v2DatasetConfigValidateCreate({
      datasetConfig,
    });
    return response.data;
  },
});
const validateConfig = createEvent<string>();
const $pending = validateMutation.$pending;
const success = validateMutation.finished.success;
const failure = validateMutation.finished.failure;

sample({
  clock: validateConfig,
  target: validateMutation.start,
});

export { validateConfig, $pending, success, failure };
