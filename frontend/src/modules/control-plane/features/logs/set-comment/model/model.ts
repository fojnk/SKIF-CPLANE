import { createEvent, sample } from 'effector';

import { LogsListModel } from '@/modules/control-plane/entities/logs/list';
import { UpdateCommentModel } from '@/modules/control-plane/features/log/update';
import { SetCommentPayload } from '@/modules/control-plane/features/logs/set-comment';
import { modalsModel } from '@/shared/ui/modals';

const { $pending, updateComment, updated } = UpdateCommentModel.create();

const modal = modalsModel.register({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<SetCommentPayload>();

sample({
  clock: start,
  target: modal.open,
});

sample({
  clock: updated,
  target: modal.close,
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

export { start, updateComment, $pending };
