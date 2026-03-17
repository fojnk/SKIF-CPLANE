/**
 * Adds leading symbols to input
 */
export const strPad = function (
  str: Maybe<string | number>,
  padStr?: Maybe<string>,
  length?: Maybe<number>,
  right?: boolean,
) {
  str = String(str);
  length = length || 2;
  if (str.length >= length || !padStr || !padStr.length) {
    return str;
  }
  const tailLength = length - str.length;
  while (padStr.length < tailLength) {
    padStr += padStr;
  }
  padStr = padStr.substr(0, tailLength);
  return right ? str + padStr : padStr + str;
};
