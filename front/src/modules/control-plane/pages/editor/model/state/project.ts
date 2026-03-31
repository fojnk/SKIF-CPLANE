import { sample } from 'effector';

import { projectDataModel } from '@/modules/control-plane/entities/projects/single';
import { ProjectUpdateModel } from '@/modules/control-plane/features/project/update';
import { EDIT_CONFIG_RIGHT } from '@/modules/control-plane/pages/editor/constants';
import * as validator from '@/modules/control-plane/pages/editor/model/state/validator';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';
import { extractErrorMessage } from '@/modules/control-plane/shared/utils/getErrors';

import * as editor from './editor';
import { $currentConfig } from './editor';

const { load, $loading, reset, success, $error } = projectDataModel.create();

const {
  $pending,
  success: updated,
  updateProject,
  failure,
} = ProjectUpdateModel;

sample({
  clock: failure,
  fn: () => {
    return false;
  },
  target: editor.$valid,
});

sample({
  clock: failure,
  fn: ({ error }) => extractErrorMessage(error),
  target: validator.setError,
});

sample({
  clock: $error,
  target: editor.$error,
});

sample({
  clock: success,
  fn: (result) => {
    const project = result.result;
    const rights = project?.rights ?? [];

    if (!project) return null;

    const canEdit =
      rights?.some(
        (right: controlPlaneApi.dc.AclRightDC) => right === EDIT_CONFIG_RIGHT,
      ) || false;

    return {
      id: project.id!,
      name: project.name!,
      type: 'project' as const,
      canEdit,
      config: formatData(project.config || ''),
      project: {
        id: project.id!,
        name: project.name!,
      },
    };
  },
  target: editor.$data,
});

sample({
  clock: success,
  fn: ({ result }) => {
    return formatData(result.config || '');
  },
  target: $currentConfig,
});

sample({
  clock: updated,
  fn: ({ params }) => {
    return params.config ?? '';
  },
  target: editor.updateConfig,
});

export { load, $loading, reset, $pending, updateProject };
