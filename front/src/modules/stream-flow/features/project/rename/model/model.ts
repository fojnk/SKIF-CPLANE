import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { ProjectRenamePayload } from '@/modules/stream-flow/features/project/rename';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';
type RenameRequest = streamFlowApi.dc.RequestsUpdateProjectRequestDC;

const modal = modalsModel.register<ProjectRenamePayload>({
  view: async () => (await import('../ui')).Modal,
});

const renameMutation = createMutation({
  async handler(request: RenameRequest) {
    const response = await streamFlowApi.project.v1ProjectUpdate(request);
    return response.data;
  },
});
const start = createEvent<ProjectRenamePayload>();
const renameProject = createEvent<RenameRequest>();
const $pending = renameMutation.$pending;
const success = renameMutation.finished.success;

sample({
  clock: renameProject,
  target: renameMutation.start,
});

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: success,
  target: modal.close,
});

notifications.attach(renameMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Project renamed',
    };
  },
});

export { start, renameProject, $pending, success };
