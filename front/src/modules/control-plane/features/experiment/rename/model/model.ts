import { createMutation } from '@farfetched/core';
import { sample } from 'effector';

import { ExperimentRenamePayload } from '@/modules/control-plane/features/experiment/rename';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { createLocalEvent } from '@/shared/lib/effector/create-local-event';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

const modal = modalsModel.register<ExperimentRenamePayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createLocalEvent<ExperimentRenamePayload>((event) => {
  sample({
    clock: event,
    target: modal.open,
  });
});

const updateMutation = createMutation({
  async handler(
    request: controlPlaneApi.dc.RequestsUpdateCompleteExperimentRequestDC,
  ) {
    const response = await controlPlaneApi.experiment.v1ExperimentUpdate(request);
    return response.data;
  },
});

const onSubmit =
  createLocalEvent<controlPlaneApi.dc.RequestsUpdateCompleteExperimentRequestDC>(
    (event) => {
      sample({
        clock: event,
        target: updateMutation.start,
      });
    },
  );

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
      title: 'Experiment renamed',
    };
  },
});

export { start, onSubmit, $pending, success };
