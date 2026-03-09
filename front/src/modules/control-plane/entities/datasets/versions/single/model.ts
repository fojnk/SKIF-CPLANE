import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import {
  DsVersionInfoDC,
  ControlPlaneError,
} from '@/modules/control-plane/shared/types';
import { createControlPlaneError } from '@/modules/control-plane/shared/utils/getErrors';

export function create() {
  const dataQuery = createQuery({
    async handler(version_id: number) {
      const response = await controlPlaneApi.dataset.v2DatasetVersionList({
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
