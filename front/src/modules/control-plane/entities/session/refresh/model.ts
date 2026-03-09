import { createQuery } from '@farfetched/core';
import { createEvent, createEffect, sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { userModel } from '@/modules/control-plane/entities/session/user';
import { logoutModel } from '@/modules/control-plane/features/logout';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { SESSION_REDIRECT_KEY } from '@/modules/control-plane/shared/auth-constants';

export const refresh = createEvent();
const dataQuery = createQuery({
  async handler() {
    const response = await controlPlaneApi.oauth.refreshList();
    return response.data;
  },
});
const onRefreshSuccessFx = createEffect(() => {
  // Keep the current SPA state and re-check auth data without full page reload.
  userModel.fetchCurrentUser();
});

const refreshFailedFx = createEffect(async () => {
  sessionStorage.setItem(SESSION_REDIRECT_KEY, window.location.href);
  logoutModel.logoutMutation.start();
  userModel.reset();
  await ControlPlaneModule.routes.login.navigate({
    params: {},
    query: { auto: '1' },
    replace: true,
  });
});

sample({
  clock: refresh,
  source: dataQuery.$pending,
  filter: (pending) => !pending,
  target: dataQuery.start,
});

sample({
  clock: dataQuery.finished.success,
  target: onRefreshSuccessFx,
});

sample({
  clock: dataQuery.finished.failure,
  target: refreshFailedFx,
});
