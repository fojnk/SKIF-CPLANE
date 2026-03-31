import { createEvent, sample } from 'effector';

import { UpdateVersionCommentModel } from '@/modules/control-plane/features/version/comment/update';
import { PipeVersionDC } from '@/modules/control-plane/shared/types';
import { modalsModel } from '@/shared/ui/modals';

const { $pending, updateComment, updated } = UpdateVersionCommentModel.create();

const modal = modalsModel.register({
  view: async () => (await import('./ui')).Modal,
});

const start = createEvent<PipeVersionDC>();

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: updated,
  target: modal.close,
});

export { start, updateComment, $pending, updated };
