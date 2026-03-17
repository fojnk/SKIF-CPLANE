export const toBase26 = function toBijectiveBase26(
  n: number | string,
  settings?: Maybe<AnyObject>,
) {
  let result = '';
  const startCharacter = settings?.uppercase ? 'A' : 'a';

  while (parseInt(n.toString(), 10) > 0) {
    n = +n - 1;
    result += String.fromCharCode(startCharacter.charCodeAt(0) + (n % 26));
    n /= 26;
  }

  return result.split('').reverse().join('');
};
