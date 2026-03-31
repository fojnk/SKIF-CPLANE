import { Store } from 'effector';

import { generateId } from '@/shared/lib/common/id';
import { createValueModel } from '@/shared/lib/effector/value-model';

export interface FlagsListModel {
  $empty: Store<boolean>;
  $size: Store<number>;
  $flagIds: Store<string[]>;
  connect: (store: Store<boolean>, id?: string) => void;
}

export const createFlagsListModel = (): FlagsListModel => {
  const flagsList = createValueModel<string>([], { type: 'list' });

  const connect = (store: Store<boolean>, id: string = generateId()) => {
    store.watch((state) => {
      if (state) {
        flagsList.add(id);
      } else {
        flagsList.delete(id);
      }
    });
  };

  return {
    $empty: flagsList.$empty,
    $size: flagsList.$size,
    $flagIds: flagsList.$value,
    connect,
  };
};
