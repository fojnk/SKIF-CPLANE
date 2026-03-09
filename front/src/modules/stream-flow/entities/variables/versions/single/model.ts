import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { VariableVersionInfo } from '@/modules/stream-flow/shared/types';

const listQuery = createQuery({
  async handler(version_id: number) {
    const response =
      await streamFlowApi.experiment.v2ExperimentVariableVersionList({
        version_id,
      });
    return response.data;
  },
});

const load = createEvent<number>();
const reset = createEvent();

// Храним данные в виде Record<version_id, VariableVersionInfo>
const $data = createStore<VariableVersionInfo | null>(null).reset(reset);
const $loading = listQuery.$pending;
const $failed = listQuery.$failed;
const success = listQuery.finished.success;

sample({
  clock: load,
  target: listQuery.start,
});

sample({
  clock: reset,
  target: listQuery.reset,
});

sample({
  clock: success,
  fn: ({ result }) => {
    return result ?? null;
  },
  target: $data,
});

export { $data, $loading, $failed, load, reset, success };
