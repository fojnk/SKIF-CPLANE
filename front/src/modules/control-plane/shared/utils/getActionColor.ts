import { LogAction } from '@/modules/control-plane/shared/types';

type SupportedTextColor =
  | 'positive'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary';

const successActions: string[] = [
  LogAction.New,
  LogAction.DatasetAdd,
  LogAction.NewVariable,
];

const warningActions: string[] = [
  LogAction.Update,
  LogAction.UpdateDatasetLink,
  LogAction.UpdateVariable,
];

const dangerActions: string[] = [
  LogAction.Delete,
  LogAction.DatasetDelete,
  LogAction.StopExperiment,
  LogAction.DeleteVariable,
];

const infoActions: string[] = [
  LogAction.StartExperiment,
  LogAction.ApplyExperiment,
];

export const getActionColor = (action: string): SupportedTextColor => {
  const normalized = String(action || '').toLowerCase();

  if (successActions.includes(normalized)) return 'positive';
  if (warningActions.includes(normalized)) return 'warning';
  if (dangerActions.includes(normalized)) return 'danger';
  if (infoActions.includes(normalized)) return 'info';

  return 'primary';
};
