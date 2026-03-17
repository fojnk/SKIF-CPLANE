import { apiLib } from '@/shared/api';

import { NotificationExtraContent } from './types';

export const getResponseErrorNotificationData = (data: unknown) => {
  const response = apiLib.getResponse(data);
  const error = apiLib.getResponseError(data);

  const errorType =
    ((error?.http_status_code as Maybe<AnyObject>)?.type as Maybe<string>) ||
    response?.statusText ||
    '';

  const notificationData: NotificationExtraContent[] = [];

  if (errorType) {
    notificationData.push({
      text: errorType,
      className: 'font-bold',
    });
  }

  if (error?.external_message) {
    notificationData.push({
      label: 'Текст ошибки: ',
      text: error.external_message,
    });
  }

  if (error instanceof Error) {
    notificationData.push({
      label: 'Текст ошибки',
      text: error.message,
    });
  }

  return notificationData;
};
