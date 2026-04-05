import { createEffect } from 'effector';

import * as controlPlaneApi from '@/modules/control-plane/api/api';
import { ControlPlaneModule } from '@/modules/control-plane/config';
import { userModel } from '@/modules/control-plane/entities/session/user';
import { navigationModel } from '@/modules/control-plane/features/navigation';

import { SESSION_REDIRECT_KEY } from '../../shared/auth-constants';

export const view = ControlPlaneModule.routes.register.view;

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  displayName: string;
};

export const registerPageFx = createEffect(async (values: RegisterFormValues) => {
  const body: controlPlaneApi.RegisterBody = {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
  };
  const dn = values.displayName.trim();
  if (dn) {
    body.display_name = dn;
  }

  await controlPlaneApi.registerFx(body);
  const redirectUrl = sessionStorage.getItem(SESSION_REDIRECT_KEY);
  userModel.fetchCurrentUser();
  if (redirectUrl) {
    sessionStorage.removeItem(SESSION_REDIRECT_KEY);
    window.location.replace(redirectUrl);
  } else {
    navigationModel.projects.navigate();
  }
});
