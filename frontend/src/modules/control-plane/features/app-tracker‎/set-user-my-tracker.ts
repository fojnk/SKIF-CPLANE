export function setUserMyTracker(userId: string) {
  if (typeof window === 'undefined') {
    return;
  }
  const _tmr = (window as any)._tmr || ((window as any)._tmr = []);
  const events = [{ type: 'setUserID', userid: userId }];
  if (_tmr.splice) {
    _tmr.splice(0, 0, ...events);
  } else {
    events.forEach((event) => _tmr.push(event));
  }
}

export function setUserWithPageMyTracker(userId: string, counter: number) {
  if (typeof window === 'undefined') {
    return;
  }
  const _tmr = (window as any)._tmr || ((window as any)._tmr = []);
  const events = [
    { type: 'setUserID', userid: userId },
    {
      id: String(counter),
      type: 'pageView',
      start: new Date().getTime(),
      userid: userId,
    },
  ];
  if (_tmr.splice) {
    _tmr.splice(0, 0, ...events);
  } else {
    events.forEach((event) => _tmr.push(event));
  }
}
