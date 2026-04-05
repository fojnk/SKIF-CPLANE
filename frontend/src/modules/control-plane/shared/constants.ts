import { DatasetType, LogAction } from '@/modules/control-plane/shared/types';

export const LogActionsMonaco: LogAction[] = [
  LogAction.Update,
  LogAction.NewVariable,
  LogAction.UpdateVariable,
];

export const DATA_SOURCE_TYPE_OPTIONS = [
  {
    value: DatasetType.JSON,
    content: 'JSON',
  },
  {
    value: DatasetType.KAFKA,
    content: 'Kafka',
  },
];
