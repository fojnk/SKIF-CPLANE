import { ExperimentVariableItem } from '@/modules/stream-flow/shared/types';

export interface VariableShowListPayload {
  experiment_id: number;
  experiment_name?: string;
  variables?: ExperimentVariableItem[];
}
