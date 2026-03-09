import { sample } from 'effector';
import { debounce, not } from 'patronum';

import { userModel } from '@/modules/stream-flow/entities/session/user';
import { initMyTrackerFx } from '@/modules/stream-flow/features/app-tracker‎';
import { routingModel } from '@/routing';
import { appStartModel } from '@/shared/lib/complex/app-starter';
import { embeddedModel } from '@/shared/lib/complex/embedded';

appStartModel.blockIf(not(routingModel.$initialized));

sample({
  clock: appStartModel.onAppStart,
  filter: () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('code') === null;
  },
  target: userModel.fetchCurrentUser,
});

debounce({
  source: appStartModel.onAppStart,
  timeout: 0,
  target: routingModel.initialize,
});

sample({
  clock: appStartModel.onAppStart,
  target: embeddedModel.checkEmbeddedFx,
});

sample({
  clock: appStartModel.onAppStarted,
  source: embeddedModel.$isEmbedded,
  filter: (isEmbedded: boolean) => isEmbedded,
  target: embeddedModel.sendRenderedFx,
});

sample({
  clock: appStartModel.onAppStart,
  target: initMyTrackerFx,
});
