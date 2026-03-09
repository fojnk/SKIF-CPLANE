import { sample } from 'effector';

import { reset } from '../events';
import { currentUserCapabilitiesQuery, currentUserQuery } from '../requests';

sample({
  clock: reset,
  target: [currentUserQuery.reset, currentUserCapabilitiesQuery.reset],
});
