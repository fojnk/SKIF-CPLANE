import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { notifications } from '@/shared/ui/notifications';

type UpdateRequest = controlPlaneApi.dc.RequestsUpdateNamespaceRequestDC;

const updateMutation = createMutation({
  async handler(request: UpdateRequest) {
    const response = await controlPlaneApi.namespace.v1NamespaceUpdate(request);
    return response.data;
  },
});
const $pending = updateMutation.$pending;
const success = updateMutation.finished.success;
const updateNamespace = createEvent<UpdateRequest>();
const failure = updateMutation.finished.failure;

sample({
  clock: updateNamespace,
  target: updateMutation.start,
});

notifications.attach(updateMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Workspace updated',
    };
  },
});

export { updateNamespace, $pending, success, failure };
