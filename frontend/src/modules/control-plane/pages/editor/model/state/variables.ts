import { ExperimentVariablesModel } from '@/modules/control-plane/entities/variables/list';

const { load, reset, $data, $loading, $failed } = ExperimentVariablesModel.list;

export { load, reset, $data, $loading, $failed };
