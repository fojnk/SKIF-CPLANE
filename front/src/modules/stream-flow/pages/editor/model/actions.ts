import { createEvent, sample } from 'effector';

import { navigationModel } from '@/modules/stream-flow/features/navigation';
import { EditorDataDC } from '@/modules/stream-flow/shared/types';

export const onCancel = createEvent<EditorDataDC>();

sample({
  clock: onCancel,
  filter: (data: EditorDataDC) => data.type === 'ns',
  fn: (data: EditorDataDC) => {
    return {
      id: data.id,
      name: data.name,
      tab: 'config' as const,
    };
  },
  target: navigationModel.namespace.navigate,
});

sample({
  clock: onCancel,
  filter: (data: EditorDataDC) => data.type === 'project',
  fn: (data: EditorDataDC) => {
    return {
      id: data.id,
      name: data.name,
      tab: 'config' as const,
    };
  },
  target: navigationModel.project.navigate,
});

sample({
  clock: onCancel,
  filter: (data: EditorDataDC) =>
    (data.type === 'ds' || data.type === 'ds2') && Boolean(data.project),
  fn: (data: EditorDataDC) => {
    return {
      id: data.project!.id,
      name: data.project!.name,
      selected: {
        type: 'dataset' as const,
        id: data.id,
        name: data.name,
        dsTab: data.type === 'ds' ? ('config' as const) : ('schema' as const),
      },
    };
  },
  target: navigationModel.project.navigate,
});

sample({
  clock: onCancel,
  filter: (data: EditorDataDC) => data.type === 'pipe' && Boolean(data.project),
  fn: (data: EditorDataDC) => {
    return {
      id: data.project!.id,
      name: data.project!.name,
      selected: {
        type: 'experiment' as const,
        id: data.id,
        name: data.name,
        pipeTab: 'config' as const,
      },
    };
  },
  target: navigationModel.project.navigate,
});

sample({
  clock: onCancel,
  filter: (data: EditorDataDC) =>
    (data.type === 'ds' || data.type === 'ds2' || data.type === 'pipe') &&
    !data.project,
  target: navigationModel.projects.navigate,
});
