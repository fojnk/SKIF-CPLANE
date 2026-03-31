import { createEvent, createStore, sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import {
  BreadParams,
  EditorNavigateParams,
  ProjectSelectedItem,
} from '@/modules/control-plane/features/navigation';
import {
  reset,
  $bread as $editorBread,
  $selected as $editorSelected,
} from '@/modules/control-plane/pages/editor/model/state/breadcrumbs';
import { $queryParams } from '@/modules/control-plane/pages/editor/model/state/query';

export { $queryParams };
export const navigate = createEvent<EditorNavigateParams>();
export const $bread = createStore<BreadParams | null>(null).reset(reset);
export const $selected = createStore<ProjectSelectedItem | null>(null).reset(
  reset,
);

sample({
  clock: navigate,
  fn: ({ bread }) => bread,
  target: $bread,
});

sample({
  clock: navigate,
  fn: ({ selected }) => selected || null,
  target: $selected,
});

sample({
  clock: $editorBread,
  target: $bread,
});
sample({
  clock: $editorSelected,
  target: $selected,
});

sample({
  clock: navigate,
  fn: ({ id, type, replace, mode }) => {
    return {
      replace: replace ?? false,
      params: {},
      query: {
        id,
        type,
        mode,
      },
    };
  },
  target: ControlPlaneModule.routes.editor.navigate,
});
