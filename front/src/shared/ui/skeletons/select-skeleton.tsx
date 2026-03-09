import { SelectProps, Skeleton } from '@gravity-ui/uikit';

import { toRem } from '@/shared/lib/common/css';

export const SelectSkeleton = ({ size }: Partial<SelectProps>) => {
  return (
    <Skeleton
      className="g-select"
      style={{
        width: toRem(100),
        height: size === 's' ? toRem(24) : toRem(28),
      }}
    />
  );
};
