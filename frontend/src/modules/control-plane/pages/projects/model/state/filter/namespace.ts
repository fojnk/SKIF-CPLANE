import { namespacesModel } from '@/modules/control-plane/entities/namespaces/list';

export const { $loading, load, $failed, $data, reset } =
  namespacesModel.create();
