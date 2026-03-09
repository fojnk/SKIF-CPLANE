import { createEffect } from 'effector';

import { initMyTracker } from './init-my-tracker';
import { pageViewMyTracker } from './page-view-my-tracker';
import {
  setUserMyTracker,
  setUserWithPageMyTracker,
} from './set-user-my-tracker';

export const initMyTrackerFx = createEffect(() => {
  initMyTracker();
});

export const setUserMyTrackerFx = createEffect(
  ({ username }: { username: string }) => {
    if (username) {
      setUserMyTracker(username);
    }
  },
);

export const setUserWithPageViewMyTrackerFx = createEffect(
  ({
    username,
    counter,
  }: {
    username: string | undefined;
    counter: number;
  }) => {
    if (username) {
      setUserWithPageMyTracker(username, counter);
    }
  },
);

export const pageViewMyTrackerFx = createEffect(() => {
  pageViewMyTracker(3711128);
});
