import { sample } from 'effector';

import { ExperimentRenameDsModel } from '@/modules/control-plane/features/experiment/dataset/rename';

import { experiment } from '../../state';

sample({
  clock: ExperimentRenameDsModel.success,
  fn: ({ result }) => {
    return {
      link_id: result.link_id!,
      alias: result.alias!,
    };
  },
  target: experiment.ds.rename,
});
