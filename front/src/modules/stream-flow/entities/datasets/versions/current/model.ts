import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ControlPlaneError } from '@/modules/stream-flow/shared/types';
import { createControlPlaneError } from '@/modules/stream-flow/shared/utils/getErrors';

export function create() {
  const dataQuery = createQuery({
    async handler(dataset_id: number) {
      const response = await streamFlowApi.dataset.v2DatasetVersionCurrentList({
        dataset_id,
      });
      return response.data;
    },
  });
  const reset = createEvent();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const success = dataQuery.finished.success;
  const load = createEvent<number | null>();
  const reload = createEvent();
  const $id = createStore<number | null>(null).reset(reset);
  const $data = createStore<number | null>(null).reset(reset);
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);

  sample({
    clock: load,
    filter: Boolean,
    target: [dataQuery.start, $id],
  });

  sample({
    clock: reload,
    source: $id,
    filter: Boolean,
    target: dataQuery.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      if (result && result.version_id) {
        return result.version_id;
      }
      return null;
    },
    target: $data,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  sample({
    clock: dataQuery.finished.failure,
    fn: ({ error }: any) => createControlPlaneError(error),
    target: $error,
  });

  sample({
    clock: dataQuery.finished.success,
    fn: () => null,
    target: $error,
  });

  return {
    $data,
    success,
    $loading,
    $failed,
    load,
    reload,
    reset,
    $error,
  };
}
