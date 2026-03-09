import { sample } from 'effector';

import { ShowVersionModel } from '@/modules/stream-flow/features/version/show';

import { experiment, experimentVersions } from '../../state';

sample({
  clock: ShowVersionModel.versionRestored,
  target: [
    experiment.active.refresh,
    experimentVersions.updates.refresh,
    experimentVersions.current.reload,
    experimentVersions.list.reload,
  ],
});
