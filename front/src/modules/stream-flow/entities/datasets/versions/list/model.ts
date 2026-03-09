import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import {
  ControlPlaneError,
  DsVersionDC,
} from '@/modules/stream-flow/shared/types';
import { createControlPlaneError } from '@/modules/stream-flow/shared/utils/getErrors';

import { VersionsQuery } from './types';

export function create() {
  const dataQuery = createQuery({
    async handler(query: VersionsQuery) {
      const response = await streamFlowApi.dataset.v2DatasetVersionsList({
        ...query,
        from: query.limit * (query.page - 1),
      });
      return response.data;
    },
  });

  const reset = createEvent();
  const add = createEvent<DsVersionDC>();
  const update = createEvent<DsVersionDC>();
  const setComment = createEvent<{ id: number; comment: string }>();
  const remove = createEvent<number>();
  const success = dataQuery.finished.success;
  const $data = createStore<DsVersionDC[] | null>(null).reset(reset);
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const reload = createEvent();
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);
  const setQuery = createEvent<VersionsQuery>();
  const $query = createStore<VersionsQuery | null>(null).reset(reset);
  const $total = createStore<number>(0).reset(reset);

  sample({
    clock: reload,
    source: $query,
    filter: Boolean,
    target: dataQuery.start,
  });

  sample({
    clock: setQuery,
    target: [$query, dataQuery.start],
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      if (result && result.versions && result.versions.length > 0) {
        return result.versions;
      }
      return [];
    },
    target: $data,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      return result?.total ?? 0;
    },
    target: $total,
  });

  // Обработчик для добавления элемента
  sample({
    clock: add,
    source: $data,
    fn: (data, newItem) => {
      if (data) {
        return [newItem, ...data];
      }
      return [newItem];
    },
    target: $data,
  });

  // Обработчик для обновления элемента
  sample({
    clock: update,
    source: $data,
    fn: (data, updatedItem) => {
      if (data) {
        return data.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        );
      }
      return [];
    },
    target: $data,
  });
  sample({
    clock: setComment,
    source: $data,
    fn: (data, updatedItem) => {
      if (data) {
        return data.map((item) =>
          item.id === updatedItem.id
            ? {
                ...item,
                comment: updatedItem.comment,
              }
            : item,
        );
      }
      return [];
    },
    target: $data,
  });

  // Обработчик для удаления элемента
  sample({
    clock: remove,
    source: $data,
    fn: (data, id) => {
      if (data) {
        return data.filter((item) => item.id !== id);
      }
      return [];
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
    reload,
    reset,
    add,
    update,
    remove,
    success,
    $error,
    $query,
    $total,
    setQuery,
    setComment,
  };
}
