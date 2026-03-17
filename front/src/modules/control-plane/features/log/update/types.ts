import { EntityType } from '@/modules/control-plane/shared/types';

export interface LogUpdateRequest {
  log_id: number;
  new_comment: string;
  type: EntityType;
}
