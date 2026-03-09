import { DatasetType, LogAction } from '@/modules/stream-flow/shared/types';

export const LogActionsMonaco: LogAction[] = [
  LogAction.Update,
  LogAction.NewVariable,
  LogAction.UpdateVariable,
];

export const DATA_SOURCE_TYPE_OPTIONS = [
  {
    value: DatasetType.QUEUE,
    content: DatasetType.QUEUE,
  },
  {
    value: DatasetType.KAFKA,
    content: DatasetType.KAFKA,
  },
  {
    value: DatasetType.KEY_VALUE,
    content: DatasetType.KEY_VALUE,
  },
  {
    value: DatasetType.STATIC_TABLE_DIR,
    content: DatasetType.STATIC_TABLE_DIR,
  },
];
