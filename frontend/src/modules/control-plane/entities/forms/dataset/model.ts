import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ParamsDC } from '@/modules/control-plane/shared/types';

const Query = createQuery({
  async handler(params: { type: string }) {
    const response = await controlPlaneApi.form.v2FormsDatasetList(params);
    return response.data;
  },
});

const createCacheKey = (type: string): string => type;

const load = createEvent<{ type: string }>();
const reset = createEvent();

// Кэш для хранения схем параметров
const $cache = createStore<Record<string, ParamsDC[]>>({}).reset(reset);

// Состояние загрузки
const $loading = Query.$pending;
const $failed = Query.$failed;

// Загружаем данные
sample({
  clock: load,
  target: Query.start,
});

sample({
  clock: reset,
  target: Query.reset,
});

// Сохраняем загруженные данные в кэш
sample({
  clock: Query.finished.success,
  source: $cache,
  fn: (cache, { result, params }) => {
    const cacheKey = createCacheKey(params.type);
    const newData = result && result.params ? result.params : null;

    if (newData) {
      return { ...cache, [cacheKey]: newData };
    }

    return cache;
  },
  target: $cache,
});

export { $cache, $loading, $failed, load, reset, createCacheKey };
