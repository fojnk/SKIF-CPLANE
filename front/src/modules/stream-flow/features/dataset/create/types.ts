import { DatasetType } from '@/modules/stream-flow/shared/types';

export type CreateForm = {
  name: string;
  type: DatasetType;
  is_external: boolean;
};

export type DsCreatePayload = {
  project_id: number;
};
