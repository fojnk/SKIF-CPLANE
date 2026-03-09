import { ExperimentVariableItem } from '@/modules/control-plane/shared/types';

export type VariableType = 'string' | 'int' | 'json' | 'yql' | 'python';

export type VariableVersionMode = 'view' | 'edit' | 'restore' | 'compare';

export interface VariableShowPayload {
  item: ExperimentVariableItem;
  canEdit: boolean;
  mode: VariableVersionMode;
  head: boolean;
}
