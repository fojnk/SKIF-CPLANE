import { namespacesModel } from '@/modules/stream-flow/entities/namespaces/list';

export const { $loading, load, $failed, $data, reset } =
  namespacesModel.create();
