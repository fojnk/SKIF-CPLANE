import { combine, createEvent, sample } from 'effector';

import * as filter from './filter';

const reset = createEvent();
const load = createEvent();

sample({
  clock: load,
  target: [filter.cluster.load, filter.namespace.load],
});

sample({
  clock: reset,
  target: [filter.cluster.reset, filter.namespace.reset],
});

const $loading = combine(
  {
    clusters: filter.cluster.$loading,
    namespaces: filter.namespace.$loading,
  },
  ({ clusters, namespaces }) => clusters || namespaces,
);

export { reset, load, $loading };
