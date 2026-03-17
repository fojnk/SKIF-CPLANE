import { ReactNode } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { validators } from '@/shared/lib/final-form';

export type FieldConfig<T extends string, Props extends AnyObject> = {
  type: T;
  props?: Props;
  field: string;
  renderOuterContent?: (props: FieldRenderProps<any>) => ReactNode;
  renderInnerContent?: (props: FieldRenderProps<any>) => ReactNode;
  /**
   * К какому типу приводить значение при пользовательском изменении
   */
  cast?: 'string' | 'number' | 'integer' | 'integerWithNegative';
  rules?: validators.BuildRules;
  initialValue?: any;
  defaultValue?: any;
};
