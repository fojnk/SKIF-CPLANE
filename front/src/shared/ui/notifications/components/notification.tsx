import { Text } from '@gravity-ui/uikit';

import type { NotificationParams } from '../types';

import { NotificationExtraContent } from './notification-extra-content';
import css from './notification.module.scss';

export const Notification = ({ payload }: { payload: NotificationParams }) => {
  return (
    <div className={css.notification}>
      {payload.title && <Text variant="subheader-3">{payload.title}</Text>}
      {payload.content && (
        <Text className={css.notificationContentContainer}>
          {payload.content}
        </Text>
      )}
      {!!payload.extras?.length && payload.name !== 'hide error status' && (
        <div className={css.extras}>
          {payload.extras.map((content, i) => (
            <NotificationExtraContent content={content} key={i} />
          ))}
        </div>
      )}
    </div>
  );
};
