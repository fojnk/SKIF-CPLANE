import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

type AliasDC = streamFlowApi.dc.DtoExperimentDatasetDC;

export function create() {
  const dataQuery = createQuery({
    async handler(experiment_id: number) {
      const response = await streamFlowApi.experiment.v1ExperimentDatasetsList({
        experiment_id,
      });
      return response.data;
    },
  });

  const reset = createEvent();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const success = dataQuery.finished.success;
  const add = createEvent<AliasDC>();
  const rename = createEvent<{ link_id: number; alias: string }>();
  const remove = createEvent<number>();
  const load = createEvent<number>();
  const $data = createStore<AliasDC[] | null>(null).reset(reset);

  sample({
    clock: load,
    target: dataQuery.start,
  });

  sample({
    clock: success,
    fn: ({ result }) => {
      if (result && result.datasets) {
        return result.datasets;
      }
      return [];
    },
    target: $data,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
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
    clock: rename,
    source: $data,
    fn: (data, updatedItem) => {
      if (data) {
        return data.map((item) =>
          item.link_id === updatedItem.link_id
            ? {
                ...item,
                alias: updatedItem.alias,
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
    fn: (data, link_id) => {
      if (data) {
        return data.filter((item) => item.link_id !== link_id);
      }
      return [];
    },
    target: $data,
  });

  return {
    $data,
    success,
    $loading,
    $failed,
    load,
    reset,
    add,
    rename,
    remove,
  };
}
