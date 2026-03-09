import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { LogUpdateRequest } from '@/modules/stream-flow/features/log/update';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { notifications } from '@/shared/ui/notifications';

export function create() {
  const addMutation = createMutation({
    async handler(request: LogUpdateRequest) {
      const { type } = request;
      switch (type) {
        case 'namespace': {
          const res =
            await streamFlowApi.namespace.v1NamespaceLogUpdate(request);
          return res.data;
        }
        case 'dataset': {
          const res = await streamFlowApi.dataset.v1DatasetLogUpdate(request);
          return res.data;
        }
        case 'project': {
          const res = await streamFlowApi.project.v1ProjectLogUpdate(request);
          return res.data;
        }
        case 'experiment': {
          const res =
            await streamFlowApi.experiment.v1ExperimentLogUpdate(request);
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
