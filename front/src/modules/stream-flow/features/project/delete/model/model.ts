import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { ProjectDeletePayload } from '@/modules/stream-flow/features/project/delete';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

const modal = modalsModel.register<ProjectDeletePayload>({
  view: async () => (await import('../ui')).Modal,
});
const deleteMutation = createMutation({
  async handler(id: number) {
    const response = await streamFlowApi.project.v1ProjectDelete({ id });
    return response.data;
  },
});
const start = createEvent<ProjectDeletePayload>();
const $pending = deleteMutation.$pending;
const success = deleteMutation.finished.success;
const deleteProject = createEvent<number>();

sample({
  clock: deleteProject,
  target: deleteMutation.start,
});

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: success,
  target: modal.close,
});

notifications.attach(deleteMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Project removed',
    };
  },
});

sample({
  clock: success,
  target: SFModule.routes.root.navigate.prepend(() => {
    return {
      replace: false,
      params: {},
      query: {},
    };
  }),
});

export { start, success, deleteProject, $pending };
