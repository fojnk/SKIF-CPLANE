import { EntityType } from '@/modules/stream-flow/shared/types';

export interface LogUpdateRequest {
  log_id: number;
  new_comment: string;
  type: EntityType;
}
