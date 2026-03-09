import { createQuery } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { JobModalProps } from '@/modules/stream-flow/features/jobs/modals/job/types';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register({
  view: async () => (await import('./ui')).Modal,
});

const projectJob = createQuery({
  async handler(job_id: number) {
    const res = await streamFlowApi.jobs.v1JobList({ job_id });
    return res.data;
  },
});

const start = createEvent<JobModalProps>();
const load = createEvent<number>();
const reset = projectJob.reset;
const $loading = projectJob.$pending;
const $failed = projectJob.$failed;
const $data = projectJob.$data;

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: load,
  target: projectJob.start,
});

export { start, load, reset, $loading, $failed, $data };
