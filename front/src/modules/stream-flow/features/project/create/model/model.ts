import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { namespacesModel } from '@/modules/stream-flow/entities/namespaces/list';
import { navigationModel } from '@/modules/stream-flow/features/navigation';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { modalsModel } from '@/shared/ui/modals';

type CreateProjectRequest = streamFlowApi.dc.RequestsCreateProjectRequestDC;

const { load, $loading, $error, reset, $data } = namespacesModel.create();

const modal = modalsModel.register({
  view: async () => (await import('../ui')).Modal,
});
const projectMutation = createMutation({
  async handler(request: CreateProjectRequest) {
    const response = await streamFlowApi.project.v1ProjectCreate(request);
    return response.data;
  },
});
const start = createEvent();
const $pending = projectMutation.$pending;
const success = projectMutation.finished.success;
const createProject = createEvent<CreateProjectRequest>();

sample({
  clock: start,
  target: [modal.open, load],
});

sample({
  clock: success,
  target: modal.close,
});

sample({
  clock: createProject,
  target: projectMutation.start,
});

sample({
  clock: success,
  fn: ({ result, params }) => {
    return { id: result.id!, name: params.name };
  },
  target: navigationModel.project.navigate,
});

export {
  start,
  createProject,
  $pending,
  success,
  load,
  $loading,
  $error,
  reset,
  $data,
};
