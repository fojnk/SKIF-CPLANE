import { NoInfer, Store } from 'effector';

import {
  SimpleModel,
  StructModel,
} from '@/shared/lib/effector/value-model/variants';
import type { Router } from '@/shared/lib/routing';

export type QuerySyncValuePreset =
  | 'string[]'
  | 'number[]'
  | 'string'
  | 'boolean'
  | 'number'
  | 'json';

export type QuerySyncValuePresetConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deserialize: (query: AnyObject, field: string) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serialize: (value: any, field: string) => AnyObject;
};

export type QuerySyncModelConfig<
  Preset extends QuerySyncValuePreset,
  DefaultValue = any,
> = {
  router: Router;
  /**
   * Название поля в query параметрах
   */
  field: string;
  /**
   * Пресет работы с квери параметром
   */
  preset: Preset;
  /**
   * Задержка обновления в query параметрах URL адреса
   */
  delayUpdate?: number;
  method?: 'replace' | 'push';
  defaultState?: NoInfer<DefaultValue>;

  enabled?: Store<boolean>;
};

export type QuerySyncStringModel<T> = SimpleModel<T | null>;
export type QuerySyncNumberModel<T> = SimpleModel<T | null>;
export type QuerySyncStringArrModel<T> = SimpleModel<T | null>;
export type QuerySyncNumberArrModel<T> = SimpleModel<T | null>;
export type QuerySyncBooleanModel<T> = SimpleModel<T | null>;
export type QuerySyncJsonModel<T> = StructModel<Partial<T>>;
