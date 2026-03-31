import { sample } from 'effector';

import { experimentsModel } from '@/modules/control-plane/entities/experiments';
import { ExperimentUpdateModel } from '@/modules/control-plane/features/experiment/update';
import { EDIT_CONFIG_RIGHT } from '@/modules/control-plane/pages/editor/constants';
import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';
import { extractErrorMessage } from '@/modules/control-plane/shared/utils/getErrors';

import * as editor from './editor';
import { $currentConfig } from './editor';
import * as validator from './validator';

const { load, $loading, reset, success, $error } =
  experimentsModel.single.create();
const {
  $pending,
  success: updated,
  updateExperiment,
  failure,
} = ExperimentUpdateModel;

sample({
  clock: failure,
  fn: () => {
    return false;
  },
  target: editor.$valid,
});

sample({
  clock: failure,
  fn: ({ error }) => {
    return extractErrorMessage(error);
  },
  target: validator.setError,
});

sample({
  clock: $error,
  target: editor.$error,
});

sample({
  clock: success,
  fn: (result) => {
    const data = result.result;
    if (!data) return null;

    const canEdit =
      data.rights?.some(
        (right: controlPlaneApi.dc.AclRightDC) => right === EDIT_CONFIG_RIGHT,
      ) || false;

    return {
      id: data.id!,
      name: data.name!,
      type: 'pipe' as const,
      canEdit,
      config: formatData(data.config || ''),
      additional_information: data.additional_information || '',
      project: data.project_id
        ? {
            id: data.project_id,
            name: data.project_name ?? 'no name',
          }
        : undefined,
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

// Инициализируем cubeConfig (additional_information)
sample({
  clock: success,
  fn: ({ result }) => {
    return result.additional_information || '';
  },
  target: editor.setCurrentCubeConfig,
});

// Сохраняем начальный cubeConfig (не меняется при редактировании)
sample({
  clock: success,
  fn: ({ result }) => {
    return result.additional_information || '';
  },
  target: editor.setInitialCubeConfig,
});

sample({
  clock: updated,
  fn: ({ params }) => {
    return params.config ?? '';
  },
  target: editor.updateConfig,
});

// Обновляем cubeConfig после успешного сохранения
sample({
  clock: updated,
  fn: ({ params }) => {
    return params.additional_information ?? '';
  },
  target: editor.updateCubeConfig,
});

export { load, $loading, reset, updated, updateExperiment, $pending };
