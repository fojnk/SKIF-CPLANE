import { createQuery } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { DatasetType, ParamsDC } from '@/modules/stream-flow/shared/types';

const Query = createQuery({
  async handler(params: { managed: boolean; type: DatasetType }) {
    const response = await streamFlowApi.form.v2FormsDatasetList(params);
    return response.data;
  },
});

// Создаем ключ для кэша
const createCacheKey = (type: DatasetType, managed: boolean): string =>
  `${type}-${managed}`;

const load = createEvent<{ managed: boolean; type: DatasetType }>();
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
    const cacheKey = createCacheKey(params.type, params.managed);
    const newData = result && result.params ? result.params : null;

    if (newData) {
      return { ...cache, [cacheKey]: newData };
    }

    return cache;
  },
  target: $cache,
});

export { $cache, $loading, $failed, load, reset, createCacheKey };
