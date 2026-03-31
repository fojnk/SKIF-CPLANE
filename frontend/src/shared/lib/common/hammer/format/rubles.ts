import { shortenNumber, ShortenNumberSettings } from './shorten-number';

export const rubles = (
  value: Maybe<string | number>,
  settings?: Maybe<Omit<ShortenNumberSettings, 'unitsMap'>>,
) => {
  return shortenNumber(value, {
    ...settings,
    unitsMap: {
      1: '',
      1e3: 'тыс.руб',
      1e6: 'млн.руб',
      1e9: 'млрд.руб',
    },
  });
};
