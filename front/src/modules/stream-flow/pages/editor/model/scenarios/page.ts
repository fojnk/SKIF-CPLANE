import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { experimentFormModel } from '@/modules/stream-flow/entities/forms/experiment';
import { projectFormModel } from '@/modules/stream-flow/entities/forms/project';
import { ExperimentDebugModel } from '@/modules/stream-flow/features/experiment/debug';

import * as state from '../state';

const view = SFModule.routes.editor.view;

sample({
  clock: view.onMounted,
  source: state.query.$queryParams,
  filter: ({ id, entity }) => Boolean(entity === 'project' && id),
  fn: ({ id }) => parseInt(id!, 10),
  target: [state.project.load, projectFormModel.load],
});

sample({
  clock: view.onMounted,
  source: state.query.$queryParams,
  filter: ({ id, entity }) => Boolean(entity === 'ns' && id),
  fn: ({ id }) => parseInt(id!, 10),
  target: state.namespace.load,
});

sample({
  clock: view.onMounted,
  source: state.query.$queryParams,
  filter: ({ id, entity }) =>
    Boolean((entity === 'ds' || entity === 'ds2') && id),
  fn: ({ id }) => parseInt(id!, 10),
  target: state.dataSource.load,
});

sample({
  clock: view.onMounted,
  source: state.query.$queryParams,
  filter: ({ id, entity }) => Boolean(entity === 'pipe' && id),
  fn: ({ id }) => parseInt(id!, 10),
  target: [
    state.experiment.load,
    experimentFormModel.load,
    state.cubes.load,
    state.variables.load,
  ],
});

sample({
  clock: view.onMounted,
  source: state.query.$queryParams,
  filter: ({ entity }) => entity !== 'ns',
  fn: ({ entity }) => {
    if (entity === 'pipe') return 'experiment';
    if (entity === 'ds') return 'dataset';
    if (entity === 'ds2') return 'dataset_schema';
    return 'project';
  },
  target: state.schema.load,
});

sample({
  clock: view.onUnmounted,
  target: [
    state.project.reset,
    state.editor.reset,
    state.dataSource.reset,
    state.namespace.reset,
    state.experiment.reset,
    state.schema.reset,
    state.validator.reset,
    state.breadcrumbs.reset,
    state.cubes.reset,
    state.variables.reset,
    ExperimentDebugModel.reset,
  ],
});
