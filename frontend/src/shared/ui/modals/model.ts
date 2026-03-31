import { createEvent, createStore, sample } from 'effector';

import { generateId } from '@/shared/lib/common/id';
import { embeddedModel } from '@/shared/lib/complex/embedded';
import { always } from '@/shared/lib/effector/always';
import { createValueModel } from '@/shared/lib/effector/value-model';
import { loadable } from '@/shared/lib/react/loadable';
import { DialogSkeleton } from '@/shared/ui/skeletons/dialog-skeleton';

import { Modal, ModalConfiguration, ModalModel, ModalViewProps } from './types';

export const modals = createValueModel<Modal>([], {
  type: 'list',
});

export const register = <Payload>({
  view,
  existOnlyIf,
}: ModalConfiguration<ModalViewProps<Payload>>): ModalModel<Payload> => {
  const id = generateId();

  const openSwitch = createValueModel(false, { type: 'switch' });

  const open = createEvent<Payload>();

  const $payload = createStore<Payload | null>(null);
  const $existOnlyIf = existOnlyIf || always(true);

  const reset = createEvent();

  sample({
    clock: open,
    fn: (payload) => payload ?? ({} as unknown as Payload),
    target: [$payload, openSwitch.turnOn],
  });

  sample({
    clock: open,
    fn: () => ({ state: true, id }) as { state: boolean; id: string },
    target: embeddedModel.onModalToggle,
  });

  sample({
    clock: openSwitch.turnOff,
    fn: () => ({ state: false, id }) as { state: boolean; id: string },
    target: embeddedModel.onModalToggle,
  });

  const model: ModalModel<Payload> = {
    $existOnlyIf,
    $isOpened: openSwitch.$on,
    $payload,
    open,
    close: openSwitch.turnOff,
    closed: openSwitch.turnedOff,
    opened: openSwitch.turnedOn,
    reset,
  };

  const modal: Modal<Payload> = {
    ...model,
    view: loadable(view, DialogSkeleton) as Modal['view'],
    id,
  };

  sample({
    clock: reset,
    target: [$payload.reinit, openSwitch.reset],
  });

  modals.add(modal as Modal);

  return model;
};
