import cx from 'clsx';
import { SVGAttributes } from 'react';

import { ColorizedLogo } from '../assets';

type LogoProps = SVGAttributes<SVGSVGElement>;

export const Logo = ({ className, ...props }: LogoProps) => {
  return <ColorizedLogo {...props} className={cx(className)} />;
};
