import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
type ValidateRequest =
  streamFlowApi.dc.RequestsCompleteExperimentValidateRequestDC;
const validateMutation = createMutation({
  async handler(request: ValidateRequest) {
    const response =
      await streamFlowApi.experiment.v2ExperimentConfigValidateCreate(request);
    return response.data;
  },
});
const validateConfig = createEvent<ValidateRequest>();
const $pending = validateMutation.$pending;
const success = validateMutation.finished.success;
const failure = validateMutation.finished.failure;

sample({
  clock: validateConfig,
  target: validateMutation.start,
});

export { validateConfig, $pending, success, failure };
