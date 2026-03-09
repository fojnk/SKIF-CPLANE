import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { notifications } from '@/shared/ui/notifications';

type UpdateRequest = streamFlowApi.dc.RequestsUpdateExperimentVariableRequestDC;

const addMutation = createMutation({
  async handler(request: UpdateRequest) {
    const res =
      await streamFlowApi.experiment.v1ExperimentVariableUpdate(request);
    return res.data;
  },
});

const $pending = addMutation.$pending;
const success = addMutation.finished.success;
const updateVariable = createEvent<UpdateRequest>();

sample({
  clock: updateVariable,
  target: addMutation.start,
});

notifications.attach(addMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Variable updated',
    };
  },
});

export { success, $pending, updateVariable };
