import { Event, EventCallable, Store } from 'effector';
import { ComponentType } from 'react';

export type ModalViewProps<Payload = unknown> = {
  payload: Payload;
  open: boolean;
  onClose: VoidFunction;
  reset: VoidFunction;
};

export interface ModalModel<Payload = unknown> {
  $existOnlyIf: Store<boolean>;
  $payload: Store<Payload | null>;
  $isOpened: Store<boolean>;
  close: EventCallable<void>;
  open: EventCallable<Payload>;
  closed: Event<void>;
  opened: Event<void>;
  reset: EventCallable<void>;
}

export interface Modal<Payload = unknown> extends ModalModel<Payload> {
  id: string;
  view: ComponentType<ModalViewProps>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModalPayload<T extends ModalModel<any>> =
  T extends ModalModel<infer Payload> ? Payload : never;

export interface ModalConfiguration<ViewProps extends ModalViewProps> {
  view: () => Promise<ComponentType<ViewProps>>;
  existOnlyIf?: Store<boolean>;
}
