import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';

export const logoutMutation = createMutation({
  async handler() {
    const response = await controlPlaneApi.oauth.logoutList();
    return response.data;
  },
});

export const start = createEvent();

sample({
  clock: start,
  target: logoutMutation.start,
});
