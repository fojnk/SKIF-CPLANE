export function initMyTracker() {
  if (typeof window === 'undefined') {
    return;
  }

  (function (d: Document, w: Window, id: string) {
    if (d.getElementById(id)) {
      return;
    }
    const ts = d.createElement('script');
    ts.type = 'text/javascript';
    ts.async = true;
    ts.id = id;
    ts.src = 'https://top-fwz1.mail.ru/js/code.js';
    const f = function () {
      const s = d.getElementsByTagName('script')[0];
      s?.parentNode?.insertBefore(ts, s);
    };
    if ((w as any).opera == '[object Opera]') {
      d.addEventListener('DOMContentLoaded', f, false);
    } else {
      f();
    }
  })(document, window, 'tmr-code');
}
