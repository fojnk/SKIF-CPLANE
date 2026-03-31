import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { RenamePayload } from '@/modules/control-plane/features/namespace/rename';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { modalsModel } from '@/shared/ui/modals';
import { notifications } from '@/shared/ui/notifications';

type RenameRequest = controlPlaneApi.dc.RequestsUpdateNamespaceRequestDC;

const renameModal = modalsModel.register<RenamePayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<RenamePayload>();
const submitRename = createEvent<RenameRequest>();

const renameMutation = createMutation({
  async handler(request: RenameRequest) {
    const response = await controlPlaneApi.namespace.v1NamespaceUpdate(request);
    return response.data;
  },
});

const $pending = renameMutation.$pending;
const success = renameMutation.finished.success;

sample({
  clock: start,
  target: renameModal.open,
});

sample({
  clock: submitRename,
  target: renameMutation.start,
});

sample({
  clock: success,
  target: renameModal.close,
});

notifications.attach(renameMutation, {
  success: () => {
    return {
      type: 'success',
      title: 'Workspace renamed',
    };
  },
});

export { start, submitRename, $pending, success, renameModal, renameMutation };
