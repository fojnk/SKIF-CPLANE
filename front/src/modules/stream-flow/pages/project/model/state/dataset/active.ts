import { dataSourceDataModel } from '@/modules/stream-flow/entities/datasets/single-ds';

const { load, $loading, $failed, reset, $data, $error, $rights, updateData } =
  dataSourceDataModel.create();

export { load, $loading, $failed, reset, $data, $error, $rights, updateData };
