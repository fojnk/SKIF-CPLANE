import { sample } from 'effector';

import { experimentVersionsModel } from '@/modules/control-plane/entities/experiment-versions';
import { SetVersionCommentModel } from '@/modules/control-plane/features/version/comment/set-comment';

export const {
  reload,
  $loading,
  $failed,
  reset,
  $data,
  $total,
  $query,
  $error,
  update,
  setComment,
  setQuery,
} = experimentVersionsModel.list.create();

sample({
  clock: SetVersionCommentModel.updated,
  fn: ({ params }) => {
    return {
      id: params.id,
      comment: params.comment ?? '',
    };
  },
  target: setComment,
});
