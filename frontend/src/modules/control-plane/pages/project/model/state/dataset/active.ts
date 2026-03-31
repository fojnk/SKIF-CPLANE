import { dataSourceDataModel } from '@/modules/control-plane/entities/datasets/single-ds';

const { load, $loading, $failed, reset, $data, $error, $rights, updateData } =
  dataSourceDataModel.create();

export { load, $loading, $failed, reset, $data, $error, $rights, updateData };
