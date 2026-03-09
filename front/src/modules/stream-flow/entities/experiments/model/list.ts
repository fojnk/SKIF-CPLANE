import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ControlPlaneError } from '@/modules/stream-flow/shared/types';
import { createControlPlaneError } from '@/modules/stream-flow/shared/utils/getErrors';

type ExperimentType = streamFlowApi.dc.DtoCompleteExperimentListDC;

function filterData(
  data: ExperimentType[] | null,
  query: string,
): ExperimentType[] | null {
  if (!query.trim() || !data) return data;

  const normalizedQuery = query.toLowerCase().trim();
  return data.filter((item) =>
    item.name?.toLowerCase().includes(normalizedQuery),
  );
}

export function create() {
  const dataQuery = createQuery({
    async handler(project_id: number) {
      const response = await streamFlowApi.experiment.v1ExperimentsList({
        project_id,
      });
      return response.data;
    },
  });
  const load = createEvent<number>();
  const refresh = createEvent();
  const reset = createEvent();
  const add = createEvent<ExperimentType>();
  const update = createEvent<ExperimentType>();
  const remove = createEvent<number>();
  const $data = createStore<ExperimentType[] | null>(null).reset(reset);
  const $filteredData = createStore<ExperimentType[] | null>(null).reset(reset);
  const $projectId = createStore<number | null>(null).reset(reset);
  const $error = createStore<ControlPlaneError | null>(null).reset(reset);
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const success = dataQuery.finished.success;
  const $searchQuery = createStore<string>('').reset(reset);
  const searchQueryChanged = createEvent<string>();

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
      if (result && result.experiments && result.experiments.length > 0) {
        return result.experiments;
      }
      return [];
    },
    target: $data,
  });

  sample({
    clock: dataQuery.finished.failure,
    target: reset,
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
    clock: searchQueryChanged,
    target: $searchQuery,
  });

  sample({
    clock: [success, add, update, remove, searchQueryChanged],
    source: {
      data: $data,
      query: $searchQuery,
    },
    fn: ({ data, query }) => filterData(data, query),
    target: $filteredData,
  });

  return {
    $data,
    $loading,
    $failed,
    $error,
    load,
    reset,
    add,
    update,
    remove,
    success,
    refresh,
    $filteredData,
    searchQueryChanged,
    $searchQuery,
  };
}
