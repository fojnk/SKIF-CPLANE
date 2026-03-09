import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
type ValidateRequest =
  controlPlaneApi.dc.RequestsCompleteExperimentValidateRequestDC;
const validateMutation = createMutation({
  async handler(request: ValidateRequest) {
    const response =
      await controlPlaneApi.experiment.v2ExperimentConfigValidateCreate(request);
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
