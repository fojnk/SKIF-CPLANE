import { typeGuard } from '@/shared/lib/common/type-guard';

export const compose =
  (...fns: MaybeFalsy<AnyFunction>[]) =>
  (value: any) => {
    for (const fn of fns) {
      if (typeGuard.isFunction(fn)) {
        const result = fn(value);
        if (result) {
          return result;
        }
      }
    }
  };
