import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { createLocalEvent } from '@/shared/lib/effector/create-local-event';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

import { SFVariableCreatePayload } from '../types';

const modal = modalsModel.register<SFVariableCreatePayload>({
  view: async () => (await import('../ui')).Modal,
});

const createExperimentVariableMutation = createMutation({
  async handler(
    request: streamFlowApi.dc.RequestsCreateExperimentVariableRequestDC,
  ) {
    const response =
      await streamFlowApi.experiment.v1ExperimentVariableCreate(request);
    return response.data;
  },
});

const start = createLocalEvent<SFVariableCreatePayload>((event) => {
  sample({
    clock: event,
    target: modal.open,
  });
});

const createExperimentVariable =
  createEvent<streamFlowApi.dc.RequestsCreateExperimentVariableRequestDC>();

sample({
  clock: createExperimentVariable,
  target: createExperimentVariableMutation.start,
});

const $pending = createExperimentVariableMutation.$pending;
const success = createExperimentVariableMutation.finished.success;

sample({
  clock: success,
  target: modal.close,
});

notifications.attach(createExperimentVariableMutation, {
  success: () => ({
    type: 'success',
    title: 'Variable created',
  }),
});

export { start, modal, $pending, success, createExperimentVariable };
