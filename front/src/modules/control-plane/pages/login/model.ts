import { createEffect } from 'effector';

import * as controlPlaneApi from '@/modules/control-plane/api/api';
import { ControlPlaneModule } from '@/modules/control-plane/config';
import { userModel } from '@/modules/control-plane/entities/session/user';
import { navigationModel } from '@/modules/control-plane/features/navigation';

import { SESSION_REDIRECT_KEY } from '../../shared/auth-constants';

export const view = ControlPlaneModule.routes.login.view;

export const loginFx = createEffect(
  async ({ username, password }: { username: string; password: string }) => {
    await controlPlaneApi.loginFx({ username, password });
    const redirectUrl = sessionStorage.getItem(SESSION_REDIRECT_KEY);
    userModel.fetchCurrentUser();
    if (redirectUrl) {
      sessionStorage.removeItem(SESSION_REDIRECT_KEY);
      window.location.replace(redirectUrl);
    } else {
      navigationModel.projects.navigate();
    }
  },
);

export const autoLoginFx = createEffect(async () => {
  await loginFx({ username: 'root', password: 'root' });
});
