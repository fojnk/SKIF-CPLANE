import { IconProps } from '@gravity-ui/uikit';
import { Store } from 'effector';
import { noop } from 'lodash-es';

import { ServiceIcon } from '@/shared/ui/service-icon';

type LayoutMenuItem = {
  icon: IconProps['data'];
  title: string;
  $active: Store<boolean>;
  $visible: Store<boolean>;
  onClick: VoidFunction;
};

const dbaasMenuItems: LayoutMenuItem[] = [];

export const menuItems: LayoutMenuItem[] = [...dbaasMenuItems];

export const logo = {
  icon: ServiceIcon.ControlPlaneLogo,
  text: 'Control Plane',
  onClick: noop,
};
