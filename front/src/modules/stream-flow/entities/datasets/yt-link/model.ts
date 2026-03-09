import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

export function create() {
  const dataQuery = createQuery({
    async handler(dataset_id: number) {
      const response = await streamFlowApi.dataset.v2DatasetYtList({
        dataset_id,
      });
      return response.data;
    },
  });
  const load = createEvent<number>();
  const reset = createEvent();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const success = dataQuery.finished.success;
  const $link = createStore<string | null>(null).reset(reset);

  sample({
    clock: load,
    target: dataQuery.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      if (result && result.yt_link && result.yt_link !== '') {
        return result.yt_link;
      }
      return null;
    },
    target: $link,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  return {
    $link,
    $loading,
    $failed,
    load,
    reset,
  };
}
