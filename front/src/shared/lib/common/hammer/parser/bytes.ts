import BigNumber from 'bignumber.js';
import { findIndex } from 'lodash-es';

import { hammer } from '@/shared/lib/common/hammer';

export const BIN_NAMES = [
  'B',
  'KiB',
  'MiB',
  'GiB',
  'TiB',
  'PiB',
  'EiB',
  'ZiB',
  'YiB',
] as const;

export type BinaryByteUnit = (typeof BIN_NAMES)[number];

// export const DEC_NAMES = BIN_NAMES.map((it) => it.replace('i', ''));
/* 10^3 10^6 10^9 Kbyte Mbyte Gbyte (Système international d’unités) */
// export const SI_NUMBERS = DEC_NAMES.reduce<Record<ByteName, number>>(
//   (acc, name, i) => {
//     acc[name] = Math.pow(10, i + 3);
//     return acc;
//   },
//   {} as Record<ByteName, number>,
// );

/* 2^10 2^20 2^30 KiB MiB GiB (International Electrotechnical Commission) */
export const BIN_NUMBERS = BIN_NAMES.reduce(
  (acc, name, i) => {
    acc[name] = Math.pow(2, i * 10);
    return acc;
  },
  {} as Record<BinaryByteUnit, number>,
);

export function bytesByUnit(
  bytes: number | BigNumber | string,
  unit: BinaryByteUnit,
) {
  if (BigNumber.isBigNumber(bytes)) {
    return Math.floor(bytes.dividedBy(BIN_NUMBERS[unit]).toNumber());
  }

  const value = +bytes;

  if (isNaN(value)) return 0;

  return Math.floor(value / BIN_NUMBERS[unit]);
}

export function bytes(input: string): number {
  input = hammer.format.skipSpaces(input);

  const names = ['B', 'K', 'M', 'G', 'T', 'P', 'E'];
  const formatRegex = new RegExp(
    '^((\\d*[.])?\\d+)( *[' + names.join('') + '])(iB)?(/s)?$',
    'i',
  );

  if (formatRegex.test(input)) {
    const match = input.match(formatRegex)!;
    const value = match[1];
    const dimension = match[3].trim();
    const dimensionIndex = findIndex(
      names,
      (name) => name.toUpperCase() === dimension.toUpperCase(),
    );

    return Math.floor(Number(value) * Math.pow(2, 10 * dimensionIndex));
  } else {
    return Math.floor(Number(input));
  }
}
