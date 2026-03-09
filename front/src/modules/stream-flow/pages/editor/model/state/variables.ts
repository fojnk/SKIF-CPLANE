import { ExperimentVariablesModel } from '@/modules/stream-flow/entities/variables/list';

const { load, reset, $data, $loading, $failed } = ExperimentVariablesModel.list;

export { load, reset, $data, $loading, $failed };
