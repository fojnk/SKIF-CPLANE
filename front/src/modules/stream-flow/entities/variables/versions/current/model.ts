import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

const listQuery = createQuery({
  async handler(variable_id: number) {
    const response =
      await streamFlowApi.experiment.v2ExperimentVariableVersionCurrentList({
        variable_id,
      });
    return response.data;
  },
});

const load = createEvent<number>();
const reset = createEvent();
const $id = createStore<number | null>(null).reset(reset);
const $loading = listQuery.$pending;
const $failed = listQuery.$failed;

sample({
  clock: load,
  target: listQuery.start,
});

sample({
  clock: reset,
  target: listQuery.reset,
});

sample({
  clock: listQuery.finished.success,
  fn: ({ result }) => {
    return result && result.version_id ? result.version_id : null;
  },
  target: $id,
});

export { $id, $loading, $failed, load, reset };
