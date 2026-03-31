import { ExperimentVariableItem } from '@/modules/control-plane/shared/types';

export interface VariableShowListPayload {
  experiment_id: number;
  experiment_name?: string;
  variables?: ExperimentVariableItem[];
}
