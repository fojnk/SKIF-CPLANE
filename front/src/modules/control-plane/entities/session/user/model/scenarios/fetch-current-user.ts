import { sample } from 'effector';

import { fetchCurrentUser } from '../events';
import { currentUserQuery } from '../requests';

sample({
  clock: fetchCurrentUser,
  target: currentUserQuery.start,
});
