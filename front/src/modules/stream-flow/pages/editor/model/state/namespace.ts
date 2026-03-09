import { sample } from 'effector';

import { namespaceModel } from '@/modules/stream-flow/entities/namespaces/single';
import { NsUpdateModel } from '@/modules/stream-flow/features/namespace/update';
import { EDIT_CONFIG_RIGHT } from '@/modules/stream-flow/pages/editor/constants';
import * as validator from '@/modules/stream-flow/pages/editor/model/state/validator';
import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { formatData } from '@/modules/stream-flow/shared/utils/formatData';
import { extractErrorMessage } from '@/modules/stream-flow/shared/utils/getErrors';

import * as editor from './editor';
import { $currentConfig } from './editor';

const { load, $loading, reset, success, $error } = namespaceModel.create();
const { $pending, success: updated, updateNamespace, failure } = NsUpdateModel;
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
  fn: ({ result }) => {
    if (!result) return null;

    const canEdit =
      result.rights?.some(
        (right: streamFlowApi.dc.AclRightDC) => right === EDIT_CONFIG_RIGHT,
      ) || false;

    return {
      id: result.id!,
      name: result.name!,
      type: 'ns' as const,
      canEdit,
      config: formatData(result.config || ''),
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

export { load, $loading, reset, $pending, updateNamespace };
