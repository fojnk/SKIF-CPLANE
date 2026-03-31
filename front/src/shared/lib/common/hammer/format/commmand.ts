// COPY-PASTED FROM https://github.com/xxorax/node-shell-escape
/* jshint ignore:start */
// jscs:disable
// return a shell compatible format
function shellescape(a: string[]) {
  const ret: string[] = [];

  a.forEach(function (s) {
    if (/[^A-Za-z0-9_/:=-]/.test(s)) {
      s = "'" + s.replace(/'/g, "'\\''") + "'";
      s = s
        .replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
        .replace(/\\'''/g, "\\'"); // remove non-escaped single-quote if there are enclosed between 2 escaped
    }
    ret.push(s);
  });

  return ret.join(' ');
}

/**
 * An array command parameters is converted to string.
 */
export const command = (value: string[]) => {
  return shellescape(value);
};
