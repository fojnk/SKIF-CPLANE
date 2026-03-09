import { createEvent, sample } from 'effector';

import { NsRemoveModel } from '@/modules/stream-flow/features/namespace/remove';
import { NsRenameModel } from '@/modules/stream-flow/features/namespace/rename';
import { navigationModel } from '@/modules/stream-flow/features/navigation';
import { DataPair } from '@/modules/stream-flow/shared/types';

const rename = createEvent<DataPair>();
const remove = createEvent<DataPair>();
const editConfig = createEvent<DataPair>();

sample({
  clock: rename,
  target: NsRenameModel.start,
});

sample({
  clock: remove,
  target: NsRemoveModel.start,
});

sample({
  clock: editConfig,
  fn: (data) => {
    return {
      type: 'ns' as const,
      id: data.id!,
      bread: {
        type: 'namespace' as const,
        id: data.id!,
        name: data.name!,
      },
      mode: 'code' as const,
    };
  },
  target: navigationModel.editor.navigate,
});

export { remove, rename, editConfig };
