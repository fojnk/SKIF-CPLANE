import { sample } from 'effector';
import { noop } from 'lodash-es';

import { createValueModel } from '@/shared/lib/effector/value-model';

import { CounterConfig, CounterModel } from './types';

export const createCounterModel = (cfg: CounterConfig = {}): CounterModel => {
  const counter = createValueModel(cfg.initial ?? 0, {
    type: 'numeric',
    max: cfg.max,
    min: 0,
    cache: cfg.cache,
  });

  const onNextTick = sample({
    clock: counter.increment,
    source: counter.$value,
    filter: (counter) => cfg.max == null || counter < cfg.max,
    fn: noop,
  });

  const onLimit = sample({
    clock: counter.increment,
    source: counter.$value,
    filter: (counter) => cfg.max != null && counter === cfg.max,
    fn: noop,
  });

  return {
    $value: counter.$value,

    reset: counter.reset,
    increment: counter.increment,
    limit: counter.set.prepend(() => cfg.max ?? 0),

    onNextTick,
    onLimit,
  };
};
