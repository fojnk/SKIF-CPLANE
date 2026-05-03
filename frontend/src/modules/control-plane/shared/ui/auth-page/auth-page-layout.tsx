import React from 'react';

import { AuthRingParticles } from './auth-ring-particles';

import css from './auth-page.module.scss';

type Props = {
  children: React.ReactNode;
};

export const AuthPageLayout = ({ children }: Props) => (
  <div className={css.shell}>
    <AuthRingParticles />
    <div className={css.content}>
      <div className={css.panel}>{children}</div>
    </div>
  </div>
);
