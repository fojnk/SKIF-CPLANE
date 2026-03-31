import { DatasetType } from '@/modules/control-plane/shared/types';

export type CreateForm = {
  name: string;
  type: DatasetType;
  is_external: boolean;
};

export type DsCreatePayload = {
  project_id: number;
};
