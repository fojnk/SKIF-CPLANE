import { Event, Store } from 'effector';

import { RouteInstance } from '@/shared/lib/routing';

export interface AppModule<R extends Record<string, RouteInstance<any>>> {
  $loaded: Store<boolean>;
  $active: Store<boolean>;
  loaded: Event<void>;
  unloaded: Event<void>;
  routes: R;
}
