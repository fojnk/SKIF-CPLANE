import { sample } from 'effector';

import { DatasetValidateModel } from '@/modules/stream-flow/features/dataset/validate';
import { ExperimentValidateModel } from '@/modules/stream-flow/features/experiment/validate';
import { ProjectValidateModel } from '@/modules/stream-flow/features/project/validate';
import * as editor from '@/modules/stream-flow/pages/editor/model/state/editor';
import * as validator from '@/modules/stream-flow/pages/editor/model/state/validator';

sample({
  clock: [
    DatasetValidateModel.success,
    ExperimentValidateModel.success,
    ProjectValidateModel.success,
  ],
  fn: ({ result }) => {
    return result.success ? null : result.errors ?? '';
  },
  target: validator.$errors,
});

sample({
  clock: [
    DatasetValidateModel.success,
    ExperimentValidateModel.success,
    ProjectValidateModel.success,
  ],
  filter: ({ result }) => result.success === false,
  fn: ({ result }) => {
    return result.errors ?? '';
  },
  target: validator.openModal,
});

sample({
  clock: [
    DatasetValidateModel.success,
    ExperimentValidateModel.success,
    ProjectValidateModel.success,
  ],
  filter: ({ result }) => result.success === false,
  fn: () => null,
  target: editor.$validatedConfig,
});

sample({
  clock: [DatasetValidateModel.success, ProjectValidateModel.success],
  filter: ({ result }) => result.success === true,
  fn: ({ params }) => params,
  target: editor.$validatedConfig,
});

sample({
  clock: [ExperimentValidateModel.success],
  filter: ({ result }) => result.success === true,
  fn: ({ params }) => params.experimentConfig,
  target: editor.$validatedConfig,
});

sample({
  clock: [
    DatasetValidateModel.success,
    ExperimentValidateModel.success,
    ProjectValidateModel.success,
  ],
  fn: ({ result }) => {
    return result.success ?? false;
  },
  target: editor.$valid,
});
