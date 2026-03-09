import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { notifications } from '@/shared/ui/notifications';

type UpdateRequest = streamFlowApi.dc.RequestsUpdateProjectRequestDC;

const updateMutation = createMutation({
  async handler(request: UpdateRequest) {
    const response = await streamFlowApi.project.v1ProjectUpdate(request);
    return response.data;
  },
});
const updateProject = createEvent<UpdateRequest>();
const $pending = updateMutation.$pending;
const success = updateMutation.finished.success;
const failure = updateMutation.finished.failure;

sample({
  clock: updateProject,
  target: updateMutation.start,
});

notifications.attach(updateMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Project updated',
    };
  },
});

export { updateProject, $pending, success, failure };
