import { namespaceModel } from '@/modules/control-plane/entities/namespaces/single';

export const { load, $loading, $failed, reset, $data, $error, updateData } =
  namespaceModel.create();
