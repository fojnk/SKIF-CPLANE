import { createEvent, createStore, sample, createEffect } from 'effector';
import { debounce } from 'patronum';

import { router } from '@/routing/router';
import { setToStorage, getFromStorage } from '@/shared/lib/common/storage';
import { Theme } from '@/shared/lib/complex/theme';

import { config } from './config';
import {
  Message,
  GoToMessage,
  ModalStateChangeMessage,
  GoToKind,
  OneWebSideMenuItem,
  SideMenuItemsSetMessage,
  UserEventMessage,
} from './types';

type StoredSideMenuItem = OneWebSideMenuItem & { onClick?: () => void };

const onMessageReceived = createEvent<{
  message: Message;
  source: MessageEventSource | null;
}>();

export const onDebouncedMessageSend = createEvent<string>();
export const onSideMenuItemsChange = createEvent<StoredSideMenuItem[]>();
export const onGotoMessageSend = createEvent<string>();
export const onModalToggle = createEvent<{
  state: boolean;
  id: string;
}>();
export const $isEmbedded = createStore<boolean>(false);
export const $theme = createStore<Theme>('auto');
export const $appName = createStore<string>('');
export const $sideMenuItems = createStore<StoredSideMenuItem[]>([]);

export const checkEmbeddedFx = createEffect(() => {
  return window.self !== window.top;
});

export const handleUserActionFx = createEffect((fn: undefined | (() => void)) =>
  fn?.(),
);

export const sendRenderedFx = createEffect(() => {
  window.parent?.postMessage(
    {
      eventName: 'rendered',
      [config.protocolKey]: config.protocolName,
      metaData: { source: 'client' },
    },
    '*',
  );
});

export const sendMessageFx = createEffect((message: Message) => {
  window.parent?.postMessage(message, '*');
});

const initPostMessageFx = createEffect(() => {
  window.addEventListener(
    'message',
    (event: MessageEvent<Message | null | undefined>) => {
      const { data, source } = event;

      if (!data) {
        return;
      }
      const message = data;
      if (
        message[config.protocolKey] !== config.protocolName ||
        !config.eventNames.includes(message[config.eventNameKey])
      ) {
        return;
      }

      /* eslint-disable */
      console.log('income message:', message);
      /* eslint-enable */
      onMessageReceived({ message, source });
    },
  );
  window.parent?.postMessage(
    {
      eventName: 'listening',
      [config.protocolKey]: config.protocolName,
      metaData: { source: 'client' },
    },
    '*',
  );
});

sample({
  source: onSideMenuItemsChange,
  target: $sideMenuItems,
});

sample({
  clock: checkEmbeddedFx.done,
  fn: ({ result }) => result,
  target: $isEmbedded,
});

sample({
  source: $isEmbedded,
  filter: (isEmbedded) => isEmbedded,
  target: initPostMessageFx,
});

sample({
  source: $isEmbedded,
  filter: (isEmbedded) => {
    const redirectUrl = getFromStorage({
      type: 'local',
      key: 'embedded_redirect_url',
    });

    return isEmbedded && !!redirectUrl;
  },
  target: sendMessageFx.prepend(() => {
    const url = getFromStorage({
      type: 'local',
      key: 'embedded_redirect_url',
    }) as string;

    setToStorage({
      type: 'local',
      key: 'embedded_redirect_url',
      value: '',
    });

    /* eslint-disable */
    console.log('after login redirect url', url);
    /* eslint-enable */

    return {
      eventName: 'goto',
      protocol: config.protocolName,
      url,
      metaData: { source: 'client' },
      kind: GoToKind.ClientRequest,
    } as GoToMessage;
  }),
});

debounce({
  source: onDebouncedMessageSend,
  timeout: 0,
  target: onGotoMessageSend,
});

sample({
  source: {
    isEmbedded: $isEmbedded,
    appName: $appName,
    sideMenuItems: $sideMenuItems,
  },
  filter: ({ isEmbedded, appName }) => isEmbedded && Boolean(appName),
  fn: ({ appName, sideMenuItems }) => {
    return {
      eventName: 'side-menu-items-set',
      protocol: config.protocolName,
      items: sideMenuItems.map(
        ({ current, href, icon, id, title }) =>
          ({
            current,
            icon,
            href: href ? `/${appName}${href}` : '',
            title,
            id,
          }) satisfies OneWebSideMenuItem,
      ),
      metaData: { source: 'client' },
    } satisfies SideMenuItemsSetMessage;
  },
  target: sendMessageFx,
});

sample({
  clock: onGotoMessageSend,
  source: { isEmbedded: $isEmbedded, appName: $appName },
  filter: ({ isEmbedded }) => isEmbedded,
  fn: ({ appName }, url) => {
    const storedAppName = getFromStorage({
      type: 'local',
      key: 'embedded_app_name',
    });
    /* eslint-disable */
    console.log('goto url:', (appName || storedAppName) + url);
    /* eslint-enable */
    return {
      eventName: 'goto',
      protocol: config.protocolName,
      url: '/' + (appName || storedAppName) + url,
      metaData: { source: 'client' },
      kind: GoToKind.ClientRequest,
    } as GoToMessage;
  },
  target: sendMessageFx,
});

sample({
  clock: onModalToggle,
  source: $isEmbedded,
  filter: (isEmbedded) => isEmbedded,
  fn: (isEmbedded, { state: opened, id: modalName }) => {
    /* eslint-disable */
    console.log('modal toggle:', modalName, opened);
    /* eslint-enable */
    return {
      eventName: 'modal-state-change',
      protocol: config.protocolName,
      opened,
      modalName,
      metaData: { source: 'client' },
      kind: GoToKind.ClientRequest,
    } as ModalStateChangeMessage;
  },
  target: sendMessageFx,
});

sample({
  clock: onMessageReceived,
  source: { isEmbedded: $isEmbedded, sideMenuItems: $sideMenuItems },
  filter: ({ isEmbedded }, { message }) => {
    return (
      isEmbedded && message.eventName === 'user-event' && Boolean(message.id)
    );
  },
  fn: ({ sideMenuItems }, { message }) => {
    const actionId = (message as UserEventMessage).id;
    return sideMenuItems.find(({ id }) => id === actionId)?.onClick;
  },
  target: handleUserActionFx,
});

sample({
  clock: onMessageReceived,
  source: { isEmbedded: $isEmbedded, history: router.$history },
  filter: ({ isEmbedded, history }, { message }) => {
    if (!isEmbedded || message.eventName !== 'goto') {
      return false;
    }

    if (
      message.eventName == 'goto' &&
      message.kind === GoToKind.ClientRequest
    ) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return message.url !== history.location.pathname + history.location.search;
  },
  fn: ({ history }, { message }: { message: Message }) => {
    /* eslint-disable */
    console.log('income message url:', (message as GoToMessage).url);
    console.log('old url:', history.location.pathname + history.location.search);
    /* eslint-enable */
    return (message as GoToMessage).url;
  },
  target: router.push.prepend((path: string) => ({
    method: 'replace',
    path,
    params: {},
    query: {},
  })),
});

$theme.on(onMessageReceived, (theme, { message }) => {
  if (message.eventName === 'init') {
    const newTheme = message.settings.theme || theme;
    setToStorage({ type: 'local', key: 'embedded_theme', value: newTheme });
    return newTheme;
  }

  if (message.eventName === 'settings-change') {
    const newTheme = message.theme || theme;
    setToStorage({ type: 'local', key: 'embedded_theme', value: newTheme });
    return message.theme || theme;
  }

  setToStorage({ type: 'local', key: 'embedded_theme', value: theme });
  return theme;
});

$appName.on(onMessageReceived, (appName, { message }) => {
  if (message.eventName === 'init') {
    setToStorage({
      type: 'local',
      key: 'embedded_app_name',
      value: message.appName || appName,
    });
    return message.appName || appName;
  }

  return appName;
});
