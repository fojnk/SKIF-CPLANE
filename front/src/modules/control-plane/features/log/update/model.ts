import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { LogUpdateRequest } from '@/modules/control-plane/features/log/update';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { notifications } from '@/shared/ui/notifications';

export function create() {
  const addMutation = createMutation({
    async handler(request: LogUpdateRequest) {
      const { type } = request;
      switch (type) {
        case 'namespace': {
          const res =
            await controlPlaneApi.namespace.v1NamespaceLogUpdate(request);
          return res.data;
        }
        case 'dataset': {
          const res = await controlPlaneApi.dataset.v1DatasetLogUpdate(request);
          return res.data;
        }
        case 'project': {
          const res = await controlPlaneApi.project.v1ProjectLogUpdate(request);
          return res.data;
        }
        case 'experiment': {
          const res =
            await controlPlaneApi.experiment.v1ExperimentLogUpdate(request);
          return res.data;
        }
      }
    },
  });
  const $pending = addMutation.$pending;
  const updated = addMutation.finished.success;
  const updateComment = createEvent<LogUpdateRequest>();

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
