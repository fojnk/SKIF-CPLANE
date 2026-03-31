import { combine, createEvent, sample, Store } from 'effector';

import { always } from '@/shared/lib/effector/always';
import { type Router } from '@/shared/lib/routing';

import { querySyncModel } from './query-sync-model';

type PathData<Path extends AnyObject> = {
  [K in keyof Path]: Path[K] | null;
};

export const createPathModel = <Path extends AnyObject>(config: {
  router: Router;
  deserialize: (segments: Maybe<string>[] | null) => PathData<Path> | null;
  serialize: (pathData: Partial<MaybeKeys<Path>>) => string;
  enabled?: Store<boolean>;
  method?: 'replace' | 'push';
  field?: string;
}) => {
  const $enabled = config.enabled == null ? always(true) : config.enabled;

  const queryPath = querySyncModel<string>({
    router: config.router,
    field: config.field ?? 'path',
    preset: 'string',
    method: config.method ?? 'push',
  });

  const $data = combine(queryPath.$value, $enabled, (path, enabled) => {
    const segments =
      enabled && path
        ? (((path || '') as string).split('/') as Maybe<string>[])
        : null;
    return config.deserialize(segments);
  });

  const updatePath = createEvent<Partial<MaybeKeys<Path>>>();

  const setPath = createEvent<Partial<MaybeKeys<Path>>>();

  const resetPath = setPath.prepend(() => ({}));

  sample({
    clock: setPath,
    filter: $enabled,
    fn: config.serialize,
    target: queryPath.set,
  });

  sample({
    clock: updatePath,
    source: $data,
    fn: (path, update) => ({
      ...path,
      ...update,
    }),
    target: setPath,
  });

  return {
    $data,
    update: updatePath,
    set: setPath,
    reset: resetPath,
  };
};
