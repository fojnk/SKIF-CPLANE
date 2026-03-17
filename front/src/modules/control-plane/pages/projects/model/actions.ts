import { createEvent, sample } from 'effector';

import { ProjectCreateModel } from '@/modules/control-plane/features/project/create';
import { ProjectPinModel } from '@/modules/control-plane/features/project/pin';
import { ProjectUnpinModel } from '@/modules/control-plane/features/project/unpin';

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
