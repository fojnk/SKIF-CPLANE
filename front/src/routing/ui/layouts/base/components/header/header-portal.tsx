import { useUnit } from 'effector-react';
import { ReactNode } from 'react';

import { Portal } from '@/shared/ui/portal';

import { headerElement } from './header';

export const HeaderPortal = ({ children }: { children: ReactNode }) => {
  const element = useUnit(headerElement.$value);

  return <Portal element={element}>{children}</Portal>;
};
