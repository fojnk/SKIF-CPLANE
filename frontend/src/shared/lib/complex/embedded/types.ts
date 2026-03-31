import { config } from './config';

export interface OneWebSideMenuItem {
  id: string;
  href: string;
  title: string;
  icon: string;
  current: boolean;
}

export interface OneWebSettings {
  theme: 'light' | 'dark';
}

export interface OneWebContext {
  tenant: 'dev' | 'prod';
}

export interface OneWebNotification {
  title: string;
  message: string;
  date: Date;
  iconUrl: string;
}

export type EventName = (typeof config.eventNames)[number];

export type PostMessageBase<Name extends EventName> = {
  [config.protocolKey]: typeof config.protocolName;
} & {
  [config.eventNameKey]: Name;
} & {
  metaData: { source: string };
};

export enum GoToKind {
  /**
   * Клиент сделал запрос навигации в контейнер
   */
  ClientRequest = 'client-request',
  /**
   * Случаи получения:
   * 1. Контейнер выполнил навигацию и уведомляет клиента обновиться
   * 2. Клиент сделал запрос навигации и тогда (.1)
   */
  WrapperNotify = 'wrapper-notify',
}

export type ListeningMessage = PostMessageBase<'listening'>;

export interface InitMessage extends PostMessageBase<'init'> {
  appName: string;
  settings: OneWebSettings;
  context: OneWebContext;
}

export type RenderedMessage = PostMessageBase<'rendered'>;

export interface SettingsChangeMessage
  extends PostMessageBase<'settings-change'>,
    OneWebSettings {}

export interface NotificationMessage
  extends PostMessageBase<'notification'>,
    OneWebNotification {}

export interface GoToMessage extends PostMessageBase<'goto'> {
  url: string;
  replace?: boolean;
  kind: GoToKind;
}

export interface ModalStateChangeMessage
  extends PostMessageBase<'modal-state-change'> {
  opened: boolean;
  modalName: string;
}

export interface SideMenuItemsSetMessage
  extends PostMessageBase<'side-menu-items-set'> {
  items: OneWebSideMenuItem[];
}

export interface UserEventMessage extends PostMessageBase<'user-event'> {
  id: string;
}

export type Message =
  | ListeningMessage
  | InitMessage
  | SettingsChangeMessage
  | NotificationMessage
  | GoToMessage
  | RenderedMessage
  | ModalStateChangeMessage
  | SideMenuItemsSetMessage
  | UserEventMessage;
