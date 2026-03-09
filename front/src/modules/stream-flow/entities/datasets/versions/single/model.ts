import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import {
  DsVersionInfoDC,
  ControlPlaneError,
} from '@/modules/stream-flow/shared/types';
import { createControlPlaneError } from '@/modules/stream-flow/shared/utils/getErrors';

export function create() {
  const dataQuery = createQuery({
    async handler(version_id: number) {
      const response = await streamFlowApi.dataset.v2DatasetVersionList({
        version_id,
      });
      return response.data;
    },
  });
  const reset = createEvent();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const success = dataQuery.finished.success;
  const load = createEvent<number>();
  const $data = createStore<DsVersionInfoDC | null>(null).reset(reset);
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);
  const $version = createStore<number | null>(null).reset(reset);
  const reload = createEvent();

  sample({
    clock: load,
    filter: Boolean,
    target: [dataQuery.start, $version],
  });

  sample({
    clock: reload,
    source: $version,
    filter: Boolean,
    target: dataQuery.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      if (result) {
        return result;
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
    reset,
    $error,
    reload,
  };
}
