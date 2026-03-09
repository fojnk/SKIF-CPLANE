import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';
import { not } from 'patronum';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ControlPlaneUser } from '@/modules/stream-flow/shared/types';

const whoQuery = createQuery({
  async handler() {
    const response = await streamFlowApi.user.v1WhoAmIList();
    return response.data;
  },
});

const load = createEvent();
const reset = createEvent();
const $data = createStore<ControlPlaneUser | null>(null).reset(reset);
const $loading = whoQuery.$pending;
const $failed = whoQuery.$failed;

sample({
  clock: load,
  filter: not(whoQuery.$pending),
  target: whoQuery.start,
});

sample({
  clock: reset,
  target: whoQuery.reset,
});

sample({
  clock: whoQuery.finished.success,
  fn: ({ result }) => {
    return result && result.id && result.name
      ? {
          id: result.id,
          name: result.name,
        }
      : null;
  },
  target: $data,
});

export { $data, $loading, $failed, load, reset };
