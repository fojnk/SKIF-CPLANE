import { sample } from 'effector';

import { dataSourceDataModel } from '@/modules/stream-flow/entities/datasets/single-ds';
import { DsUpdateModel } from '@/modules/stream-flow/features/dataset/update';
import {
  EDIT_CONFIG_RIGHT,
  EDIT_SCHEMA_RIGHT,
} from '@/modules/stream-flow/pages/editor/constants';
import * as validator from '@/modules/stream-flow/pages/editor/model/state/validator';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { formatData } from '@/modules/stream-flow/shared/utils/formatData';
import { extractErrorMessage } from '@/modules/stream-flow/shared/utils/getErrors';

import * as editor from './editor';
import * as query from './query';

const {
  load,
  $loading,
  reset,
  success,
  $error,
  $data: $datasetData,
} = dataSourceDataModel.create();
const { $pending, success: updated, updateDataset, failure } = DsUpdateModel;

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
  source: query.entity.$value,
  fn: (entity, result) => {
    const response = result.result;
    const data = response;
    const rights = response?.rights;

    if (!data) return null;

    const canEdit =
      rights?.some((right: streamFlowApi.dc.AclRightDC) => {
        if (entity === 'ds') {
          return right === EDIT_CONFIG_RIGHT;
        } else if (entity === 'ds2') {
          return right === EDIT_SCHEMA_RIGHT;
        }
        return false;
      }) || false;

    return {
      id: data.id!,
      name: data.name!,
      type: entity!,
      canEdit,
      config:
        entity === 'ds'
          ? formatData(data.params ?? '')
          : formatData(data.schema ?? ''),
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
  source: query.entity.$value,
  fn: (entity, result) => {
    const response = result.result;
    const data = response;

    if (!data) return '';

    return entity === 'ds'
      ? formatData(data.params ?? '')
      : formatData(data.schema ?? '');
  },
  target: editor.$currentConfig,
});

sample({
  clock: updated,
  source: query.entity.$value,
  fn: (entity, { params }) => {
    if (entity === 'ds') return params.params ?? '';
    else return params.schema ?? '';
  },
  target: editor.updateConfig,
});

export {
  load,
  $loading,
  reset,
  $pending,
  updated,
  updateDataset,
  $datasetData,
};
