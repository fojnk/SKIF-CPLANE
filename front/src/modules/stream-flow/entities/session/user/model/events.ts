import { createEvent, sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import {
  initMyTrackerFx,
  setUserMyTrackerFx,
} from '@/modules/stream-flow/features/app-tracker‎';
import { navigationModel } from '@/modules/stream-flow/features/navigation';

import { currentUserCapabilitiesQuery, currentUserQuery } from './requests';

export const reset = createEvent();

export const fetchCurrentUser = currentUserQuery.start;

export const fetchCurrentUserFailed = currentUserQuery.finished.failure.map(
  (payload) => payload.error,
);

export const fetchCurrentUserSuccess = currentUserQuery.finished.success.map(
  (payload) => payload.result.username,
);

export const fetchCurrentUserSuccessApp = currentUserQuery.finished.success.map(
  (payload) => payload.result.email,
);

sample({
  clock: [currentUserQuery.$succeeded, SFModule.$loaded],
  source: { user: currentUserQuery.$data, active: SFModule.$loaded },
  filter: ({ user, active }) => Boolean(user?.email && active),
  fn: ({ user }) => ({
    username: user?.email,
  }),
  target: initMyTrackerFx,
});

// Если успешно получили данные пользователя и находимся на странице login,
// переходим на страницу projects
sample({
  clock: currentUserQuery.finished.success,
  source: SFModule.routes.login.$isOpened,
  filter: (isLoginOpened) => isLoginOpened,
  target: navigationModel.projects.navigate,
});

sample({
  clock: currentUserQuery.finished.success,
  target: currentUserCapabilitiesQuery.start,
});

sample({
  clock: fetchCurrentUserSuccessApp,
  filter: (user) => Boolean(user),
  fn: (user) => {
    return {
      username: user,
    };
  },
  target: setUserMyTrackerFx,
});
