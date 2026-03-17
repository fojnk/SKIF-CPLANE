import { createEvent, sample } from 'effector';

import { MultilineEditorPayload } from '@/modules/control-plane/features/monaco/multiline-editor/types';
import { modalsModel } from '@/shared/ui/modals';

const modal = modalsModel.register<MultilineEditorPayload>({
  view: async () => (await import('../ui')).Modal,
});

const start = createEvent<MultilineEditorPayload>();

sample({
  clock: start,
  target: modal.open,
});

export { start, modal };
