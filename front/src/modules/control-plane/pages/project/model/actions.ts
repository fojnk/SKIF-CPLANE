import { combine, createEvent, sample } from 'effector';

import { CloneModel, ClonePayload } from '@/modules/control-plane/features/clone';
import { DsCreateModel } from '@/modules/control-plane/features/dataset/create';
import { DsDeleteModel } from '@/modules/control-plane/features/dataset/delete';
import {
  DsEditPayload,
  DsEditModel,
} from '@/modules/control-plane/features/dataset/edit';
import { ExperimentApplyModel } from '@/modules/control-plane/features/experiment/apply';
import { ExperimentCreateModel } from '@/modules/control-plane/features/experiment/create';
import { ExperimentAddDsModel } from '@/modules/control-plane/features/experiment/dataset/add';
import { ExperimentRemoveDsModel } from '@/modules/control-plane/features/experiment/dataset/remove';
import { ExperimentRenameDsModel } from '@/modules/control-plane/features/experiment/dataset/rename';
import { ExperimentDeleteModel } from '@/modules/control-plane/features/experiment/delete';
import { ExperimentRenameModel } from '@/modules/control-plane/features/experiment/rename';
import { ExperimentRunModel } from '@/modules/control-plane/features/experiment/run';
import { ExperimentStopModel } from '@/modules/control-plane/features/experiment/stop';
import { navigationModel } from '@/modules/control-plane/features/navigation';
import { ProjectDeleteModel } from '@/modules/control-plane/features/project/delete';
import { ProjectRenameModel } from '@/modules/control-plane/features/project/rename';
import { DataPair, EditorModeType } from '@/modules/control-plane/shared/types';

const renameProject = createEvent<{
  id: number;
  name: string;
  description?: string;
}>();

const editProjectConfig = createEvent<{
  project: DataPair;
  mode?: EditorModeType;
}>();
const editExperimentConfig = createEvent<{
  project: DataPair;
  experiment: DataPair;
  mode?: EditorModeType;
}>();
const editDatasetConfig = createEvent<{
  project: DataPair;
  dataSource: DataPair;
  config: boolean;
  mode?: EditorModeType;
}>();

const removeProject = createEvent<DataPair>();
const createExperiment = createEvent<number>();
const createDataset = createEvent<number>();
const removeExperiment = createEvent<{ experiment_id: number; name: string }>();
const removeDataset = createEvent<DataPair>();
const renameExperiment = createEvent<{
  experiment_id: number;
  name: string;
  description: string;
}>();
const editDataset = createEvent<DsEditPayload>();
const addExperimentDataset = createEvent<{ experiment_id: number }>();
const removeExperimentDataset = createEvent<{
  experiment_id: number;
  alias: string;
  link_id: number;
}>();
const renameExperimentDataset = createEvent<{
  experiment_id: number;
  alias: string;
  link_id: number;
}>();
const applyConfig = createEvent<{ experiment_id: number; name: string }>();
const stopExperiment = createEvent<number>();
const runExperiment = createEvent<number>();
const clone = createEvent<ClonePayload>();

sample({
  clock: renameProject,
  target: ProjectRenameModel.start,
});

sample({
  clock: removeProject,
  target: ProjectDeleteModel.start,
});

sample({
  clock: createExperiment,
  fn: (project_id: number) => {
    return {
      project_id,
    };
  },
  target: ExperimentCreateModel.start,
});

sample({
  clock: createDataset,
  fn: (project_id: number) => {
    return {
      project_id,
    };
  },
  target: DsCreateModel.start,
});

sample({
  clock: removeExperiment,
  target: ExperimentDeleteModel.start,
});

sample({
  clock: removeDataset,
  target: DsDeleteModel.start,
});

sample({
  clock: renameExperiment,
  target: ExperimentRenameModel.start,
});

sample({
  clock: clone,
  target: CloneModel.start,
});

sample({
  clock: editDataset,
  target: DsEditModel.start,
});

sample({
  clock: addExperimentDataset,
  target: ExperimentAddDsModel.start,
});

sample({
  clock: removeExperimentDataset,
  target: ExperimentRemoveDsModel.start,
});

sample({
  clock: renameExperimentDataset,
  target: ExperimentRenameDsModel.start,
});

sample({
  clock: applyConfig,
  target: ExperimentApplyModel.start,
});
sample({
  clock: stopExperiment,
  target: ExperimentStopModel.start,
});
sample({
  clock: runExperiment,
  target: ExperimentRunModel.start,
});

const $pendingExperiment = combine(
  ExperimentRunModel.$pending,
  ExperimentStopModel.$pending,
  ExperimentApplyModel.$pending,
  (isRunPending, isStopPending, isApplyPending) =>
    isRunPending || isStopPending || isApplyPending,
);

sample({
  clock: editProjectConfig,
  fn: ({ project, mode }) => {
    return {
      id: project.id,
      type: 'project' as const,
      bread: {
        type: 'project' as const,
        id: project.id,
        name: project.name,
      },
      mode: mode ?? ('code' as const),
    };
  },
  target: navigationModel.editor.navigate,
});

sample({
  clock: editExperimentConfig,
  fn: ({ project, experiment, mode }) => {
    return {
      id: experiment.id,
      type: 'pipe' as const,
      bread: {
        type: 'project' as const,
        id: project.id,
        name: project.name,
      },
      selected: {
        type: 'experiment' as const,
        id: experiment.id,
        name: experiment.name,
      },
      mode: mode ?? ('code' as const),
    };
  },
  target: navigationModel.editor.navigate,
});

sample({
  clock: editDatasetConfig,
  fn: ({ project, dataSource, config, mode }) => {
    return {
      id: dataSource.id,
      type: config ? ('ds' as const) : ('ds2' as const),
      bread: {
        type: 'project' as const,
        id: project.id,
        name: project.name,
      },
      selected: {
        type: 'dataset' as const,
        id: dataSource.id,
        name: dataSource.name,
      },
      mode: mode ?? ('code' as const),
    };
  },
  target: navigationModel.editor.navigate,
});

export {
  removeProject,
  renameProject,
  createExperiment,
  createDataset,
  removeExperiment,
  removeDataset,
  renameExperiment,
  editDataset,
  addExperimentDataset,
  removeExperimentDataset,
  renameExperimentDataset,
  applyConfig,
  stopExperiment,
  runExperiment,
  $pendingExperiment,
  clone,
  editProjectConfig,
  editExperimentConfig,
  editDatasetConfig,
};
