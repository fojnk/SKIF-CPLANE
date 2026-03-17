import { sample, StoreWritable } from 'effector';

import { typeGuard } from '@/shared/lib/common/type-guard';
import { always } from '@/shared/lib/effector/always';
import { createLocalEvent } from '@/shared/lib/effector/create-local-event';
import { createValueModel } from '@/shared/lib/effector/value-model';
import { SimpleModel } from '@/shared/lib/effector/value-model/variants';

import { baseQueryParams } from '../../data';

import {
  QuerySyncBooleanModel,
  QuerySyncJsonModel,
  QuerySyncModelConfig,
  QuerySyncNumberModel,
  QuerySyncStringArrModel,
  QuerySyncStringModel,
  QuerySyncValuePreset,
  QuerySyncValuePresetConfig,
} from './types';

const presets: Record<QuerySyncValuePreset, QuerySyncValuePresetConfig> = {
  'string[]': {
    deserialize: (query, field) => query[field]?.split(',') ?? null,
    serialize: (value, field) => {
      if (!value || !value.length) return { [field]: undefined };
      return { [field]: value.join(',') };
    },
  },
  'number[]': {
    deserialize: (value, field): any => {
      const str = presets['string[]'].deserialize(value, field);
      if (!str) return str;
      const result: any[] = [];
      for (const value of str) {
        if (value !== '' && typeGuard.isNumber(+value)) {
          result.push(+value);
        }
      }
      return result;
    },
    serialize: (value, field): any =>
      presets['string[]'].serialize(value, field),
  },
  string: {
    deserialize: (query, field) => query[field] ?? null,
    serialize: (value, field) => {
      if (!value) return { [field]: undefined };
      return { [field]: value };
    },
  },
  boolean: {
    deserialize: (query, field) => query[field] === '1',
    serialize: (value, field) => {
      if (!value || value !== true) return { [field]: undefined };
      return { [field]: '1' };
    },
  },
  number: {
    deserialize: (query, field) => query[field] ?? null,
    serialize: (value, field) => {
      if (!value) return { [field]: undefined };
      return { [field]: value };
    },
  },
  json: {
    deserialize: (query, field) => {
      try {
        return JSON.parse(query[field] || '');
      } catch (_e) {
        return {};
      }
    },
    serialize: (value, field) => {
      if (!value || !Object.keys(value).length) return { [field]: undefined };
      return { [field]: JSON.stringify(value) };
    },
  },
};

export function querySyncModel<T extends string[]>(
  cfg: QuerySyncModelConfig<'string[]', T>,
): QuerySyncStringArrModel<T>;

export function querySyncModel<T extends boolean>(
  cfg: QuerySyncModelConfig<'boolean', T>,
): QuerySyncBooleanModel<T>;

export function querySyncModel<T extends number>(
  cfg: QuerySyncModelConfig<'number', T>,
): QuerySyncNumberModel<T>;

export function querySyncModel<T extends number[]>(
  cfg: QuerySyncModelConfig<'number[]', T>,
): QuerySyncNumberModel<T>;

export function querySyncModel<T extends string | null>(
  cfg: QuerySyncModelConfig<'string', T>,
): QuerySyncStringModel<T>;

export function querySyncModel<T extends AnyObject>(
  cfg: QuerySyncModelConfig<'json', T>,
): QuerySyncJsonModel<T>;

export function querySyncModel<T extends AnyObject | null>(
  cfg: QuerySyncModelConfig<'json', T>,
): QuerySyncJsonModel<T>;

export function querySyncModel<T>(
  cfg: QuerySyncModelConfig<QuerySyncValuePreset, T>,
): AnyObject {
  const $enabled = cfg.enabled || always(true);

  const { serialize, deserialize } = presets[cfg.preset]!;

  let dataModel: SimpleModel<T | null>;

  const calcInitialState = () => {
    return deserialize(baseQueryParams, cfg.field) ?? cfg.defaultState ?? null;
  };

  switch (cfg.preset) {
    case 'json': {
      // eslint-disable-next-line effector/no-getState
      const model = createValueModel<T | null>(calcInitialState(), {
        type: 'struct',
        update: 'strict',
      });

      dataModel = model as unknown as SimpleModel<T | null>;

      cfg.router.queryGlobalSync({
        source: sample({
          clock: model.update,
          source: model.$value,
        }),
        fn: (value) => serialize(value, cfg.field),
        delayUpdate: cfg.delayUpdate,
        method: cfg.method,
        enabled: $enabled,
      });

      break;
    }
    default: {
      // eslint-disable-next-line effector/no-getState
      dataModel = createValueModel<T | null>(calcInitialState());
      break;
    }
  }

  sample({
    clock: [
      cfg.router.$query,
      sample({
        clock: $enabled,
        filter: Boolean,
      }),
    ],
    source: cfg.router.$query,
    filter: $enabled,
    fn: (query) => deserialize(query, cfg.field),
    target: dataModel.$value as StoreWritable<T>,
  });

  cfg.router.queryGlobalSync({
    source: dataModel.set,
    fn: (value) => serialize(value, cfg.field),
    delayUpdate: cfg.delayUpdate,
    method: cfg.method,
    enabled: $enabled,
  });

  dataModel.reset = createLocalEvent((e) => {
    sample({
      clock: e,
      fn: () => cfg.defaultState ?? calcInitialState(),
      target: dataModel.set,
    });
  });

  return dataModel;
}
