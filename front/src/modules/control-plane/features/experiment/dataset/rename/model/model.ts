import { createMutation } from '@farfetched/core';
import { sample } from 'effector';

import { ExperimentRenameDsPayload } from '@/modules/control-plane/features/experiment/dataset/rename';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { createLocalEvent } from '@/shared/lib/effector/create-local-event';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

type RenameRequest = controlPlaneApi.dc.RequestsUpdateExperimentDatasetRequestDC;

const modal = modalsModel.register<ExperimentRenameDsPayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createLocalEvent<ExperimentRenameDsPayload>((event) => {
  sample({
    clock: event,
    target: modal.open,
  });
});

const updateMutation = createMutation({
  async handler(request: RenameRequest) {
    const response =
      await controlPlaneApi.experiment.v1ExperimentDatasetUpdate(request);
    return response.data;
  },
});

const onSubmit = createLocalEvent<RenameRequest>((event) => {
  sample({
    clock: event,
    target: updateMutation.start,
  });
});

const $pending = updateMutation.$pending;
const success = updateMutation.finished.success;

sample({
  clock: success,
  target: modal.close,
});

notifications.attach(updateMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Alias updated',
    };
  },
});

export { start, onSubmit, $pending, success };
