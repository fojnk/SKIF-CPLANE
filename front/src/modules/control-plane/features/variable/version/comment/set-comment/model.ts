import { createEvent, sample } from 'effector';

import { VariableVersionsListModel } from '@/modules/control-plane/entities/variables/versions/list';
import { CommentUpdatePayload } from '@/modules/control-plane/features/variable/version/comment/set-comment/types';
import { UpdateVariableCommentModel } from '@/modules/control-plane/features/variable/version/comment/update';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register<CommentUpdatePayload>({
  view: async () => (await import('./ui')).Modal,
});

const start = createEvent<CommentUpdatePayload>();

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: UpdateVariableCommentModel.success,
  target: modal.close,
});

sample({
  clock: UpdateVariableCommentModel.success,
  fn: ({ params }) => ({
    id: params.id,
    comment: params.comment,
  }),
  target: VariableVersionsListModel.updateVersionComment,
});

export { start };
