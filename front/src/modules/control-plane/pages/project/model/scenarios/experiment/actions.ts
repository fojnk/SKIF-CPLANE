import { sample } from 'effector';

import { ExperimentApplyModel } from '@/modules/control-plane/features/experiment/apply';
import { ExperimentRunModel } from '@/modules/control-plane/features/experiment/run';
import { ExperimentStopModel } from '@/modules/control-plane/features/experiment/stop';

import { experiment, experimentVersions } from '../../state';

sample({
  clock: ExperimentApplyModel.success,
  target: [experiment.list.refresh, experimentVersions.updates.refresh],
});

sample({
  clock: ExperimentRunModel.success,
  target: experiment.list.refresh,
});

sample({
  clock: ExperimentStopModel.success,
  target: experiment.list.refresh,
});
