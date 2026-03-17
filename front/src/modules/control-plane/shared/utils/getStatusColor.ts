import { TextProps } from '@gravity-ui/uikit';

type StatusType = 'UNKNOWN' | 'OK' | 'WARNING' | 'ERROR' | 'PENDING';

const STATUS_MAP_COLOR: Record<StatusType, string> = {
  UNKNOWN: 'secondary',
  OK: 'positive-heavy',
  WARNING: 'warning',
  ERROR: 'danger',
  PENDING: 'info',
};

const STATUS_MAP_BG_CLASS: Record<StatusType, string> = {
  UNKNOWN: 'sf-pipe-unknown',
  OK: 'sf-pipe-ok',
  WARNING: 'sf-pipe-warning',
  ERROR: 'sf-pipe-error',
  PENDING: 'sf-pipe-pending',
};

const STATUS_MAP_NODE_BG: Record<StatusType, string> = {
  UNKNOWN: 'gray',
  OK: 'success',
  WARNING: 'warning',
  ERROR: 'danger',
  PENDING: 'info',
};

export const getPipeStatusColor = (status: string) => {
  const color =
    STATUS_MAP_COLOR[status as StatusType] || STATUS_MAP_COLOR['UNKNOWN'];
  return color as TextProps['color'];
};

export const getPipeStatusBg = (status: string) => {
  return (
    STATUS_MAP_BG_CLASS[status as StatusType] || STATUS_MAP_BG_CLASS['UNKNOWN']
  );
};

export const getNodeStatus = (status: string) => {
  return (
    STATUS_MAP_NODE_BG[status as StatusType] || STATUS_MAP_NODE_BG['UNKNOWN']
  );
};
