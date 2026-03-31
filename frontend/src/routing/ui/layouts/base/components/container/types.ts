import { AsideHeaderProps } from '@gravity-ui/navigation';
import type { ItemProps } from '@gravity-ui/navigation/build/esm/components/CompositeBar/Item/Item';

export type AsideMenuItem = Exclude<
  AsideHeaderProps['menuItems'],
  undefined
>[number];

export type AsideSubheaderMenuItem = Omit<
  ItemProps,
  'onItemClick' | 'onItemClickCapture'
>;
