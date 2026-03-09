import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

export const logoutMutation = createMutation({
  async handler() {
    const response = await streamFlowApi.oauth.logoutList();
    return response.data;
  },
});

export const start = createEvent();

sample({
  clock: start,
  target: logoutMutation.start,
});
