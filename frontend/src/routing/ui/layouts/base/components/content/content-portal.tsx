import { useUnit } from 'effector-react';
import { ReactNode } from 'react';

import { Portal } from '@/shared/ui/portal';

import { contentElement } from './content';

export const ContentPortal = ({ children }: { children: ReactNode }) => {
  const element = useUnit(contentElement.$value);

  return <Portal element={element}>{children}</Portal>;
};
