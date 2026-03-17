import { useUnit } from 'effector-react';
import { ReactNode } from 'react';

import { Portal } from '@/shared/ui/portal';

import { footerElement } from './footer';

export const FooterPortal = ({ children }: { children: ReactNode }) => {
  const element = useUnit(footerElement.$value);

  return <Portal element={element}>{children}</Portal>;
};
