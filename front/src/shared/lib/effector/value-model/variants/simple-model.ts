import { createEvent, createStore, sample } from 'effector';
import { isEqual } from 'lodash-es';

import { typeGuard } from '@/shared/lib/common/type-guard';
import { createCachedStore } from '@/shared/lib/effector/cached-store';

import {
  ValueModelBase,
  ValueModelCfgBase,
  ValueModelUnitShape,
} from '../types';

export interface SimpleModel<T> extends ValueModelBase<T> {
  '@@unitShape': ValueModelUnitShape<SimpleModel<T>>;
  __: AnyObject;
}

const simpleModelType = Symbol('simple-model');

export const createSimpleModel = <T>(
  defaultState: T,
  cfg: ValueModelCfgBase<T, 'simple'>,
): SimpleModel<T> => {
  const updateFilter =
    cfg?.update === 'strict'
      ? (update: T, current: T) => !isEqual(update, current)
      : (update: T, current: T) => update !== current;

  const $value = cfg?.cache
    ? createCachedStore(defaultState, cfg?.cache, {
        updateFilter,
        skipVoid: false,
      })
    : createStore(defaultState, {
        updateFilter,
        skipVoid: false,
      });

  // $value.updates; // Side effect for subscription

  const setEvent = createEvent<T>();
  const clearEvent = createEvent();

  if (cfg?.transform) {
    sample({
      clock: setEvent,
      fn: cfg.transform,
      target: $value,
    });
  } else {
    sample({
      clock: setEvent,
      target: $value,
    });
  }

  sample({
    clock: clearEvent,
    fn: () => defaultState,
    target: $value,
  });

  const unitShape = {
    value: $value,
    set: setEvent,
    reset: clearEvent,
  };

  return {
    $value,
    set: setEvent,
    reset: clearEvent,
    updates: $value.updates,

    __: { unitShape, type: simpleModelType },

    '@@unitShape': () => unitShape,
  };
};

export const isSimpleModel = <T = any>(
  value: unknown,
): value is SimpleModel<T> =>
  typeGuard.isObject(value) &&
  typeGuard.isObject(value.__) &&
  value.__.type === simpleModelType;
