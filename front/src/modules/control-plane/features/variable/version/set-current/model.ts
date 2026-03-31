import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { notifications } from '@/shared/ui/notifications';

type UpdateRequest =
  controlPlaneApi.dc.RequestsUpdateExperimentVariableVersionRequestDC;

const updateMutation = createMutation({
  async handler(request: UpdateRequest) {
    const response =
      await controlPlaneApi.experiment.v2ExperimentVariableVersionCurrentUpdate(
        request,
      );
    return response.data;
  },
});

const success = updateMutation.finished.success;
const $pending = updateMutation.$pending;
const onSetCurrent = createEvent<UpdateRequest>();

sample({
  clock: onSetCurrent,
  target: updateMutation.start,
});

notifications.attach(updateMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Successfully restored',
    };
  },
});

export { onSetCurrent, success, $pending };
