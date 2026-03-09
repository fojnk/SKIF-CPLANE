import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { LogsListModel } from '@/modules/stream-flow/entities/logs/list';
import { UpdateCommentModel } from '@/modules/stream-flow/features/log/update';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { LogDataDC } from '@/modules/stream-flow/shared/types';
import { modalsModel } from '@/shared/ui/modals';

type LogResult = streamFlowApi.dc.ResponsesGetProjectLogResponseDC;
const { $pending, updateComment, updated } = UpdateCommentModel.create();

const modal = modalsModel.register({
  view: async () => (await import('./ui')).Modal,
});

const logQuery = createQuery({
  async handler(log_id: number) {
    const res = await streamFlowApi.project.v1ProjectLogList({ log_id });
    return res.data;
  },
});

const start = createEvent<LogDataDC>();
const load = createEvent<number>();
const reset = createEvent();
const $loading = logQuery.$pending;
const $failed = logQuery.$failed;
const setComment = createEvent<string>();
const $data = createStore<LogResult | null>(null).reset(reset);
$data.on(setComment, (state, comment) =>
  state ? { ...state, comment } : state,
);

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: logQuery.finished.success,
  fn: ({ result }) => {
    return result
      ? {
          ...result,
          comment: result.comment ?? '',
        }
      : null;
  },
  target: $data,
});

sample({
  clock: load,
  target: logQuery.start,
});

sample({
  clock: reset,
  target: logQuery.reset,
});

sample({
  clock: updated,
  fn: ({ params }) => {
    return params.new_comment ?? '';
  },
  target: setComment,
});

sample({
  clock: updated,
  fn: ({ params }) => {
    return {
      id: params.log_id,
      comment: params.new_comment,
    };
  },
  target: LogsListModel.setComment,
});

export {
  start,
  load,
  reset,
  $loading,
  $failed,
  $data,
  $pending,
  updateComment,
};
