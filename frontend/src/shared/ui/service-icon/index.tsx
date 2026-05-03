import cx from 'clsx';
import { SVGAttributes } from 'react';

import { ControlPlane } from './assets';

type LogoProps = SVGAttributes<SVGSVGElement>;

export const ControlPlaneLogo = ({ className, ...props }: LogoProps) => {
  return <ControlPlane {...props} className={cx(className)} />;
};

export const ServiceIcon = {
  ControlPlaneLogo,
};
