import { integer } from './integer';
import { min } from './min';
import { minLength } from './min-length';
import { numeric } from './numeric';
import { required } from './required';

export const requiredPositiveInteger = (value: any) =>
  required(value) || numeric(value) || integer(value) || min(value, 0);

export const requiredArrayWithLength = (value: any) =>
  required(value) || minLength(value, 1);
