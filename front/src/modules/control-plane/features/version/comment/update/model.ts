import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { notifications } from '@/shared/ui/notifications';

interface UpdateRequest {
  id: number;
  comment?: string;
}
export function create() {
  const addMutation = createMutation({
    async handler(request: UpdateRequest) {
      const res =
        await controlPlaneApi.experiment.v2ExperimentVersionUpdate(request);
      return res.data;
    },
  });
  const $pending = addMutation.$pending;
  const updated = addMutation.finished.success;
  const updateComment = createEvent<UpdateRequest>();

  sample({
    clock: updateComment,
    target: addMutation.start,
  });

  notifications.attach(addMutation, {
    success: () => {
      return {
        type: 'success',
        title: 'Comment updated',
      };
    },
  });

  return {
    updated,
    $pending,
    updateComment,
  };
}
