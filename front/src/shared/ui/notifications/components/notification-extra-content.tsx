import { Text } from '@gravity-ui/uikit';

import { Label } from '@/shared/ui/label';

import type { NotificationExtraContent as NotificationExtraContentType } from '../types';

import css from './notification.module.scss';

export const NotificationExtraContent = ({
  content,
}: {
  content: NotificationExtraContentType;
}) => {
  return (
    <div className={css.notificationExtraContent}>
      {content.label && (
        <Text>
          <b>{content.label}</b>
        </Text>
      )}
      {content.type === 'copy' ? (
        <Label
          type="copy"
          ellipsis
          wordBreak
          copyText={content.text}
          className={content.className}
        >
          {content.text}
        </Label>
      ) : (
        <Text className={content.className}>{content.text}</Text>
      )}
    </div>
  );
};
