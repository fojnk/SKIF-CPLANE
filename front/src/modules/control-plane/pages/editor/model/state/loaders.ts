import { combine } from 'effector';

import { experimentFormModel } from '@/modules/control-plane/entities/forms/experiment';
import { projectFormModel } from '@/modules/control-plane/entities/forms/project';

import * as cubes from './cubes';
import * as dataSource from './dataset';
import * as experiment from './experiment';
import * as namespace from './namespace';
import * as project from './project';
import * as schema from './schema';

export const $loading = combine(
  dataSource.$loading,
  namespace.$loading,
  experiment.$loading,
  project.$loading,
  schema.$loading,
  cubes.$loading,
  projectFormModel.$loading,
  experimentFormModel.$loading,
  (
    dataSourceLoading,
    namespaceLoading,
    experimentLoading,
    projectLoading,
    schemaLoading,
    cubeLoading,
    projectFormLoading,
    experimentFormLoading,
  ) =>
    dataSourceLoading ||
    namespaceLoading ||
    experimentLoading ||
    projectLoading ||
    schemaLoading ||
    cubeLoading ||
    projectFormLoading ||
    experimentFormLoading,
);

export const $pending = combine(
  dataSource.$pending,
  namespace.$pending,
  experiment.$pending,
  project.$pending,
  (dataSourcePending, namespacePending, experimentPending, projectPending) =>
    dataSourcePending ||
    namespacePending ||
    experimentPending ||
    projectPending,
);
