export const config = {
  protocolName: 'one-ui',
  protocolKey: 'protocol',
  eventNameKey: 'eventName',
  eventNames: [
    'listening',
    'init',
    'rendered',
    'side-menu-items-set',
    'settings-change',
    'notification',
    'goto',
    'close',
    'context-change',
    'modal-state-change',
    'user-event',
  ],
} as const;
