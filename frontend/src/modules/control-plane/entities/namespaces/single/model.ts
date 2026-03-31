import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import {
  NamespaceInfoDC,
  ControlPlaneError,
} from '@/modules/control-plane/shared/types';
import { createControlPlaneError } from '@/modules/control-plane/shared/utils/getErrors';

export function create() {
  const dataQuery = createQuery({
    async handler(namespace_id: number) {
      const response = await controlPlaneApi.namespace.v1NamespaceList({
        namespace_id,
      });
      return response.data;
    },
  });
  const load = createEvent<number | null>();
  const reset = createEvent();
  const updateData = createEvent<NamespaceInfoDC | null>();
  const $data = createStore<NamespaceInfoDC | null>(null).reset(reset);
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);
  const success = dataQuery.finished.success;
  sample({
    clock: load,
    filter: (value): value is number => value !== null,
    target: dataQuery.start,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  sample({
    clock: dataQuery.finished.success,
    fn: ({ result }) => {
      return result ?? null;
    },
    target: $data,
  });

  // Обработчик для обновления данных
  sample({
    clock: updateData,
    source: $data,
    filter: Boolean,
    fn: (currentData, updates) => {
      if (currentData) {
        return {
          ...currentData,
          ...updates,
        };
      }
      return currentData;
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
    updateData,
    success,
  };
}
