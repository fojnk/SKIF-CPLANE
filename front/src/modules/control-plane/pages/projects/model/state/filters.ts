import { combine, createEvent, sample } from 'effector';

import * as filter from './filter';

const reset = createEvent();
const load = createEvent();

sample({
  clock: load,
  target: [filter.namespace.load],
});

sample({
  clock: reset,
  target: [filter.namespace.reset],
});

const $loading = combine(
  {
    namespaces: filter.namespace.$loading,
  },
  ({ namespaces }) => namespaces,
);

export { reset, load, $loading };
