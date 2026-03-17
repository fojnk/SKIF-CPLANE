import { parseInt } from 'lodash-es';

import { getFromStorage, setToStorage } from '@/shared/lib/common/storage';
import { typeGuard } from '@/shared/lib/common/type-guard';

export const defaultPageFiltersSize = 15;
export const pageFiltersSizeOptions = [15, 25, 50, 100];
export const showFiltersBottomLength = 5;

export type PageFiltersDataT<T> = T & {
  page: number;
  pageSize: number;
};

export type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[];

const SEPARATOR = '|S|';
const VALUE_SEPARATOR = '|V|';
const MULTI_SEPARATOR = '|T|';
const MULTI_EMPTY = '|E|';

export const getPageSizeData = (prefix: string, rawSize: string) => {
  const parsed = parseInt(rawSize, 10);

  if (!isNaN(parsed)) {
    return parsed;
  }

  const stored = getFromStorage<string>({
    type: 'local',
    key: `${prefix}-list-size`,
  });

  if (typeGuard.isNull(stored)) {
    return defaultPageFiltersSize;
  }

  const parsedStored = parseInt(stored, 10);

  if (isNaN(parsedStored)) {
    return defaultPageFiltersSize;
  }

  return parsedStored;
};

const getMultiData = (_prefix: string, data: string) => {
  if (data === MULTI_EMPTY) {
    return [];
  }
  return data.split(MULTI_SEPARATOR).filter((item) => !!item);
};

const setMultiData = (key: string, data: any[]) =>
  `${key}${VALUE_SEPARATOR}${data.length === 0 ? MULTI_EMPTY : data.join(MULTI_SEPARATOR)}`;

const getObjectData = (_prefix: string, data: string) => {
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

const setObjectData = (key: string, data: object) =>
  `${key}${VALUE_SEPARATOR}${JSON.stringify(data)}`;

const keyMap = {
  page: {
    getter: (_prefix: string, rawPage: string) => {
      const parsed = parseInt(rawPage, 10);
      return isNaN(parsed) ? 1 : parsed;
    },
  },
  pageSize: {
    getter: getPageSizeData,
    store: (prefix: string, value: number) => {
      setToStorage({
        type: 'local',
        key: `${prefix}-list-size`,
        value,
      });
    },
  },
  check_ts_from: {
    getter: (_prefix: string, rawPage: string) => {
      const parsed = parseInt(rawPage, 10);
      return isNaN(parsed) ? 1 : parsed;
    },
  },
  check_ts_to: {
    getter: (_prefix: string, rawPage: string) => {
      const parsed = parseInt(rawPage, 10);
      return isNaN(parsed) ? 1 : parsed;
    },
  },
  tags: {
    getter: getMultiData,
    setter: setMultiData,
  },
  timestamp: {
    getter: getObjectData,
    setter: setObjectData,
  },
  itemIds: {
    getter: getObjectData,
    setter: setObjectData,
  },
} as Record<
  string,
  {
    store?: (prefix: string, value: unknown) => void;
    getter: (prefix: string, param: string) => FilterValue;
    setter?: (key: string, value: FilterValue) => string;
  }
>;

export const stringifyPageFiltersData = (data: Record<string, FilterValue>) =>
  Object.entries({ page: 1, ...data })
    .filter(([key, value]) => {
      if (value !== null && value !== undefined) {
        const isArray = Array.isArray(value);
        const getter = !!keyMap[key]?.getter;
        return isArray && getter ? true : isArray ? value.length > 0 : true;
      }

      return false;
    })
    .map(([key, value]) =>
      keyMap[key] && keyMap[key].setter
        ? keyMap[key].setter!(key, value)
        : `${key}${VALUE_SEPARATOR}${value}`,
    )
    .join(SEPARATOR);

export const getPageFiltersData = <T>(
  prefix: string,
  pageData: string | null,
) => {
  const data =
    pageData?.split(SEPARATOR)?.reduce(
      (acc, dataItem) => {
        const [key, value] = dataItem.split(VALUE_SEPARATOR);
        acc[key] = keyMap[key] ? keyMap[key].getter(prefix, value) : value;
        return acc;
      },
      {} as Record<string, FilterValue>,
    ) || {};

  if (!data.page) {
    data.page = 1;
  }

  if (!data.pageSize) {
    data.pageSize = getPageSizeData(prefix, '');
  }

  return data as T;
};

export const setPageFiltersData = <T>(
  prefix: string,
  data: PageFiltersDataT<T>,
) => {
  Object.entries(data).forEach(([key, value]) => {
    keyMap[key]?.store?.(prefix, value);
  });

  return stringifyPageFiltersData(data);
};
