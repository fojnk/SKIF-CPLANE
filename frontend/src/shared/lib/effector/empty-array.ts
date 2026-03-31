import { Store } from 'effector';

export const emptyArray = <T>($store: Store<T[] | null>): Store<boolean> =>
  $store.map((state) => !state || !state.length);
