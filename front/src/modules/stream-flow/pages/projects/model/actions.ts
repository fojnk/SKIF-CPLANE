import { createEvent, sample } from 'effector';

import { ProjectCreateModel } from '@/modules/stream-flow/features/project/create';
import { ProjectPinModel } from '@/modules/stream-flow/features/project/pin';
import { ProjectUnpinModel } from '@/modules/stream-flow/features/project/unpin';

const createProject = createEvent();
const pinProject = createEvent<number>();
const unpinProject = createEvent<number>();

sample({
  clock: createProject,
  target: ProjectCreateModel.start,
});

sample({
  clock: pinProject,
  target: ProjectPinModel.start,
});

sample({
  clock: unpinProject,
  target: ProjectUnpinModel.start,
});

export { createProject, unpinProject, pinProject };
