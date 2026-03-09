import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { notifications } from '@/shared/ui/notifications';

const pinMutation = createMutation({
  async handler(project_id: number) {
    const response = await streamFlowApi.project.v2ProjectPinnedDelete({
      project_id,
    });
    return response.data;
  },
});
const start = createEvent<number>();
const $pending = pinMutation.$pending;
const success = pinMutation.finished.success;

sample({
  clock: start,
  target: pinMutation.start,
});

notifications.attach(pinMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Project unpinned',
    };
  },
});

export { start, $pending, success };
