import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { ProjectDeletePayload } from '@/modules/control-plane/features/project/delete';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

const modal = modalsModel.register<ProjectDeletePayload>({
  view: async () => (await import('../ui')).Modal,
});
const deleteMutation = createMutation({
  async handler(id: number) {
    const response = await controlPlaneApi.project.v1ProjectDelete({ id });
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
  target: ControlPlaneModule.routes.root.navigate.prepend(() => {
    return {
      replace: false,
      params: {},
      query: {},
    };
  }),
});

export { start, success, deleteProject, $pending };
