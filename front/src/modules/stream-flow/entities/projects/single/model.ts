import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import {
  ControlPlaneError,
  ProjectInfoDC,
} from '@/modules/stream-flow/shared/types';
import { createControlPlaneError } from '@/modules/stream-flow/shared/utils/getErrors';

export function create() {
  const dataQuery = createQuery({
    async handler(project_id: number) {
      const response = await streamFlowApi.project.v2ProjectList({
        project_id,
      });
      return response.data;
    },
  });
  const reset = createEvent();
  const pin = createEvent();
  const unpin = createEvent();
  const updateData = createEvent<Partial<ProjectInfoDC>>();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const success = dataQuery.finished.success;
  const load = createEvent<number | null>();
  const reload = createEvent<number>();
  const $data = createStore<ProjectInfoDC | null>(null).reset(reset);
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);

  sample({
    clock: load,
    filter: (value): value is number => value !== null,
    target: dataQuery.start,
  });

  sample({
    clock: reload,
    target: dataQuery.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      return result;
    },
    target: $data,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  // Обработчик для обновления данных
  sample({
    clock: updateData,
    source: $data,
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
    clock: pin,
    source: $data,
    fn: (currentData) => {
      if (currentData) {
        return {
          ...currentData,
          is_pinned: true,
        };
      }
      return currentData;
    },
    target: $data,
  });

  sample({
    clock: unpin,
    source: $data,
    fn: (currentData) => {
      if (currentData) {
        return {
          ...currentData,
          is_pinned: false,
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
    success,
    $loading,
    $failed,
    load,
    reload,
    reset,
    $error,
    updateData,
    pin,
    unpin,
  };
}
