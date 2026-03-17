import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ControlPlaneError } from '@/modules/control-plane/shared/types';
import { createControlPlaneError } from '@/modules/control-plane/shared/utils/getErrors';

export function create() {
  //config_type: experiment, dataset, project
  const dataQuery = createQuery({
    async handler(config_type: string) {
      const response = await controlPlaneApi.schema.v2SchemaList({
        config_type,
      });
      return response.data;
    },
  });
  const load = createEvent<string>();
  const reset = createEvent();
  const $data = createStore<string | null>(null).reset(reset);
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);
  const success = dataQuery.finished.success;

  sample({
    clock: load,
    target: dataQuery.start,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  sample({
    clock: dataQuery.finished.success,
    fn: ({ result }) => {
      return result.config_schema ?? null;
    },
    target: $data,
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
    $loading,
    $failed,
    $error,
    load,
    reset,
    success,
  };
}
