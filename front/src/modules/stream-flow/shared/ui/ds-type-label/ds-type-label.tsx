import { Label } from '@gravity-ui/uikit';

import { DatasetType } from '@/modules/stream-flow/shared/types';

interface Props {
  type?: DatasetType | string | null;
  size?: 'xs' | 's' | 'm';
  showValue?: boolean;
}

export const DatasetTypeLabel = ({
  type,
  size = 'xs',
  showValue = true,
}: Props) => {
  if (type && type !== '') {
    let theme: 'info' | 'utility' | 'warning' | 'danger' | 'normal' = 'danger';

    switch (type) {
      case DatasetType.QUEUE:
        theme = 'info';
        break;
      case DatasetType.KEY_VALUE:
        theme = 'utility';
        break;
      case DatasetType.STATIC_TABLE_DIR:
        theme = 'warning';
        break;
      case DatasetType.KAFKA:
        theme = 'normal';
        break;
      default:
        theme = 'danger';
    }
    return showValue ? (
      <Label size={size} value={type} theme={theme}>
        type
      </Label>
    ) : (
      <Label size={size} theme={theme}>
        {type}
      </Label>
    );
  }
  return showValue ? (
    <Label size={size} value="unknown" theme="danger">
      {showValue && 'type'}
    </Label>
  ) : (
    <Label size={size} theme="danger">
      unknown
    </Label>
  );
};
