import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { NsRemoveModel } from '@/modules/stream-flow/features/namespace/remove';
import { NsRenameModel } from '@/modules/stream-flow/features/namespace/rename';
import { NsUpdateModel } from '@/modules/stream-flow/features/namespace/update';

import * as namespace from '../state/namespace';
const view = SFModule.routes.namespace.view;

sample({
  clock: NsRenameModel.success,
  source: namespace.$data,
  filter: view.$mounted,
  fn: (currentData, renameResult) => {
    if (!currentData) return currentData;
    return {
      ...currentData,
      name: renameResult.result.name!,
    };
  },
  target: namespace.updateData,
});

sample({
  clock: NsUpdateModel.success,
  source: namespace.$data,
  filter: view.$mounted,
  fn: (currentData, updateResult) => {
    if (!currentData) return currentData;
    return {
      ...currentData,
      config: updateResult.result.config,
    };
  },
  target: namespace.updateData,
});

sample({
  clock: NsRemoveModel.success,
  filter: view.$mounted,
  target: SFModule.routes.namespaces.navigate.prepend(() => {
    return {
      replace: false,
      params: {},
      query: {},
    };
  }),
});
