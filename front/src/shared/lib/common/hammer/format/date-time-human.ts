import { Moment } from 'moment';

import { dateTime } from './date-time';

export const dateTimeHuman = (value: Maybe<string | number | Moment>) =>
  dateTime(value, { format: 'human' });
