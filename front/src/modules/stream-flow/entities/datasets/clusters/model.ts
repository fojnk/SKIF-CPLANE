import { createMutation } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

export function create() {
  const dataPost = createMutation({
    async handler() {
      const response = await streamFlowApi.dataset.v2DatasetsClustersList();
      return response.data;
    },
  });

  const reset = createEvent();
  const success = dataPost.finished.success;
  const $data = createStore<streamFlowApi.dc.DtoClusterDC[] | null>(null).reset(
    reset,
  );
  const $loading = dataPost.$pending;
  const $failed = dataPost.$failed;
  const load = createEvent();
  const $total = createStore<number>(0).reset(reset);

  sample({
    clock: load,
    target: dataPost.start,
  });

  sample({
    clock: reset,
    target: dataPost.reset,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      if (result && result.clusters) {
        return result.clusters;
      }
      return [];
    },
    target: $data,
  });

  return {
    $data,
    $loading,
    $failed,
    load,
    reset,
    success,
    $total,
  };
}
