import { createMutation } from '@farfetched/core';
import { createEvent, sample } from 'effector';

import { navigationModel } from '@/modules/control-plane/features/navigation';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register({
  view: async () => (await import('../ui')).Modal,
});
const addMutation = createMutation({
  async handler(name: string) {
    const response = await controlPlaneApi.namespace.v1NamespaceCreate({ name });
    return response.data;
  },
});
const $pending = addMutation.$pending;
const success = addMutation.finished.success;
const start = createEvent();
const onSubmit = createEvent<string>();

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: onSubmit,
  target: addMutation.start,
});

sample({
  clock: success,
  target: modal.close,
});

sample({
  clock: success,
  fn: ({ result, params }) => {
    return { id: result.id!, name: params };
  },
  target: navigationModel.namespace.navigate,
});

export { start, onSubmit, $pending, success };
