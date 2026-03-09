import { createQuery } from '@farfetched/core';
import { createEvent, createEffect, sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { userModel } from '@/modules/stream-flow/entities/session/user';
import { logoutModel } from '@/modules/stream-flow/features/logout';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { SESSION_REDIRECT_KEY } from '@/modules/stream-flow/shared/auth-constants';

export const refresh = createEvent();
const dataQuery = createQuery({
  async handler() {
    const response = await streamFlowApi.oauth.refreshList();
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
  await SFModule.routes.login.navigate({
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
