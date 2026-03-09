import { EntityType, LogDataDC } from '@/modules/stream-flow/shared/types';

export interface SetCommentPayload {
  log: LogDataDC;
  type: EntityType;
}

export interface SetCommentForm {
  comment: string;
}
