import { createEffect } from 'effector';

import * as streamFlowApi from '@/modules/stream-flow/api/api';
import { SFModule } from '@/modules/stream-flow/config';
import { userModel } from '@/modules/stream-flow/entities/session/user';
import { navigationModel } from '@/modules/stream-flow/features/navigation';

import { SESSION_REDIRECT_KEY } from '../../shared/auth-constants';

export const view = SFModule.routes.login.view;

export const loginFx = createEffect(
  async ({ username, password }: { username: string; password: string }) => {
    await streamFlowApi.loginFx({ username, password });
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
