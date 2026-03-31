import { sample } from 'effector';
import { createBrowserHistory } from 'history';

import { embeddedModel } from '@/shared/lib/complex/embedded';
import { createValueModel } from '@/shared/lib/effector/value-model';

import { router } from '../router';

const initialized = createValueModel(false, { type: 'switch' });

export const $initialized = initialized.$on;

export const initialize = initialized.turnOn;

const history = createBrowserHistory();

sample({
  clock: initialize,
  target: router.setHistory.prepend(() => history),
});

history.listen((data) => {
  embeddedModel.onDebouncedMessageSend(
    data.location.pathname + data.location.search,
  );
});
