import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { LogDataDC, LogsRequest } from '@/modules/stream-flow/shared/types';

const logsQuery = createQuery({
  async handler(request: LogsRequest) {
    const { id, from, limit, type } = request;
    switch (type) {
      case 'dataset': {
        const res = await streamFlowApi.dataset.v1DatasetLogsList({
          dataset_id: id,
          from,
          limit,
        });
        return res.data;
      }
      case 'namespace': {
        const res = await streamFlowApi.namespace.v1NamespaceLogsList({
          namespace_id: id,
          from,
          limit,
        });
        return res.data;
      }
      case 'project': {
        const res = await streamFlowApi.project.v1ProjectLogsList({
          project_id: id,
          from,
          limit,
        });
        return res.data;
      }
      case 'experiment': {
        const res = await streamFlowApi.experiment.v1ExperimentLogsList({
          experiment_id: id,
          from,
          limit,
        });
        return res.data;
      }
    }
  },
});
const load = createEvent<LogsRequest>();
const reset = createEvent();
const setComment = createEvent<{ id: number; comment: string }>();
const $data = createStore<LogDataDC[] | null>(null)
  .reset(reset)
  .on(setComment, (state, { id, comment }) => {
    if (!state) return state;
    let updated = false;
    const next = state.map((item) => {
      if (item.id === id) {
        updated = true;
        return { ...item, comment };
      }
      return item;
    });
    return updated ? next : state;
  });
const $total = createStore<number>(0).reset(reset);
const $loading = logsQuery.$pending;
const $failed = logsQuery.$failed;

sample({
  clock: load,
  target: logsQuery.start,
});

sample({
  clock: reset,
  target: logsQuery.reset,
});

sample({
  clock: logsQuery.finished.success,
  fn: ({ result }) => {
    const logs =
      (result?.logs as streamFlowApi.dc.DtoExperimentUpdateLogDC) ?? [];
    return Array.isArray(logs)
      ? logs.map((l) => ({
          id: Number(l.id ?? 0),
          act: String(l.act ?? ''),
          created_at: String(l.created_at ?? ''),
          name: String(l.name ?? ''),
          user: String(l.user ?? ''),
          comment: String(l.comment ?? ''),
          job_id: Number(l.job_id ?? 0),
        }))
      : [];
  },
  target: $data,
});

sample({
  clock: logsQuery.finished.success,
  fn: ({ result }) => {
    return result?.total ?? 0;
  },
  target: $total,
});

export { $data, $loading, $failed, load, reset, $total, setComment };
