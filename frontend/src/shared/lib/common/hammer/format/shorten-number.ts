import { typeGuard } from '@/shared/lib/common/type-guard';

import { orderOfMagnitude as getOrderOfMagnitude } from '../parser';

import { NO_VALUE } from './constants';
import { parseSetting } from './utils';

type UnitsMap = Record<1 | 1e3 | 1e6 | 1e9, string>;

const defaultUnitsMap: UnitsMap = {
  1: '',
  1e3: 'K',
  1e6: 'M',
  1e9: 'B',
};

export interface ShortenNumberSettings {
  delimiter?: string;
  lowerCaseSymbols?: boolean;
  unitOnly?: boolean;
  numberOnly?: boolean;
  unitsMap?: UnitsMap;
}

export const shortenNumber = (
  value: Maybe<string | number>,
  settings?: Maybe<ShortenNumberSettings>,
) => {
  const delimiter = parseSetting(settings, 'delimiter', ' ');
  const lowerCaseSymbols = parseSetting(settings, 'lowerCaseSymbols', false);
  const unitsMap = parseSetting(settings, 'unitsMap', defaultUnitsMap);
  const unitOnly = parseSetting(settings, 'unitOnly', false);
  const numberOnly = parseSetting(settings, 'numberOnly', false);

  if (typeGuard.isNumber(value)) {
    const sign = Math.sign(value);
    const orderOfMagnitude = getOrderOfMagnitude(Math.abs(value), {
      max: 1e9,
      min: 1,
    });
    const char = unitsMap[orderOfMagnitude as keyof UnitsMap];
    const number = Math.round(sign * Math.abs(value / orderOfMagnitude));
    const unitChar = lowerCaseSymbols ? char.toLowerCase() : char;

    if (unitOnly) return unitChar;
    if (numberOnly) return `${number}`;

    return `${number}${delimiter}${unitChar}`;
  } else {
    return NO_VALUE;
  }
};
