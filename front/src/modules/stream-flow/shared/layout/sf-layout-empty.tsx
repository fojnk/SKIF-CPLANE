import React, { ReactNode } from 'react';

import {
  SFLayoutContent,
  SFLayoutMain,
} from '@/modules/stream-flow/shared/layout';
interface Props {
  children?: ReactNode;
}

export const SFLayoutEmpty = ({ children }: Props) => {
  return (
    <SFLayoutContent>
      <SFLayoutMain>{children}</SFLayoutMain>
    </SFLayoutContent>
  );
};
