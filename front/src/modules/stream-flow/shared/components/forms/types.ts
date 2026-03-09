export type ParamType =
  | 'integer'
  | 'double'
  | 'string'
  | 'boolean'
  | 'array'
  | 'kv'
  | 'custom'
  | 'struct';

export const PARAM_TYPES: ParamType[] = [
  'integer',
  'double',
  'string',
  'boolean',
  'array',
  'kv',
  'struct',
  'custom',
];

export const PARAM_TYPE_LABELS: Record<ParamType, string> = {
  integer: 'int',
  double: 'double',
  string: 'str',
  boolean: 'bool',
  array: 'arr',
  kv: 'kv',
  struct: 'STRUCT',
  custom: 'custom',
};
