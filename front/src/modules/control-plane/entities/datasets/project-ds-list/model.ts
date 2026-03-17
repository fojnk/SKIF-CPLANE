import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import {
  DatasetDC,
  ControlPlaneError,
} from '@/modules/control-plane/shared/types';
import { createControlPlaneError } from '@/modules/control-plane/shared/utils/getErrors';

export function create() {
  const dataQuery = createQuery({
    async handler(project_id: number) {
      const response = await controlPlaneApi.dataset.v2DatasetsList({
        project_id,
      });
      return response.data;
    },
  });

  const reset = createEvent();
  const refresh = createEvent();
  const $projectId = createStore<number | null>(null).reset(reset);
  const add = createEvent<DatasetDC>();
  const update = createEvent<DatasetDC>();
  const remove = createEvent<number>();
  const success = dataQuery.finished.success;
  const $data = createStore<DatasetDC[] | null>(null).reset(reset);
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const load = createEvent<number>();
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);

  sample({
    clock: load,
    target: [dataQuery.start, $projectId],
  });

  sample({
    clock: refresh,
    source: $projectId,
    filter: Boolean,
    target: dataQuery.start,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      if (result && result.datasets && result.datasets.length > 0) {
        return result.datasets;
      }
      return [];
    },
    target: $data,
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
    load,
    reset,
    add,
    update,
    remove,
    success,
    $error,
    refresh,
  };
}
