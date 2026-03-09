export function pageViewMyTracker(counter: number) {
  if (typeof window === 'undefined') {
    return;
  }
  const _tmr = (window as any)._tmr || ((window as any)._tmr = []);
  const events = [
    {
      id: String(counter),
      type: 'pageView',
      start: new Date().getTime(),
    },
  ];
  if (_tmr.splice) {
    _tmr.splice(0, 0, ...events);
  } else {
    events.forEach((event) => _tmr.push(event));
  }
}
