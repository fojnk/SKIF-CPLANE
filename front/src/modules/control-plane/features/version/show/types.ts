export type ShowVersionMode = 'view' | 'edit' | 'restore' | 'compare';

export interface ShowVersionPayload {
  version: number;
  created_at: string;
  version_id: number;
  experiment_id: number;
  experiment_name: string;
  mode?: ShowVersionMode;
  head_id: number;
}
