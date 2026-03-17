import { Flex, Label, Text } from '@gravity-ui/uikit';
import { createEffect, sample } from 'effector';
import { ReactNode } from 'react';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { refreshSessionModel } from '@/modules/control-plane/entities/session/refresh';
import { userModel } from '@/modules/control-plane/entities/session/user';
import { httpRequestFailed, HttpResponse } from '@/shared/api';
import { notifications } from '@/shared/ui/notifications';

export const SFRequestFailFx = createEffect(
  ({ title, content }: { title: string; content?: ReactNode }) => {
    notifications.push({
      title,
      content,
      type: 'danger',
      name: 'hide error status',
    });
  },
);

const httpRequestFailedFx = createEffect(
  async (response: HttpResponse<unknown, unknown>) => {
    try {
      const error = await response.clone().json();
      return { error, response };
    } catch {
      return { error: response.error, response };
    }
  },
);

const notAuthRequestFailFx = createEffect(async () => {
  refreshSessionModel.refresh();
});

const userInfoFailFx = createEffect(async () => {
  userModel.reset();
  await ControlPlaneModule.routes.login.navigate({
    params: {},
    query: {},
    replace: true,
  });
});

sample({
  clock: httpRequestFailed,
  filter: (response) =>
    response.status !== 401 &&
    response.url.includes('_stream-flow') &&
    !response.url.includes('_stream-flow/api/v1/experiment/config/apply'),
  target: httpRequestFailedFx,
});

sample({
  clock: httpRequestFailed,
  source: ControlPlaneModule.routes.login.$isOpened,
  filter: (isLoginOpened, response) =>
    response.status === 401 &&
    !isLoginOpened &&
    !response.url.includes('/auth/refresh'),
  target: notAuthRequestFailFx,
});

sample({
  clock: httpRequestFailed,
  filter: (response) =>
    response.status === 500 && response.url.includes('/auth/who_am_i'),
  target: userInfoFailFx,
});

sample({
  clock: httpRequestFailedFx.doneData,
  fn: ({ response, error }) => {
    const requestId = response.headers?.get('X-Request-Id');
    const errorMessage =
      error && 'error' in error
        ? error.error
        : error && 'message' in error
          ? error.message
          : undefined;
    const content =
      requestId || errorMessage ? (
        <Flex
          direction="column"
          gapRow="2"
          wrap="nowrap"
          shrink={0}
          width="100%"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          {errorMessage && (
            <Text
              color="primary"
              ellipsis
              ellipsisLines={3}
              style={{ width: '100%' }}
            >
              {errorMessage}
            </Text>
          )}
          {requestId && (
            <Label type="copy" copyText={requestId} theme="clear">
              X-Request-Id
            </Label>
          )}
        </Flex>
      ) : undefined;
    if (response.status) {
      return {
        title: `${response.status} ${response.statusText ? response.statusText : ''}`,
        content,
      };
    }
    return {
      title: `Unknown Error`,
    };
  },
  target: SFRequestFailFx,
});
