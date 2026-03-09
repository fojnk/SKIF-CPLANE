import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';

type NodeDC = streamFlowApi.dc.PrivateGraphNodeDC;

export function create() {
  const dataQuery = createQuery({
    async handler(project_id: number) {
      const response = await streamFlowApi.experiment.v1GraphList({
        project_id,
      });
      return response.data;
    },
  });
  const load = createEvent<number>();
  const reset = createEvent();
  const $loading = dataQuery.$pending;
  const $failed = dataQuery.$failed;
  const $data = createStore<NodeDC[] | null>(null).reset(reset);

  sample({
    clock: load,
    target: dataQuery.start,
  });

  sample({
    clock: reset,
    target: dataQuery.reset,
  });

  sample({
    clock: dataQuery.finished.failure,
    target: reset,
  });

  sample({
    clock: dataQuery.finished.success,
    fn: ({ result }) => {
      if (result && result.graph && result.graph.nodes) {
        return result.graph.nodes;
      }
      return [];
    },
    target: $data,
  });

  return {
    $data,
    $loading,
    $failed,
    load,
    reset,
  };
}
