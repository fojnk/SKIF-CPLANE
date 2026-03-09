import { combine } from 'effector';

import * as filters from './filters';
import * as list from './list';

export const $loading = combine(
  { list: list.$loading, filters: filters.$loading },
  ({ list, filters }) => list || filters,
);
