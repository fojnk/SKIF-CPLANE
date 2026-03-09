import { sample } from 'effector';

import { dsVersionsListModel } from '@/modules/stream-flow/entities/datasets/versions/list';
import { SetVersionCommentModel } from '@/modules/stream-flow/features/dataset/version/comment/set-comment';

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
} = dsVersionsListModel.create();

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
