import { Mutation, Query } from '@farfetched/core';
import { Toaster } from '@gravity-ui/uikit';
import { createEvent, Effect, Event, is, sample } from 'effector';

import { generateId } from '@/shared/lib/common/id';
import { ms } from '@/shared/lib/common/ms';

import { Notification } from './components';
import { getResponseErrorNotificationData } from './lib';
import {
  NotificationExtraContent,
  NotificationParams,
  RawNotification,
} from './types';

export const toaster = new Toaster();

export const push = createEvent<NotificationParams>();
export const close = createEvent<string>();
export const closeAll = createEvent();

push.watch((notification) =>
  toaster.add({
    theme: notification.type,
    content: <Notification payload={notification} />,
    name: notification.name || generateId(),
    autoHiding:
      notification.autoHiding ??
      (notification.type === 'danger' ? ms(15, 'sec') : undefined),
    actions: notification.actions,
  }),
);
close.watch((notificationId) => toaster.remove(notificationId));
closeAll.watch(() => toaster.removeAll());

export const attach = <P, R>(
  fx: Effect<P, R, any> | Query<P, R, any> | Mutation<P, R, any>,
  cfg: {
    success?: (payload: {
      params: P;
      result: R;
    }) => MaybeFalsy<RawNotification>;
    fail?: (payload: { params: P; error: any }) => MaybeFalsy<RawNotification>;
  },
) => {
  let id: string = '';

  let onDone: Event<{ params: P; result: R }>;
  let onFail: Event<{ params: P; error: any }>;

  if (is.effect(fx)) {
    onDone = fx.done;
    onFail = fx.fail;
  } else {
    onDone = (fx as Query<P, R, any>).finished.success;
    onFail = (fx as Query<P, R, any>).finished.failure;
  }
  // Side effect for subscription
  if (cfg.success) {
    sample({
      source: sample({
        clock: onDone,
        fn: (payload): Maybe<NotificationParams> => {
          const raw = cfg.success!(payload);

          if (!raw) return null;

          if (raw.unique && !id) {
            id = generateId();
          }

          return {
            ...raw,
            name:
              raw.name ||
              (raw.unique ? `notification-success-${id}` : undefined),
            type: raw.type || 'success',
          };
        },
      }),
      filter: Boolean,
      target: push,
    });
  }

  if (cfg.fail) {
    sample({
      source: sample({
        clock: onFail,
        fn: (payload): Maybe<NotificationParams> => {
          const raw = cfg.fail!(payload);

          if (!raw) return null;

          if (raw.unique && !id) {
            id = generateId();
          }

          const {
            title,
            unique,
            content,
            type,
            name,
            autoHiding = ms(15, 'sec'),
            extras = [],
          } = raw;

          return {
            title,
            content,
            name: name || (unique ? `notification-fail-${id}` : undefined),
            type: type || 'danger',
            autoHiding,
            extras: [
              ...extras,
              ...getResponseErrorNotificationData(payload.error),
            ].filter(Boolean) as NotificationExtraContent[],
          };
        },
      }),
      filter: Boolean,
      target: push,
    });
  }
};
