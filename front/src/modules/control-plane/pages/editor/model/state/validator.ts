import { createEvent, createStore, sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { showErrorModel } from '@/modules/control-plane/features/editor/show-error';

const reset = createEvent();
const $errors = createStore<string | null>(null).reset(reset);
const openModal = createEvent<string>();
const showData = createEvent();
const setError = createEvent<string | null>();

sample({
  clock: openModal,
  target: showErrorModel.start,
});

sample({
  clock: setError,
  source: ControlPlaneModule.routes.editor.view.$mounted,
  filter: (isMounted, error) => error !== null && isMounted,
  fn: (_isMounted, error) => error!,
  target: [openModal, $errors],
});

sample({
  clock: showData,
  source: $errors,
  filter: Boolean,
  target: openModal,
});

export { $errors, reset, openModal, showData, setError };
