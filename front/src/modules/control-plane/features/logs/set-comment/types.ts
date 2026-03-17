import { EntityType, LogDataDC } from '@/modules/control-plane/shared/types';

export interface SetCommentPayload {
  log: LogDataDC;
  type: EntityType;
}

export interface SetCommentForm {
  comment: string;
}
