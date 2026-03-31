import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import {
  NamespaceDC,
  ControlPlaneError,
} from '@/modules/control-plane/shared/types';
import { createControlPlaneError } from '@/modules/control-plane/shared/utils/getErrors';

export function create() {
  const dataQuery = createQuery({
    async handler() {
      const response = await controlPlaneApi.namespace.v1NamespacesList();
      return response.data;
    },
  });
  const reset = createEvent();
  const add = createEvent<NamespaceDC>();
  const update = createEvent<NamespaceDC>();
  const remove = createEvent<number>();
  const $data = createStore<NamespaceDC[] | null>(null).reset(reset);
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);
  const $canCreate = createStore<boolean>(false).reset(reset);
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const load = createEvent();
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
    clock: success,
    fn: ({ result }) => result?.namespaces ?? [],
    target: $data,
  });

  sample({
    clock: dataQuery.finished.failure,
    fn: () => null,
    target: $data,
  });

  sample({
    clock: add,
    source: $data,
    fn: (data, newItem) => (data ? [newItem, ...data] : [newItem]),
    target: $data,
  });

  sample({
    clock: update,
    source: $data,
    fn: (data, updatedItem) =>
      data
        ? data.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        : [],
    target: $data,
  });

  sample({
    clock: remove,
    source: $data,
    fn: (data, id) => {
      return data ? data.filter((item) => item.id !== id) : [];
    },
    target: $data,
  });

  sample({
    clock: dataQuery.finished.success,
    fn: ({ result }) => {
      if (result && result.can_create) {
        return result.can_create;
      }
      return false;
    },
    target: $canCreate,
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
    $loading,
    load,
    $failed,
    $data,
    reset,
    add,
    update,
    remove,
    success,
    $error,
    $canCreate,
  };
}
