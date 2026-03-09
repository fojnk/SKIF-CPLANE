import { namespaceModel } from '@/modules/stream-flow/entities/namespaces/single';

export const { load, $loading, $failed, reset, $data, $error, updateData } =
  namespaceModel.create();
